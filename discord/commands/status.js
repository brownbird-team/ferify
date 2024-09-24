const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits  } = require('discord.js');
const { ConfigContext } = require('@contexts/ConfigContext.js')
const { TranslationContext } = require("@contexts/TranslationContext.js")
const container = require('@root/container.js');
const { UserService } = require('@root/services/UserService');
const {StatusEnum2Emoji, StatusEnum2Color} = require('@discord-utils/enums.js')
const {DiscordEmbeds} = require('@discord-embeds/embeds.js')
const cfg = container.resolve(ConfigContext).config
const t = container.resolve(TranslationContext).getGlobalTranslator()
const userService = container.resolve(UserService)



module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription(t("discord.commands.status.description")),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const status = await userService.getStatus(interaction.user.id);

    interaction.reply({
      embeds: [
        await DiscordEmbeds.defaultEmbed(
          t("discord.commands.status.title"),
          t("discord.commands.status.message", {
            verificationStatus: await StatusEnum2Emoji(status.verified),
            lockStatus: await StatusEnum2Emoji(status.locked),
          }),
          await StatusEnum2Color(status.verified)
        ),
      ],
    });
  },
};