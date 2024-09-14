const nodemailer = require('nodemailer');
const { ConfigContext } = require('../contexts/ConfigContext.js');

class MailSenderService {

    /**
     * @param {ConfigContext} configCtx 
     */
    constructor(configCtx) {
        this.config = configCtx;

        this.transporter = nodemailer.createTransport({
            host: configCtx.smtpHost,
            port: configCtx.smtpPort,
            secure: configCtx.smtpPort == 465,
            auth: {
                user: configCtx.smtpUsername,
                pass: configCtx.smtpPassword,
            },
        });
    }

    /**
     * Send an email to given address
     * 
     * @param {string} email 
     * @param {string} subject 
     * @param {string} body 
     */
    async sendMail(email, subject, body) {
        try {
            await this.transporter.sendMail({
                from: `${this.config.smtpFromAddress} <${this.config.smtpFromName}>`,
                to: email,
                subject: subject,
                text: body,
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
     */
    async sendVerification(email, code) {
        
    }

    /**
     * Send confirmation that given email has been blacklisted
     * 
     * @param {string} email
     */
    async sendBlacklisted(email) {

    }

    /**
     * Send confirmation that given email has been
     * removed from blacklist
     * 
     * @param {string} email
     */
    async sendUnblacklisted(email) {

    }

    /**
     * Send confirmation that given email has been unlocked
     * 
     * @param {string} email 
     */
    async sendUnlocked(email) {

    }
}

exports.MailSenderService = MailSenderService;