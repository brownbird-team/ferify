const { SlashCommandBuilder, ChatInputCommandInteraction} = require('discord.js');
const {DiscordEmbeds} = require('@discord-embeds/embeds.js')
const {ConfigContext} = require('@contexts/ConfigContext.js')
const {TranslationContext} = require('@contexts/TranslationContext.js')
const {UserService} = require('@services/UserService.js')
const {toUserError} = require('@utils/toUserError')
const container = require('@root/container.js');
const { VerificationRoleUtils } = require('../utils/verificationRoleUtils');
const { RoleUtils } = require('../utils/roleUtils');
const { ServerUtils } = require('../utils/serverUtils');
const cfg = container.resolve(ConfigContext).config
const t = container.resolve(TranslationContext).getGlobalTranslator();
const userService  = container.resolve(UserService)
//Make description go from lang file
module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription(t("discord.commands.verify.description"))
    .addStringOption((option) =>
      option
        .setName("code")
        .setDescription(t("discord.commands.verify.optionDescription"))
        .setRequired(true)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const roleUtils = new RoleUtils(interaction.client);
    const serverUtils = new ServerUtils(interaction.client, roleUtils);
    const verificationRoleUtils = new VerificationRoleUtils(interaction.client,roleUtils,serverUtils);  

    const code = await interaction.options.getString("code");
    try {
      await userService.verify(interaction.user.id, code);
    } catch (error) {
      await interaction.reply({
        embeds: [
          await DiscordEmbeds.defaultEmbed(
            toUserError(error),
            null,
            cfg.discordColors.error
          ),
        ],
      });
      return;
    }
    await verificationRoleUtils.setRolesUser(interaction.user.id)
    await interaction.reply({
        embeds: [
          await DiscordEmbeds.defaultEmbed(
            t('discord.commands.verify.message'),
            null,
            cfg.discordColors.success
          ),
        ],
      });
  },
};
   