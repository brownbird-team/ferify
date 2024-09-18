const { SlashCommandBuilder, ChatInputCommandInteraction, discordSort } = require('discord.js');
const { ConfigContext } = require('@contexts/ConfigContext.js')
const { TranslationContext } = require("@contexts/TranslationContext.js")
const { GuildService } = require('@services/GuildService.js')
const { DatabaseContext } = require('@contexts/DatabaseContext.js')
const { DiscordEmbeds } = require('@discord-embeds/embeds.js')
const {InputUtils} = require('@discord-utils/inputUtils.js')
const container = require('@root/container.js')

const cfg = container.resolve(ConfigContext).config
const t = container.resolve(TranslationContext).getGlobalTranslator()

const guildService = container.resolve(GuildService)


module.exports = {
    data: new SlashCommandBuilder()
        .setName('server_whitelist')
        .setDescription(t("discord.commands.server_whitelist.description"))
        .addStringOption(option =>
            option.setName('action')
                .setDescription(t("discord.commands.server_whitelist.descriptionAction"))

                .setRequired(true)
                .addChoices(
                    {name : 'add', value: 'add'},
                    {name : 'remove', value: 'remove'}
                )
        )
        .addStringOption(option =>
            option.setName('server_id')
                .setDescription(t("discord.commands.server_whitelist.descriptionServerId"))
                .setRequired(true)
        )
    ,
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const action = await interaction.options.getString("action")
        const serverId = await interaction.options.getString("server_id")

        if (!cfg.admins.includes(interaction.user.id)) {
            await interaction.reply(`I dont know you`);//Do it with lang
            return;
        }

        if (!await InputUtils.checkSnowflake(serverId)) {
            await interaction.reply(t('errors.snowflakeError'));
            return;
        }
        const serverInfo = await guildService.getStatus(serverId)

        switch (action) {
            case 'add':
                if (serverInfo.whitelisted) {
                    await interaction.reply({
                        embeds: [
                            await DiscordEmbeds.defaultEmbed(
                                t("errors.discordWhitelistErrors.alreadyWhitelisted"),
                                null,
                                cfg.discordColors.error
                            )]
                    });
                    break;
                }

                await guildService.setWhitelisted(serverId, true)

                const addEmbed = await DiscordEmbeds.defaultEmbed(t("discord.commands.server_whitelist.serverAddedSuccessfully"), null, cfg.discordColors.success)

                await interaction.reply({ embeds: [addEmbed] });

                break;

            case 'remove':
                if (!serverInfo.whitelisted) {
                    await interaction.reply({
                        embeds: [
                            await DiscordEmbeds.defaultEmbed(
                                t("errors.discordWhitelistErrors.alreadyUnWhitelisted"),
                                null,
                                cfg.discordColors.error
                            )]
                    });
                    break;
                }

                await guildService.setWhitelisted(serverId, false)

                const removedEmbed = await DiscordEmbeds.defaultEmbed(t("discord.commands.server_whitelist.serverRemovedSuccessfully"), null, cfg.discordColors.success)

                await interaction.reply({ embeds: [removedEmbed] });

                break;
        }

    },
};


