const config = require('../config.json');

class ConfigContext {
    static instance = null;

    /**
     * Return ConfigContext global instance
     * @returns {ConfigContext}
     */
    static getInstance() {
        if (ConfigContext.instance)
            return ConfigContext.instance;

        ConfigContext.instance = new ConfigContext();
        return ConfigContext.instance;
    }

    constructor() {
        if (!config)
            console.warn('Failed to require config file');

        const cfg = config || {};

        this.appName = cfg.appName || 'FERify';
        this.language = cfg.language || 'en';
        this.blacklistEmail = cfg.blacklistEmail || 'blacklist.ferify@example.com';

        if (!cfg.smtpHost || !cfg.smtpPort || !cfg.smtpUsername || !cfg.smtpPassword)
            console.warn('Incomplete email configuration provided');
        
        this.smtpHost = cfg.smtpHost || 'smtp.example.com';
        this.smtpPort = cfg.smtpPost || 587;
        this.smtpUsername = cfg.smtpUsername || 'ferify@example.com';
        this.smtpPassword = cfg.smtpPassword || 'password';
        
        this.smtpFromName = cfg.smtpFromName || 'FERify';
        this.smtpFromAddress = cfg.smtpFromAddress || this.smtpUsername;

        if (!cfg.databaseHost || !cfg.databasePort || !cfg.databaseName || !cfg.databaseUsername || !cfg.databasePassword)
            throw Error("Incomplete database configuration provided");

        this.databaseHost = cfg.databaseHost;
        this.databasePort = cfg.databasePort;
        this.databaseName = cfg.databaseName;
        this.databaseUsername = cfg.databaseUsername;
        this.databasePassword = cfg.databasePassword;

        this.admins = Array.isArray(cfg.admins) ? 
            cfg.admins.filter(admin => typeof(admin) == 'string') : [];

        if (!cfg.discordBotToken || !cfg.discrodClientId)
            console.warn('Incomplete discord bot configuration provided');

        this.discordBotToken = cfg.discordBotToken || 'INVALID_TOKEN';
        this.discordClientId = cfg.discrodClientId || 'INVALID CLIEND ID'
    }
}

exports.ConfigContext = ConfigContext;