require('module-alias/register')
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const container = require('@root/container.js')
 
const path = require('node:path');
const { ConfigContext } = require('@root/contexts/ConfigContext.js');

const cfg = container.resolve(ConfigContext).config

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commands = []; // Initialize an array to hold the command data

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}
// Construct and prepare an instance of the REST module
const rest = new REST().setToken(cfg.discordBotToken);

// Deploy commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(
            Routes.applicationCommands(cfg.discrodClientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();
