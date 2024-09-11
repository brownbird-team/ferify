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

        this.admins = Array.isArray(cfg.admins) ? 
            cfg.admins.filter(admin => typeof(admin) == 'string') : [];

        if (!cfg.discordBotToken)
            console.warn('Discord bot token is empty');

        this.discordBotToken = cfg.discordBotToken || 'INVALID_TOKEN';
    }
}

exports.ConfigContext = ConfigContext;

const cf = ConfigContext.getInstance();