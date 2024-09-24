const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits  } = require('discord.js');
const { ConfigContext } = require('@contexts/ConfigContext.js')
const { TranslationContext } = require("@contexts/TranslationContext.js")
const { GuildService } = require('@services/GuildService.js')
const { DatabaseContext } = require('@contexts/DatabaseContext.js')
const { DiscordEmbeds } = require('@discord-embeds/embeds.js');
const {toUserError} = require('@utils/toUserError')

const container = require('@root/container.js');
const { UserService } = require('@root/services/UserService');

const cfg = container.resolve(ConfigContext).config
const t = container.resolve(TranslationContext).getGlobalTranslator()

const userService = container.resolve(UserService)

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription(t("discord.commands.lock.description"))
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription(t("discord.commands.lock.actionDescription"))
        .setRequired(true)
        .addChoices({ name: "on", value: "on" }, { name: "off", value: "off" })
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const action = await interaction.options.getString("action");
    try {
      switch (action) {
        case "on":
            console.log("on")  
            await userService.lock(interaction.user.id);
          
          break;

        case "off":
            console.log("off")  
            await userService.unlockById(interaction.user.id);
          break;
      }
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
        return
    }
    await interaction.reply({
        embeds: [
          await DiscordEmbeds.defaultEmbed(
            t(`discord.commands.lock.messages.${action}`),
            null,
            cfg.discordColors.success
          ),
        ],
      }); 
  },
};           