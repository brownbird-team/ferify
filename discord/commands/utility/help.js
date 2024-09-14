const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Displays list of all commands and what they do")      
}   