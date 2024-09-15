const { SlashCommandBuilder } = require('discord.js')
const {helpEmbed} = require('../embeds/embeds.js')
const {ConfigContext} = require('../../../contexts/ConfigContext.js')

const cfg = ConfigContext.getConfig()

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Displays list of all commands and what they do"),
        async execute(interaction) {
            const embed = await helpEmbed(cfg.discordHelpEmbedCommands)
            await interaction.reply({embeds: [embed]});
    },              
}   