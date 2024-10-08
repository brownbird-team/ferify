const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits  } = require('discord.js');
const { ConfigContext } = require('@contexts/ConfigContext.js')
const { TranslationContext } = require("@contexts/TranslationContext.js")
const { GuildService } = require('@services/GuildService.js')
const { DatabaseContext } = require('@contexts/DatabaseContext.js')
const { DiscordEmbeds } = require('@discord-embeds/embeds.js');

const container = require('@root/container.js');
const { RoleUtils } = require('../utils/roleUtils');
const { ServerUtils } = require('../utils/serverUtils');
const { VerificationRoleUtils } = require('../utils/verificationRoleUtils');

const cfg = container.resolve(ConfigContext).config
const t = container.resolve(TranslationContext).getGlobalTranslator()

const guildService = container.resolve(GuildService)

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_role')
        .setDescription(t("discord.commands.set_role.description"))
        .addStringOption(option =>
            option.setName('action')
                .setDescription(t("discord.commands.set_role.descriptionAction"))
                .setRequired(true)
                .addChoices(
                    {name : 'verified', value: 'verified'},
                    {name : 'unverified', value: 'unverified'}
                )
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName("role")
            .setDescription(t('discord.commands.set_role.descriptionRoleId'))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        ,
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
        async execute(interaction) {
            const roleUtils = new RoleUtils(interaction.client);
            const serverUtils = new ServerUtils(interaction.client, roleUtils);
            const verificationRoleUtils = new VerificationRoleUtils(interaction.client,roleUtils,serverUtils);  
    

            const action = await interaction.options.getString("action")
            const role = await interaction.options.getRole("role")
            
            let subaction = role === null ? "remove" : "add";
            let roleId = role?.id.toString() || null;


            switch(action){
                case "verified":
                    await guildService.setVerifiedRole(interaction.guildId, roleId)
                    break;
                
                case "unverified":
                    await guildService.setUnverifiedRole(interaction.guildId, roleId)
                    break;
            }
            await verificationRoleUtils.setRolesServer(interaction.guildId)
            await interaction.reply({
                embeds: [
                    await DiscordEmbeds.defaultEmbed(
                        t(`discord.commands.set_role.messages.${subaction}.${action}`,{role:role?.name}),
                        null,
                        cfg.discordColors.success
                    )]
            });
        }
    }           