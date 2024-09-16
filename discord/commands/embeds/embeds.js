const {EmbedBuilder, inlineCode} = require('discord.js')
const {ConfigContext} = require('../../../contexts/ConfigContext.js')
const {TranslationContext} = require("../../../contexts/TranslationContext.js")

const cfg = ConfigContext.getConfig()

const tctx = TranslationContext.getInstance();
const t = tctx.getGlobalTranslator();

const defaultEmbed = async (title, description, color) =>{
    const embed = new EmbedBuilder()
                .setColor(color) 
                .setTitle(title)
                .setDescription(description)
    return embed
}
/**
 * Used for creating help Embed
 * @param {string[]} commands 
 */
const helpEmbed = async(commands) =>{
    const fields = commands.map(cmd => ({
        name: inlineCode(t(`discord.helpEmbed.${cmd}.title`)),
        value: t(`discord.helpEmbed.${cmd}.description`, {unlockEmail: cfg.aliasUnlock})
      }));

    const embed = new EmbedBuilder()
                .setTitle(t('discord.helpEmbed.title'))
                .setColor(cfg.discordColors.success)
                .setFields(fields)

    return embed
}


/**
 * 
 * @param {*} data 
 */
const serverStatusEmbed = async(data) =>{
    const embed = new EmbedBuilder()
                .setTitle("Serv")
                .setColor(data.serverStatus ? cfg.discordColors.success : cfg.discordColors.error)
                .setTitle(t('discord.commands.server_status.embed.title', {serverName : data.serverName}))
                .setDescription(t(
                    'discord.commands.server_status.embed.description',
                    data
                ))
    return embed                
}



exports.defaultEmbed = defaultEmbed
exports.helpEmbed = helpEmbed
exports.serverStatusEmbed = serverStatusEmbed
