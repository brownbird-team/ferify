const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits  } = require('discord.js');
const { ConfigContext } = require('@contexts/ConfigContext.js')
const { TranslationContext } = require("@contexts/TranslationContext.js")
const { GuildService } = require('@services/GuildService.js')
const { DatabaseContext } = require('@contexts/DatabaseContext.js')
const { serverStatusEmbed } = require('@discord-embeds/embeds.js');



const tctx = TranslationContext.getInstance();
const t = tctx.getGlobalTranslator();

const cfg = ConfigContext.getConfig()

const guildService = new GuildService(DatabaseContext.getInstance())

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server_status')
        .setDescription(t('discord.commands.server_status.description')),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        interaction.reply({ embeds: [await serverStatusEmbed(
            {
                
                whitelistStatus: "True",
                verifiedRole: "Role1",
                unverifiedRole: "Role2",
                verifiedRoleStatus: "Good",
                unverifiedRoleStatus: "Bad",
                serverStatus: "Lose"
            }
        )] })
    }
}