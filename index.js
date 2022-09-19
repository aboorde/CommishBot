require("dotenv").config();

var bot = require("./bot.js");
const express = require("express");
const app = express();
const { Client, GatewayIntentBits } = require("discord.js");

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
    bot.respond(message.content, "discord").then((res) => {
      if (res && res.text) {
        message.channel.send(res.text);
      }
    });
  }
});
app.use(express.json());

app.get("/", function (req, res) {
  res.send("CommishBot, reporting for duty.");
});

app.post("/groupme", function (req, res) {
  bot.respond(req.body);
});

app.listen(process.env.PORT || 5000, function () {
  console.log("Listening on port 5000...");
});
