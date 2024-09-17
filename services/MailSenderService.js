// @ts-check

const nodemailer = require('nodemailer');
const { TranslationContext } = require('../contexts/TranslationContext.js');
const { ConfigContext } = require('../contexts/ConfigContext.js');

/** @typedef {import('../contexts/ConfigContext.js').Config} Config */

class MailSenderService {

    /** @private @type {Config} */
    config;
    /** @private @type {TranslationContext} */
    translation;

    /**
     * @param {ConfigContext} configContext
     * @param {TranslationContext} translationContext
     */
    constructor(configContext, translationContext) {
        this.config = configContext.config;
        this.translation = translationContext;

        this.transporter = nodemailer.createTransport({
            host: this.config.smtpHost,
            port: this.config.smtpPort,
            secure: this.config.smtpPort == 465,
            auth: {
                user: this.config.smtpUsername,
                pass: this.config.smtpPassword,
            },
        });
    }

    /**
     * Send an email to given address (add header and footer to body)
     * 
     * @param {string} email 
     * @param {string} subject 
     * @param {string} body 
     */
    async sendMail(email, subject, body) {
        const t = this.translation.getGlobalTranslator();

        const fullBody = 
            t('email.body.header') + 
            '\n\n' + 
            body + 
            '\n\n' + 
            t('email.body.footer', {
                appName: this.config.appName,
                website: this.config.appWebsite,
                supportEmail: this.config.supportEmail,
            });

        try {
            await this.transporter.sendMail({
                from: `${this.config.smtpFromName} <${this.config.smtpFromAddress}>`,
                to: email,
                subject: subject,
                text: fullBody,
            });

        } catch (err) {
            console.error(`Failed to send email with subject "${subject}" to <${email}>`)
            console.error(err);
        }
    }

    /**
     * Send verification code to email address
     * 
     * @param {string} email
     * @param {string} code
     * @param {boolean} verified Indicates if user is already in the database
     */
    async sendVerification(email, code, verified) {
        const t = this.translation.getGlobalTranslator();

        let body = t('email.body.verificationCode', { email, code }) + '\n';
        
        if (verified)
            body += t('email.body.verificationSpamVerified', {
                appName: this.config.appName,
                unlockAlias: this.config.aliasUnlock,
            });
        else
            body += t('email.body.verificationSpamUnknown', {
                blacklistAlias: this.config.aliasBlacklist,
            });

        await this.sendMail(email, t('email.subject.verificationCode'), body)
    }

    /**
     * Send confirmation that given email has been blacklisted
     * 
     * @param {string} email
     */
    async sendBlacklisted(email) {
        const t = this.translation.getGlobalTranslator();

        await this.sendMail(email, 
            t('email.subject.blacklisted'),
            t('email.body.blacklisted', {
                email: email,
                appName: this.config.appName,
                unblacklistAlias: this.config.aliasUnblacklist,
            })
        );
    }

    /**
     * Send confirmation that given email has been
     * removed from blacklist
     * 
     * @param {string} email
     */
    async sendUnblacklisted(email) {
        const t = this.translation.getGlobalTranslator();

        await this.sendMail(email,
            t('email.subject.unblacklisted'),
            t('email.body.unblacklisted', {
                email: email,
            })
        );
    }

    /**
     * Send confirmation that given email has been unlocked
     * 
     * @param {string} email 
     */
    async sendUnlocked(email) {
        const t = this.translation.getGlobalTranslator();

        await this.sendMail(email, 
            t('email.subject.unlocked'),
            t('email.body.unlocked', {
                email: email,
            })
        );
    }

    /**
     * Send response which indicates that request came from invalid
     * email address
     * 
     * @param {string} email 
     */
    async sendInvalidEmail(email) {
        const t = this.translation.getGlobalTranslator();

        await this.sendMail(email, 
            t('email.subject.invalidEmailAddress'),
            t('email.body.invalidEmailAddress', {
                email: email,
                appName: this.config.appName,
            })
        );
    }
}

exports.MailSenderService = MailSenderService;