// @ts-check

const config = require('../config.json');
const { z } = require('zod');

const ConfigContextScheme = z.object({
    appName: z.string(),
    language: z.string(),
    blacklistEmail: z.string().email(),

    smtpHost: z.string(),
    smtpPort: z.number(),
    smtpUsername: z.string(),
    smtpPassword: z.string(),
  
    smtpFromName: z.string(),
    smtpFromAddress: z.string().nullable()
        .transform((value) => value === null ? '' : value),
  
    imapHost: z.string(),
    imapPort: z.number(),
    imapUsername: z.string(),
    imapPassword: z.string(),
  
    aliasHelp: z.string().email(),
    aliasUnlock: z.string().email(),
    aliasBlacklist: z.string().email(),
    aliasUnblacklist: z.string().email(),
  
    supportEmail: z.string().email(),
  
    databaseHost: z.string(),
    databasePort: z.number(),
    databaseName: z.string(),
    databaseUsername: z.string(),
    databasePassword: z.string(),
  
    admins: z.array(z.string()),
  
    discordBotToken: z.string(),
    discrodClientId: z.string(),
})
.transform((result) => {
    if (!result.smtpFromAddress)
        result.smtpFromAddress = result.smtpUsername;

    return result;
});

/** 
 * @typedef { z.infer<typeof ConfigContextScheme>} Config 
 */

class ConfigContext {
    /** @type {ConfigContext | null} */
    static instance = null;

    /** @type {Config} */
    config;

    /**
     * Return ConfigContext global instance
     * 
     * @returns {ConfigContext}
     */
    static getInstance() {
        if (ConfigContext.instance)
            return ConfigContext.instance;

        ConfigContext.instance = new ConfigContext();
        return ConfigContext.instance;
    }

    /**
     * Return config object stored in ConfigContext global instance
     * 
     * @returns {Config}
     */
    static getConfig() {
        return ConfigContext.getInstance().config;
    }

    constructor() {
        try {
            this.config = ConfigContextScheme.parse(config)

        } catch(err) {
            if(err instanceof z.ZodError){
                const paths = err.errors.map(
                    error => `    => ${error.path}: ${error.message}`
                );

                console.error('Following configuration errors occurred:');
                console.error(paths.join('\n'));

                throw new Error('Cannot start application with invalid configuration');
            }

            throw err;
        }
    }
}

exports.ConfigContext = ConfigContext;