// @ts-check

const config = require('../config.json');
const { z } = require('zod');

const hexColorRegex = /^#([0-9a-f]{3}){1,2}$/i;

/**
 * @param {string} value
 * @returns {boolean}
 */
const checkHexColor = (value) => hexColorRegex.test(value)

/**
 * @param {string} value
 * @returns {boolean}
 */
const checkRegex = (value) => {
    try { RegExp(value); } 
    catch { return false; }
    
    return true;
}

const ConfigContextScheme = z.object({
    appName: z.string(),
    appWebsite: z.string(),
    language: z.string(),

    smtpHost: z.string(),
    smtpPort: z.number(),
    smtpUsername: z.string(),
    smtpPassword: z.string(),
  
    smtpFromName: z.string(),
    smtpFromAddress: z.string().nullable()
        .transform((value) => value === null ? '' : value),
  
    imapHost: z.string(),
    imapPort: z.number(),
    imapLog: z.boolean(),
    imapSecure: z.boolean(),
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

    hashPepper: z.string(),
    verificationCodeValidSeconds: z.number(),

    emailRegex: z.string()
        .refine(checkRegex, 'Invalid regex')
        .transform(str => RegExp(str, 'i')),
  
    admins: z.array(z.string()),
  
    discordBotToken: z.string(),
    discrodClientId: z.string(),

    discordColors: z.object({
        success : z.string().refine(checkHexColor),
        error: z.string().refine(checkHexColor),
        neutral: z.string().refine(checkHexColor),
    }),
    discordHelpEmbedCommands : z.array(z.string())   
})
.transform((result) => {
    if (!result.smtpFromAddress)
        result.smtpFromAddress = result.smtpUsername;

    return result;
});

/** 
 * @typedef { z.infer<typeof ConfigContextScheme> } Config 
 */

class ConfigContext {

    /** @type {Config} */
    config;

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