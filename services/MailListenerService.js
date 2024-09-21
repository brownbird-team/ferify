// @ts-check

const { ImapFlow } = require('imapflow');
const { ConfigContext } = require('../contexts/ConfigContext.js');
const { TranslationContext } = require('../contexts/TranslationContext.js');
const { MailSenderService } = require('./MailSenderService.js');
const { UserService } = require('./UserService.js');
const { CryptoService } = require('./CryptoService.js');

/** @typedef {import('../contexts/ConfigContext.js').Config} Config */

class MailListenerService {

    /** @type {Config} */
    config;
    /** @type {TranslationContext} */
    translation;
    /** @type {ImapFlow} */
    client;
    /** @type {UserService} */
    users;
    /** @type {CryptoService} */
    crypto;

    /**
     * @param {ConfigContext} configContext
     * @param {TranslationContext} translationContext
     * @param {MailSenderService} mailSenderService
     * @param {UserService} userService
     * @param {CryptoService} cryptoService
     */
    constructor(configContext, translationContext, mailSenderService, userService, cryptoService) {
        this.config = configContext.config;
        this.translation = translationContext;
        this.sender = mailSenderService;
        this.users = userService;
        this.crypto = cryptoService;

        this.client = new ImapFlow({
            host: this.config.imapHost,
            port: this.config.imapPort,
            secure: this.config.imapSecure,
            logger: this.config.imapLog ? undefined : false,
            auth: {
                user: this.config.imapUsername,
                pass: this.config.imapPassword,
            },
        });
    }

    /**
     * Start message listener
     */
    async startListener() {
        const { client } = this;
        await client.connect();

        await client.getMailboxLock('INBOX');
        await client.messageDelete({ all: true });

        client.on('exists', async () => {
            let messages = [];

            for await (const message of client.fetch('1:*', { envelope: true, uid: true })) {
                messages.push(message);
            }

            await client.messageDelete({ 
                uid: messages.map(m => m.uid).join(','),
            });

            for (const message of messages) {
                const to = message.envelope.to[0].address;
                const from = message.envelope.from[0].address;

                if (!to || !from) continue;
                if (!this.crypto.checkEmail(from)) {
                    this.sender.sendInvalidEmail(from);
                    continue;
                }

                try {
                    switch(to) {
                        case this.config.aliasHelp:
                            this.sender.sendHelp(from);
                            break;
                        case this.config.aliasUnlock:
                            await this.users.unlockByEmail(from);
                            break;
                        case this.config.aliasBlacklist:
                            await this.users.blacklist(from);
                            break;
                        case this.config.aliasUnblacklist:
                            await this.users.unblacklist(from);
                            break;
                    }
                } catch (err) {
                    const t = this.translation.getGlobalTranslator();
                    // @ts-ignore
                    this.sender.sendErrorResponse(from, (err?.isUserError) ? err.message : t('errors.internalError'));
                    // @ts-ignore
                    if (!err.isUserError) console.error(err);
                }
            }
        });

        client.on('close', async () => {
            this.startListener();
        });
    }
}

exports.MailListenerService = MailListenerService;