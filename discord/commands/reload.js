const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits  } = require('discord.js');
const {DiscordEmbeds} = require('@discord-embeds/embeds.js')
const {ConfigContext} = require('@contexts/ConfigContext.js')
const {TranslationContext} = require('@contexts/TranslationContext.js')
const container = require('@root/container.js')
const {RoleUtils} = require('@discord-utils/roleUtils.js');
const {ServerUtils} = require('@discord-utils/serverUtils.js');
const {VerificationRoleUtils} = require('@discord-utils/verificationRoleUtils.js');
const { GuildService } = require('@root/services/GuildService');
const cfg = container.resolve(ConfigContext).config
const t = container.resolve(TranslationContext).getGlobalTranslator();
const guildService = container.resolve(GuildService)



//Make description go from lang file
module.exports = {
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription(t("discord.commands.reload.description")),
  /**@param {ChatInputCommandInteraction} interaction */
  async execute(interaction) {
    const roleUtils = new RoleUtils(interaction.client);
    const serverUtils = new ServerUtils(interaction.client, roleUtils);
    const verificationRoleUtils = new VerificationRoleUtils(interaction.client,roleUtils,serverUtils);

    const roleVerified = (await guildService.getStatus(interaction.guildId)).verifiedRoleId;
    const roleUnverified = (await guildService.getStatus(interaction.guildId)).unverifiedRoleId;
    await verificationRoleUtils.setRolesServer(interaction.guildId)

    await interaction.reply({
      embeds: [
        await DiscordEmbeds.defaultEmbed(
          t("discord.commands.reload.message"),
          null,
          cfg.discordColors.success
        ),
      ],
    });
  },
};
   