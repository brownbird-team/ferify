const config = require('../config.json');
const { z } = require('zod')

const ConfigContextScheme = z.object({
    appName: z.string(),
    language: z.string(),
    blacklistEmail: z.string().email(),

    smtpHost: z.string(),
    smtpPort: z.number(),
    smtpUsername: z.string(),
    smtpPassword: z.string(),
  
    smtpFromName: z.string(),
    smtpFromAddress: z.string().nullable(),
  
    imapHost: z.string(),
    imapPort: z.number(),
    imapUsername: z.string().email(),
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
    discrodClientId: z.string()
})

/** @typedef { z.infer<typeof ConfigContextScheme>} Config */

class ConfigContext {
    static instance = null;

    /**
     * @returns {Config}
     */
    static getInstance() {
        if (ConfigContext.instance)
            return ConfigContext.instance.config;

        ConfigContext.instance = new ConfigContext();
        return ConfigContext.instance.config;
    }

    constructor() {
        try{
            this.config = ConfigContextScheme.parse(config)
        }
        catch(err){
            if(err instanceof z.ZodError){
                const paths = err.errors.map(error => error.path);
                console.error('Config is missing:', paths);
            }
            else
                console.log(err)
        }
    }
}
exports.ConfigContext = ConfigContext;