const { SlashCommandBuilder, ChatInputCommandInteraction} = require('discord.js');
const {DiscordEmbeds} = require('@discord-embeds/embeds.js')
const {ConfigContext} = require('@contexts/ConfigContext.js')
const {TranslationContext} = require('@contexts/TranslationContext.js')
const {UserService} = require('@services/UserService.js')
const {toUserError} = require('@utils/toUserError')
const container = require('@root/container.js')
const cfg = container.resolve(ConfigContext).config
const t = container.resolve(TranslationContext).getGlobalTranslator();
const userService  = container.resolve(UserService)

//Make description go from lang file
module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("send_code")
    .setDescription(t("discord.commands.send_code.description"))
    .addStringOption((option) =>
      option
        .setName("email")
        .setDescription(t("discord.commands.send_code.optionDescription"))
        .setRequired(true)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const email = await interaction.options.getString("email");
    try {
      await userService.sendCode(interaction.user.id, email);
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
    await interaction.reply({
        embeds: [
          await DiscordEmbeds.defaultEmbed(
            t('discord.commands.send_code.message', {email}),
            null,
            cfg.discordColors.success
          ),
        ],
      });
  },
};
   