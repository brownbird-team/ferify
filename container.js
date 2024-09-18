// @ts-check

const { Container } = require('./utils/Container.js');

const { ConfigContext } = require('./contexts/ConfigContext.js');
const { DatabaseContext } = require('./contexts/DatabaseContext.js');
const { TranslationContext } = require('./contexts/TranslationContext.js');

const { GuildService } = require('./services/GuildService.js');
const { CryptoService } = require('./services/CryptoService.js');
const { MailListenerService } = require('./services/MailListenerService.js');
const { MailSenderService } = require('./services/MailSenderService.js');
const { UserService } = require('./services/UserService.js');

const container = new Container([
    { name: 'configContext',       scope: 'singleton', useClass: ConfigContext       },
    { name: 'databaseContext',     scope: 'singleton', useClass: DatabaseContext     },
    { name: 'translationContext',  scope: 'singleton', useClass: TranslationContext  },

    { name: 'guildService',        scope: 'singleton', useClass: GuildService        },
    { name: 'cryptoService',       scope: 'singleton', useClass: CryptoService       },
    { name: 'mailListenerService', scope: 'singleton', useClass: MailListenerService },
    { name: 'mailSenderService',   scope: 'singleton', useClass: MailSenderService   },
    { name: 'userService',         scope: 'singleton', useClass: UserService         },
]);

module.exports = container;


