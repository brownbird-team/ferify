// @ts-check

const { UserError } = require('../utils/errors.js');
const { DatabaseContext } = require('../contexts/DatabaseContext.js');
const { TranslationContext } = require('../contexts/TranslationContext.js');
const { eq, and } = require('drizzle-orm');
const { ConfigContext } = require('../contexts/ConfigContext.js');
const { MailSenderService } = require('./MailSenderService.js');
const { CryptoService } = require('./CryptoService.js');

/** @typedef {import('../contexts/ConfigContext.js').Config} Config */
/** @typedef {import('../database/schema.js').UserRecord} UserRecord */

/**
 * @typedef {object} UserStatus
 * 
 * @property {string} userId
 * @property {boolean} verified
 * @property {boolean} locked
 */

/**
 * @typedef {object} VerificationStatus
 * 
 * @property {string[]} verified
 * @property {string[]} unverified
 */

class UserService {

    /** @private @type {Config} */
    config;
    /** @private @type {DatabaseContext} */
    dbctx;
    /** @private @type {TranslationContext} */
    translation;
    /** @private @type {MailSenderService} */
    sender;
    /** @private @type {CryptoService} */
    crypto;

    /**
     * @param {ConfigContext} configContext
     * @param {DatabaseContext} databaseContext
     * @param {TranslationContext} translationContext
     * @param {MailSenderService} mailSenderService
     * @param {CryptoService} cryptoService
     */
    constructor(configContext, databaseContext, translationContext, mailSenderService, cryptoService) {
        this.config = configContext.config;
        this.translation = translationContext;
        this.dbctx = databaseContext;
        this.sender = mailSenderService;
        this.crypto = cryptoService;
    }

    /**
     * Helper method used to fetch user from database by
     * its discord user ID
     * 
     * @private
     * @param {string} userId
     * @returns {Promise<UserRecord | null>}
     */
    async fetchUserById(userId) {
        const { db } = this.dbctx;
        const { users } = this.dbctx.schema;

        const res = await db.select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        return res.length > 0 ? res[0] : null;
    }

    /**
     * Helper method used to fetch user from database by
     * its email
     * 
     * @private
     * @param {string} email
     * @returns {Promise<UserRecord | null>}
     */
    async fetchVerifiedUserByEmail(email) {
        const { db } = this.dbctx;
        const { users } = this.dbctx.schema;

        const hash = this.crypto.hashEmail(email);

        const res = await db.select()
            .from(users)
            .where(and(eq(users.emailHash, hash), eq(users.verified, true)))
            .limit(1);

        return res.length > 0 ? res[0] : null;
    }

    /**
     * Get status object for specified user
     * 
     * @param {string} userId
     * @returns {Promise<UserStatus>}
     */
    async getStatus(userId) {
        /** @type {UserStatus} */
        const status = {
            userId: userId,
            verified: false,
            locked: false,
        }

        const user = await this.fetchUserById(userId);

        if (!user)
            return status;

        status.locked = user.locked;
        status.verified = user.verified;

        return status;
    }

    /**
     * Attempt to verify given user with given code
     * 
     * @param {string} userId 
     * @param {string} code
     * @returns {Promise<VerificationStatus>}
     */
    async verify(userId, code) {
        const { db } = this.dbctx
        const { users } = this.dbctx.schema;
        const t = this.translation.getGlobalTranslator();

        const user = await this.fetchUserById(userId);

        if (!user || !user.code)
            throw new UserError(t('errors.noVerificationCode'));
        if (user.verified)
            throw new UserError(t('errors.alreadyVerified'));
        if (user.code !== code || !user.codeCreated)
            throw new UserError(t('errors.invalidVerificationCode'));

        if (user.codeCreated) {
            const expires = new Date(user.codeCreated);
            expires.setSeconds(expires.getSeconds() + this.config.verificationCodeValidSeconds);

            if (new Date() > expires)
                throw new UserError(t('errors.verificationCodeExpired'));
        }

        // Fetch and remove anyone who was verified with this email
        const unverified = (
            await db.select()
                .from(users)
                .where(and(eq(users.emailHash, user.emailHash), eq(users.verified, true)))
        ).map(user => user.id);

        await db.update(users).set({ verified: false, locked: false })
            .where(eq(users.emailHash, user.emailHash));

        await db.update(users).set({ verified: true })
            .where(eq(users.id, user.id));

        const verified = [ user.id ];

        return { verified, unverified };
    }

    /**
     * Send verification code to given email for given user
     * 
     * @param {string} userId 
     * @param {string} email 
     */
    async sendCode(userId, email) {
        const { db } = this.dbctx;
        const { users, blacklist } = this.dbctx.schema;
        const t = this.translation.getGlobalTranslator();

        const user = await this.fetchUserById(userId);

        // If you are already verified
        if (user?.verified)
            throw new UserError(t('errors.alreadyVerified'));

        if (!this.crypto.checkEmail(email))
            throw new UserError(t('errors.emailInvalid'))

        const hash = this.crypto.hashEmail(email);
        const code = this.crypto.generateVerifyCode();

        const blacklistRec = (await db.select()
            .from(blacklist)
            .where(eq(blacklist.emailHash, hash)))?.[0];

        // If email address is blacklisted
        if (blacklistRec && blacklistRec.blacklisted)
            throw new UserError(t('errors.emailBlacklisted'));

        const emailOwnerRes = await db.select()
            .from(users)
            .where(and(eq(users.emailHash, hash), eq(users.verified, true)));

        // If somebody verified with this email and locked it
        if (emailOwnerRes.length > 0 && emailOwnerRes[0].locked)
            throw new UserError(t('errors.emailLocked', { unlockAlias: this.config.aliasUnlock }));
        
        // Else save verification code for this user and send an email
        await db.insert(users).values({
            id: userId,
            emailHash: hash,
            code: code,
            codeCreated: new Date(),
        })
        .onDuplicateKeyUpdate({
            set: {
                emailHash: hash,
                code: code,
                codeCreated: new Date(),
            }
        });

        // No await on purpose (no need for response to wait till email is sent)
        this.sender.sendVerification(email, code, emailOwnerRes.length > 0);
    }

    /**
     * Attempt to lock given user account
     * 
     * @param {string} userId
     */
    async lock(userId) {
        const { db } = this.dbctx;
        const { users } = this.dbctx.schema;
        const t = this.translation.getGlobalTranslator();

        const user = await this.fetchUserById(userId);

        if (!user || !user.verified)
            throw new UserError(t('errors.verificationRequired'));

        if (user.locked)
            throw new UserError(t('errors.alreadyLocked'));

        await db.update(users)
            .set({ locked: true })
            .where(eq(users.id, user.id));
    }

    /**
     * Attempt to unlock given user account
     * 
     * @param {string} userId 
     */
    async unlockById(userId) {
        const { db } = this.dbctx;
        const { users } = this.dbctx.schema;
        const t = this.translation.getGlobalTranslator();

        const user = await this.fetchUserById(userId);

        if (!user || !user.verified)
            throw new UserError(t('errors.verificationRequired'));

        if (!user.locked)
            throw new UserError(t('errors.alreadyUnlocked'));

        await db.update(users)
            .set({ locked: false })
            .where(eq(users.id, user.id));
    }

    /**
     * Attempt to unlock given user account, direct request
     * by email
     * 
     * @param {string} email 
     */
    async unlockByEmail(email) {
        const { db } = this.dbctx;
        const { users } = this.dbctx.schema;
        const t = this.translation.getGlobalTranslator();

        const user = await this.fetchVerifiedUserByEmail(email);

        if (!user || !user.locked)
            throw new UserError(t('errors.alreadyUnlocked'));

        await db.update(users)
            .set({ locked: false })
            .where(eq(users.id, user.id));

        this.sender.sendUnlocked(email);
    }

    /**
     * Add given email to blacklist
     * 
     * @param {string} email
     */
    async blacklist(email) {
        const { db } = this.dbctx;
        const { blacklist } = this.dbctx.schema;
        const t = this.translation.getGlobalTranslator();

        const hash = this.crypto.hashEmail(email);

        const rec = (await db.select()
            .from(blacklist)
            .where(eq(blacklist.emailHash, hash)))?.[0] || null;

        if (rec && rec.blacklisted)
            throw new UserError(t('errors.alreadyBlacklisted'));

        await db.insert(blacklist).values({
            id: rec?.id || undefined,
            emailHash: hash,
            blacklisted: true,
        }).onDuplicateKeyUpdate({
            set: {
                permanent: false,
                blacklisted: true,
            },
        });

        this.sender.sendBlacklisted(email);
    }

    /**
     * Remove given email from blacklist
     * 
     * @param {string} email 
     */
    async unblacklist(email) {
        const { db } = this.dbctx;
        const { blacklist } = this.dbctx.schema;
        const t = this.translation.getGlobalTranslator();

        const hash = this.crypto.hashEmail(email);

        const rec = (await db.select()
            .from(blacklist)
            .where(eq(blacklist.emailHash, hash)))?.[0] || null;

        if (!rec || !rec.blacklisted)
            throw new UserError(t('errors.alreadyUnblacklisted'));

        if (rec.permanent) {
            this.sender.sendUnblacklistDenied(email);
            return;
        }

        await db.update(blacklist)
            .set({ blacklisted: false })
            .where(eq(blacklist.id, rec.id));

        this.sender.sendUnblacklisted(email);
    }

    /**
     * Purge given discord account 
     * 
     * @param {string} userId 
     */
    async purgeAccount(userId) {
        const { db } = this.dbctx;
        const { users } = this.dbctx.schema;
        const t = this.translation.getGlobalTranslator();

        const user = await this.fetchUserById(userId);

        if (!user)
            throw new UserError(t('errors.alreadyPurged'));

        await db.delete(users).where(eq(users.id, user.id));
    }

    /**
     * Fetch array of all verified users ids
     * 
     * @returns {Promise<string[]>}
     */
    async fetchVerifiedUserIds() {
        const res = await this.dbctx.db.select({ id: this.dbctx.schema.users.id })
            .from(this.dbctx.schema.users)
            .where(eq(this.dbctx.schema.users.verified, true));

        return res.map(rec => rec.id);
    }
}

exports.UserService = UserService;