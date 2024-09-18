const { SlashCommandBuilder } = require('discord.js')
const {DiscordEmbeds} = require('@discord-embeds/embeds.js')
const {ConfigContext} = require('@contexts/ConfigContext.js')
const {TranslationContext} = require('@contexts/TranslationContext.js')
const container = require('@root/container.js')

const cfg = container.resolve(ConfigContext).config
const t = container.resolve(TranslationContext).getGlobalTranslator();

//Make description go from lang file
module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Displays list of all commands and what they do"),
        async execute(interaction) {
            const embed = await DiscordEmbeds.helpEmbed(cfg.discordHelpEmbedCommands)
            await interaction.reply({embeds: [embed]});
    },              
}
   