import "dotenv/config";

import express from "express";
import { respond } from "./bot.js";
import { Client, GatewayIntentBits } from "discord.js";

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

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.send("CommishBot, reporting for duty."));

app.post("/groupme", (req, res) => respond(req.body));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
