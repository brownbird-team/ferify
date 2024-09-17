// @ts-check

const { UserError } = require('../utils/errors.js');
const { DatabaseContext } = require('../contexts/DatabaseContext.js');
const { TranslationContext } = require('../contexts/TranslationContext.js');
const { eq } = require('drizzle-orm');
const { ConfigContext } = require('../contexts/ConfigContext.js');
const { MailSenderService } = require('./MailSenderService.js');

/** @typedef {import('../contexts/ConfigContext.js').Config} Config */
/** @typedef {import('../database/schema.js').UserRecord} UserRecord */

/**
 * @typedef {object} UserStatus
 * 
 * @property {string} userId
 * @property {boolean} verified
 * @property {boolean} locked
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

    /**
     * @param {ConfigContext} configContext
     * @param {DatabaseContext} databaseContext
     * @param {TranslationContext} translationContext
     * @param {MailSenderService} mailSenderService
     */
    constructor(configContext, databaseContext, translationContext, mailSenderService) {
        this.config = configContext.config;
        this.translation = translationContext;
        this.dbctx = databaseContext;
        this.sender = mailSenderService;
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
    async fetchUserByEmail(email) {
        const { db } = this.dbctx;
        const { users } = this.dbctx.schema;

        const res = await db.select()
            .from(users)
            .where(eq(users.id, email))
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
     * 
     * @param {string} userId 
     * @param {string} code 
     */
    async verify(userId, code) {
        const { db } = this.dbctx
        const { users } = this.dbctx.schema;

        const user = await this.fetchUserById(userId);

        
    }

    /**
     * 
     * @param {string} userId 
     * @param {string} email 
     */
    async sendCode(userId, email) {
        const user = await this.fetchUserById(userId);


    }

    /**
     * 
     * @param {string} userId
     */
    async lock(userId) {

    }

    /**
     * 
     * @param {string} userId 
     */
    async unlockById(userId) {

    }

    /**
     * 
     * @param {string} email 
     */
    async unlockByEmail(email) {

    }

    /**
     * 
     * @param {string} email 
     */
    async blacklist(email) {

    }

    /**
     * 
     * @param {string} email 
     */
    async unblacklist(email) {

    }

    /**
     * 
     * @param {string} userId 
     */
    async purgeAccount(userId) {

    }

    /**
     * Fetch array of all verified users ids
     * 
     * @returns {Promise<string[]>}
     */
    async fetchVerifiedUserIds() {
        const res = await this.dbctx.db.select({ id: this.dbctx.schema.users.id })
            .from(this.dbctx.schema.users);

        return res.map(rec => rec.id);
    }
}

exports.UserService = UserService;