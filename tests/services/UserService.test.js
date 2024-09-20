// @ts-check

import { TranslationContext } from '../../contexts/TranslationContext.js';
import { UserService } from '../../services/UserService.js';

import { TestConfigContext } from '../contexts/TestConfigContext.js';
import { TestDatabaseContext } from '../contexts/TestDatabaseContext.js';
import { describe, it, vi, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { ConfigContext } from '../../contexts/ConfigContext.js';
import { MailSenderService } from '../../services/MailSenderService.js';
import { CryptoService } from '../../services/CryptoService.js';
import { eq, count, or, and } from 'drizzle-orm';

// Mock translator user by UserService
vi.mock('../../contexts/TranslationContext.js', () => {
    const TranslationContext = vi.fn();

    TranslationContext.prototype.getGlobalTranslator = () => {
        return vi.fn().mockName('translator').mockImplementation((s) => s);
    }

    return { TranslationContext };
});

// Mock mail sender used by UserService
vi.mock('../../services/MailSenderService.js', () => {
    const MailSenderService = vi.fn();

    MailSenderService.prototype.sendVerification = vi.fn();
    MailSenderService.prototype.sendBlacklisted = vi.fn();
    MailSenderService.prototype.sendUnblacklisted = vi.fn();
    MailSenderService.prototype.sendUnlocked = vi.fn();
    MailSenderService.prototype.sendInvalidEmail = vi.fn();
    MailSenderService.prototype.sendUnblacklistDenied = vi.fn();
    MailSenderService.prototype.sendErrorResponse = vi.fn();

    return { MailSenderService };
});

describe('Testing UserService', () => {
    /** @type {UserService} */
    let userServ;
    /** @type {TestDatabaseContext} */
    let databaseCtx;
    /** @type {TranslationContext} */
    let translationCtx;
    /** @type {MailSenderService} */
    let mailSenderServ;
    /** @type {CryptoService} */
    let cryptoServ;

    /**
     * @param {string} e 
     * @returns {string}
     */
    const hash = (e) => cryptoServ.hashEmail(e);

    beforeAll(async () => {
        const configCtx = new TestConfigContext();
        databaseCtx = new TestDatabaseContext(configCtx);

        await databaseCtx.dropAllTables();
        await databaseCtx.migrate();
    });

    beforeEach(async () => {
        // Mock config context
        const configCtx = /** @type {ConfigContext} */ ({
            config: {
                aliasUnlock: 'unlock@example.com',
                verificationCodeValidSeconds: 60,
                emailRegex: /^valid([0-9]*)@example.com$/i,
                hashPepper: 'this_is_pepper',
            }
        });

        // Create new mocked TranslationContext
        translationCtx = new TranslationContext(configCtx);
        // Create new mocked MailSenderService
        mailSenderServ = new MailSenderService(configCtx, translationCtx);
        // Create new normal CryptoService
        cryptoServ = new CryptoService(configCtx);

        userServ = new UserService(configCtx, databaseCtx, translationCtx, mailSenderServ, cryptoServ);
        await databaseCtx.clearAllTables();

        vi.useFakeTimers();
    });

    afterEach(async () => {
        vi.clearAllMocks();
        vi.useRealTimers();
    })

    afterAll(async () => {
        await databaseCtx.dropAllTables();
    });

    it('getStatus', async () => {
        const values = [
            { id: 'u1', emailHash: 'HASH0001', locked: false, verified: true,  code: 'THE_CODE1', codeCreated: new Date() },
            { id: 'u2', emailHash: 'HASH0002', locked: false, verified: false, code: 'THE_CODE2', codeCreated: new Date() },
            { id: 'u3', emailHash: 'HASH0003', locked: true,  verified: true,  code: 'THE_CODE3', codeCreated: new Date() },
        ];
        await databaseCtx.db.insert(databaseCtx.schema.users).values(values);

        // For each record expect status to retrive valid data
        for (const rec of values) {
            expect(await userServ.getStatus(rec.id)).to.deep.equal({
                userId: rec.id,
                verified: rec.verified,
                locked: rec.locked,
            });
        }

        // Expect default data if there is no record
        expect(await userServ.getStatus('ID_NOT_IN_DB')).to.deep.equal({
            userId: 'ID_NOT_IN_DB',
            verified: false,
            locked: false,
        });
    });

    it('sendCode', async () => {
        const values = [
            { id: 'u1', emailHash: hash('em1'), locked: false, verified: true,  code: null, codeCreated: null },
            { id: 'u2', emailHash: hash('em2'), locked: false, verified: false, code: 'THE_CODE2', codeCreated: new Date() },
            { id: 'u3', emailHash: hash('valid02@example.com'), locked: true,  verified: true,  code: 'THE_CODE3', codeCreated: new Date() },
        ];
        await databaseCtx.db.insert(databaseCtx.schema.users).values(values);

        // Add one email to blacklist
        await databaseCtx.db.insert(databaseCtx.schema.blacklist).values({
            emailHash: hash('valid01@example.com'),
            blacklisted: true,
        });

        // User (discord) is already verified
        await expect(() => userServ.sendCode('u1', 'some@example.com'))
            .rejects.toThrowError('errors.alreadyVerified');

        // Given email is invalid (regex)
        await expect(() => userServ.sendCode('u2', 'invalid@example.com'))
            .rejects.toThrowError('errors.emailInvalid');

        // Given email is blacklisted
        await expect(() => userServ.sendCode('u2', 'valid01@example.com'))
            .rejects.toThrowError('errors.emailBlacklisted');

        // Given email is locked
        await expect(() => userServ.sendCode('NOT_IN_DB', 'valid02@example.com'))
            .rejects.toThrowError('errors.emailLocked');

        // Set time so it can be checked later
        const fixedTime = new Date('2024-01-01T00:00:00Z');
        vi.setSystemTime(fixedTime);

        await userServ.sendCode('NEW_USER', 'valid03@example.com');

        const userRes = await databaseCtx.db.select()
            .from(databaseCtx.schema.users)
            .where(eq(databaseCtx.schema.users.id, 'NEW_USER'));

        // If code is successfully sent, expect database record to contain valid data
        expect(userRes.length).to.equal(1);
        expect(userRes[0].emailHash).to.equal(hash('valid03@example.com'));
        expect(userRes[0].codeCreated?.getTime()).to.equal(fixedTime.getTime());

        // Also expect email sender to be called
        expect(mailSenderServ.sendVerification)
            .toBeCalledWith('valid03@example.com', userRes[0].code, false);
    });

    it('verify', async () => {
        const fixedTime = new Date('2024-01-01T00:00:00Z');
        vi.setSystemTime(fixedTime);

        const values = [
            { id: 'u1', emailHash: hash('em1'), locked: false, verified: true,   code: 'C1', codeCreated: new Date() },
            { id: 'u2', emailHash: hash('em2'), locked: false, verified: false,  code: null, codeCreated: null       },
            { id: 'u3', emailHash: hash('em3'), locked: false, verified: false,  code: 'C3', codeCreated: null       },
            { id: 'u4', emailHash: hash('em4'), locked: false, verified: false,  code: 'C4', codeCreated: new Date() },
            { id: 'u5', emailHash: hash('em4'), locked: true,  verified: true,   code: null, codeCreated: null       },
        ];
        await databaseCtx.db.insert(databaseCtx.schema.users).values(values);

        // User is already verified
        await expect(() => userServ.verify('u1', 'C1'))
            .rejects.toThrowError('errors.alreadyVerified');

        // User didn't user sendcode
        await expect(() => userServ.verify('u2', 'SOME_CODE'))
            .rejects.toThrowError('errors.noVerificationCode');

        // Something happend in the DB and time is gone
        await expect(() => userServ.verify('u3', 'C3'))
            .rejects.toThrowError('errors.invalidVerificationCode');

        // User entered invalid code
        await expect(() => userServ.verify('u4', 'INVALID_CODE'))
            .rejects.toThrowError('errors.invalidVerificationCode');

        // Verification code expired
        vi.advanceTimersByTime(61000);
        await expect(() => userServ.verify('u4', 'C4'))
            .rejects.toThrowError('errors.verificationCodeExpired');
        vi.setSystemTime(fixedTime);

        // User entered valid code
        const data = await userServ.verify('u4', 'C4');

        // Old user with same email is unverified
        expect(data).to.deep.equal({
            verified:   [ 'u4' ],
            unverified: [ 'u5' ],
        });

        // Those values should be updated in the db
        const users = databaseCtx.schema.users;
        const [{ cnt }] = await databaseCtx.db.select({ cnt: count() })
            .from(users)
            .where(or(
                and(eq(users.id, 'u4'), eq(users.verified, true)),
                and(eq(users.id, 'u5'), and(eq(users.verified, false), eq(users.locked, false)))
            ));

        expect(cnt).to.equal(2);
    });

    it('lock', async () => {
        const values = [
            { id: 'u1', emailHash: hash('em1'), locked: true,  verified: true,  code: null, codeCreated: null },
            { id: 'u2', emailHash: hash('em2'), locked: false, verified: false, code: null, codeCreated: null },
            { id: 'u3', emailHash: hash('em3'), locked: false, verified: true,  code: null, codeCreated: null },
        ];
        await databaseCtx.db.insert(databaseCtx.schema.users).values(values);

        await expect(() => userServ.lock('u1'))
            .rejects.toThrowError('errors.alreadyLocked');

        await expect(() => userServ.lock('u2'))
            .rejects.toThrowError('errors.verificationRequired');
        await expect(() => userServ.lock('NOT_IN_DB'))
            .rejects.toThrowError('errors.verificationRequired');

        await userServ.lock('u3');

        const res = await databaseCtx.db.select()
            .from(databaseCtx.schema.users)
            .where(eq(databaseCtx.schema.users.id, 'u3'));

        expect(res.length).to.equal(1);
        expect(res[0].locked).to.equal(true);
    });

    it('unlockById', async () => {
        const values = [
            { id: 'u1', emailHash: hash('em1'), locked: false, verified: true,  code: null, codeCreated: null },
            { id: 'u2', emailHash: hash('em2'), locked: false, verified: false, code: null, codeCreated: null },
            { id: 'u3', emailHash: hash('em3'), locked: true,  verified: true,  code: null, codeCreated: null },
        ];
        await databaseCtx.db.insert(databaseCtx.schema.users).values(values);

        // Account is already unlocked
        await expect(() => userServ.unlockById('u1'))
            .rejects.toThrowError('errors.alreadyUnlocked');

        // User is not verified
        await expect(() => userServ.unlockById('u2'))
            .rejects.toThrowError('errors.verificationRequired');
        await expect(() => userServ.unlockById('NOT_IN_DB'))
            .rejects.toThrowError('errors.verificationRequired');

        await userServ.unlockById('u3');

        const res = await databaseCtx.db.select()
            .from(databaseCtx.schema.users)
            .where(eq(databaseCtx.schema.users.id, 'u3'));

        expect(res.length).to.equal(1);
        expect(res[0].locked).to.equal(false);
    });

    it('unlockByEmail', async () => {
        const values = [
            { id: 'u1', emailHash: hash('em1'), locked: false, verified: true,  code: null, codeCreated: null },
            { id: 'u3', emailHash: hash('em3'), locked: true,  verified: true,  code: null, codeCreated: null },
        ];
        await databaseCtx.db.insert(databaseCtx.schema.users).values(values);

        // Email is not locked by any account
        await expect(() => userServ.unlockByEmail('em1'))
            .rejects.toThrowError('errors.alreadyUnlocked');
        await expect(() => userServ.unlockByEmail('NOT_IN_DB'))
            .rejects.toThrowError('errors.alreadyUnlocked');

        await userServ.unlockByEmail('em3');

        const res = await databaseCtx.db.select()
            .from(databaseCtx.schema.users)
            .where(eq(databaseCtx.schema.users.emailHash, hash('em3')));

        expect(res[0].locked).to.equal(false);
    });

    it('blacklist', async () => {
        const { blacklist } = databaseCtx.schema;
        const values = [
            { emailHash: hash('em1'), permanent: false, blacklisted: true },
            { emailHash: hash('em2'), permanent: true,  blacklisted: false },
            { emailHash: hash('em3'), permanent: false, blacklisted: false },
        ];
        await databaseCtx.db.insert(blacklist).values(values);

        // User is already blacklisted
        await expect(() => userServ.blacklist('em1'))
            .rejects.toThrowError('errors.alreadyBlacklisted');

        await userServ.blacklist('em2');
        await userServ.blacklist('NOT_IN_DB');

        const [{ cnt }] = await databaseCtx.db.select({ cnt: count() })
            .from(blacklist)
            .where(eq(blacklist.blacklisted, true));

        expect(cnt).to.equal(3);

        const [{ permanent }] = await databaseCtx.db.select()
            .from(blacklist)
            .where(eq(blacklist.emailHash, hash('em2')));

        expect(permanent).to.equal(false);
    });

    it('unblacklist', async () => {
        const { blacklist } = databaseCtx.schema;
        const values = [
            { emailHash: hash('em1'), permanent: false, blacklisted: true  },
            { emailHash: hash('em2'), permanent: true,  blacklisted: true  },
            { emailHash: hash('em3'), permanent: false, blacklisted: false },
        ];
        await databaseCtx.db.insert(blacklist).values(values);

        // User is not on the blacklist
        await expect(() => userServ.unblacklist('em3'))
            .rejects.toThrowError('errors.alreadyUnblacklisted');
        await expect(() => userServ.unblacklist('NOT_IN_DB'))
            .rejects.toThrowError('errors.alreadyUnblacklisted');

        // User is blacklisted permanently
        await userServ.unblacklist('em2');
        expect(mailSenderServ.sendUnblacklistDenied).toBeCalledWith('em2');

        const stillBlacklisted = (await databaseCtx.db.select()
            .from(blacklist)
            .where(eq(blacklist.emailHash, hash('em2'))))[0].blacklisted;
        expect(stillBlacklisted).to.equal(true);

        // Everything OK
        await userServ.unblacklist('em1');
        expect(mailSenderServ.sendUnblacklisted).toBeCalledWith('em1');

        const [{ blacklisted }] = (await databaseCtx.db.select()
            .from(blacklist)
            .where(eq(blacklist.emailHash, hash('em1'))));
        expect(blacklisted).to.equal(false);
    });

    it('purgeAccount', async () => {
        const values = [
            { id: 'u1', emailHash: hash('em1'), locked: false, verified: true,  code: null, codeCreated: null },
            { id: 'u2', emailHash: hash('em2'), locked: true,  verified: true,  code: null, codeCreated: null },
            { id: 'u3', emailHash: hash('em3'), locked: false, verified: false, code: null, codeCreated: null },
        ];
        await databaseCtx.db.insert(databaseCtx.schema.users).values(values);

        // There is no such account in the DB
        await expect(() => userServ.purgeAccount('NOT_IN_DB'))
            .rejects.toThrowError('alreadyPurged');

        await userServ.purgeAccount('u1');
        await userServ.purgeAccount('u2');

        const [{ cnt }] = await databaseCtx.db.select({ cnt: count() })
            .from(databaseCtx.schema.users);

        expect(cnt).to.equal(values.length - 2);
    });

    it('fetchVerifiedUserIds', async () => {
        const values = [
            { id: 'u1', emailHash: hash('em1'), locked: false, verified: true,  code: null, codeCreated: null },
            { id: 'u2', emailHash: hash('em2'), locked: true,  verified: true,  code: null, codeCreated: null },
            { id: 'u3', emailHash: hash('em3'), locked: false, verified: false, code: null, codeCreated: null },
        ];
        await databaseCtx.db.insert(databaseCtx.schema.users).values(values);

        expect(await userServ.fetchVerifiedUserIds())
            .to.deep.equal(values.filter(v => v.verified).map(v => v.id));
    });
});