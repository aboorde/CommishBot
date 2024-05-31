import "dotenv/config";

import express from "express";
import fs from "node:fs";
import path from "node:path";
import { respond } from "./bot.js";
import { Client, Collection, GatewayIntentBits, Events } from "discord.js";
import { fileURLToPath } from "url";

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// When the client is ready, run this code (only once)
client.once("ready", () => {
  console.log("Ready!");
});

client.commands = new Collection();

// Get the current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const foldersPath = path.join(__dirname, "discordCommands");

try {
  const commandFolders = fs
    .readdirSync(foldersPath)
    .filter((folder) =>
      fs.statSync(path.join(foldersPath, folder)).isDirectory()
    );

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }
} catch (err) {
  console.error("Error reading command folders:", err);
}
// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);

client.on("messageCreate", (message) => {
  if (!message.author.bot && message.content.charAt(0) == "!") {
    respond(message.content, "discord").then((res) => {
      if (res && res.text) {
        message.channel.send(res.text);
      }
    });
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
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
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.send("CommishBot, reporting for duty."));

app.post("/groupme", (req, res) => respond(req.body));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
