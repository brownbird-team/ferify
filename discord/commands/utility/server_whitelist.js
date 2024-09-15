const { SlashCommandBuilder,ChatInputCommandInteraction, discordSort } = require('discord.js');
const {ConfigContext} = require('../../../contexts/ConfigContext.js')
const {TranslationContext} = require("../../../contexts/TranslationContext.js")

const tctx = TranslationContext.getInstance();
const t = tctx.getGlobalTranslator();

const cfg = ConfigContext.getConfig()

module.exports = {
    cooldown: 5,
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
        if(cfg.admins.includes(interaction.user.id)){
            const action = await interaction.options.getString("action")
            const serverId = await interaction.options.getString("server_id")

            if(checkSnowflake(serverId)){
                //DatabaseStuff
            }
            else
                await interaction.reply(t('errors.snowflakeError'));

        }
        else
            await interaction.reply(`I dont know you`);
	},
};

const snowflakeRegex = /^\d{17,19}$/;
/**
 * Checks if string is valid snowflake
 * @param {string} snowflake 
 * @returns {boolean} 
 */
const checkSnowflake = (snowflake) => snowflakeRegex.test(snowflake)