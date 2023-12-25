/* Usado na conexão  com  o  Discord  por  meio  da  biblioteca
   Discord.js. Atente-se para o fato de que algumas informações
   foram oculdas deste código e  de  outros  arquivos  .js  por
   segurança. O arquivo  .js  principal  é  App.js  (onde  você
   está). Mais detalhes sobre  ele  podem  ser  encontrados  ao
   longo deste código.*/
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const { Token } = require('./Config/Credentials.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ]
})

client.on("ready", () => {
    console.log(`Successfully logged in as ${client.user.tag}`)
})

client.commands = new Collection();

/* Lidando de  maneira  dinâmica  com  os  comandos  usando  um
   command handler. Itera sobre  cada  subdiretório  dentro  do
   diretório, lista os arquivos JavaScript (.js),  requer  cada
   arquivo (carregando  o  módulo),  e  verifica  se  o  módulo
   exporta as propriedades esperadas (data e execute). Se  tudo
   estiver  correto,  o  comando   é   adicionado   à   coleção
   client.commands. */
const foldersPath = path.join(__dirname, 'Commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.login(Token);