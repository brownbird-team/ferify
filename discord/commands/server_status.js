const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits  } = require('discord.js');
const { ConfigContext } = require('@contexts/ConfigContext.js')
const { TranslationContext } = require("@contexts/TranslationContext.js")
const { GuildService } = require('@services/GuildService.js')
const { DatabaseContext } = require('@contexts/DatabaseContext.js')
const { DiscordEmbeds } = require('@discord-embeds/embeds.js');
const {ServerUtils} = require('@discord-utils/serverUtils.js')
const {RoleUtils} = require('@discord-utils/roleUtils.js')
const container = require('@root/container.js')

const cfg = container.resolve(ConfigContext).config
const t = container.resolve(TranslationContext).getGlobalTranslator()
const guildService = container.resolve(GuildService)



module.exports = {
    data: new SlashCommandBuilder()
        .setName('server_status')
        .setDescription(t('discord.commands.server_status.description')),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {

    const roleUtils = new RoleUtils(interaction.client)
    const serverUtils = new ServerUtils(interaction.client, roleUtils)
        
    const guildStatus = await guildService.getStatus(interaction.guildId)

        interaction.reply({ embeds: [await DiscordEmbeds.serverStatusEmbed(
            await serverUtils.generateServerStatus(guildStatus, interaction.client)
        )] })
    }
}