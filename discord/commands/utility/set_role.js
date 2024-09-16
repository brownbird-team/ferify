 const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits  } = require('discord.js');
const { ConfigContext } = require('../../../contexts/ConfigContext.js')
const { TranslationContext } = require("../../../contexts/TranslationContext.js")
const { GuildService } = require('../../../services/GuildService.js')
const { DatabaseContext } = require('../../../contexts/DatabaseContext.js')
const { defaultEmbed } = require('../embeds/embeds.js');



const tctx = TranslationContext.getInstance();
const t = tctx.getGlobalTranslator();

const cfg = ConfigContext.getConfig()

const guildService = new GuildService(DatabaseContext.getInstance())

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
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        ,
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
        async execute(interaction) {
            const action = await interaction.options.getString("action")
            const role = await interaction.options.getRole("role")
            switch(action){
                case "verified":
                    guildService.setVerifiedRole(interaction.guildId, role.id.toString())
                    await interaction.reply({
                        embeds: [
                            await defaultEmbed(
                                t("discord.commands.set_role.messages.verified",{role:role.name}),
                                null,
                                cfg.discordColors.success
                            )]
                    });
                    break;
                
                case "unverified":
                    guildService.setUnverifiedRole(interaction.guildId, role.id.toString())
                    await interaction.reply({
                        embeds: [
                            await defaultEmbed(
                                t("discord.commands.set_role.messages.unverified",{role:role.name}),
                                null,
                                cfg.discordColors.success
                            )]
                    });
                    break;
            }
        }
    }           