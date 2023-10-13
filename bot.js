import fetch from "node-fetch";

const botId = process.env.BOT_ID;

import all from "./commands/all.js";
import flip from "./commands/flip.js";
import ping from "./commands/ping.js";
import pins from "./commands/pins.js";
import roll from "./commands/roll.js";
import draft from "./commands/draft.js";
import help from "./commands/help.js";
import insult from "./commands/insult.js";
import scores from "./commands/scores.js";
import closestScores from "./commands/closestScores.js";
import trophies from "./commands/trophies.js";
import giphy from "./commands/giphy.js";
import standings from "./commands/standings.js";
import activity from "./commands/activity.js";
import power from "./commands/power.js";
import chat from "./commands/chat.js";
import matchup from "./commands/sleeper/matchup.js";
import image from "./commands/image.js";

const groupmeCommands = {
  all,
  flip,
  ping,
  pins,
  roll,
  draft,
  help,
  insult,
  scores,
  closestScores,
  trophies,
  giphy,
  standings,
  activity,
  power,
  chat,
  image,
};

const discordCommands = {
  flip,
  ping,
  pins,
  roll,
  help,
  insult,
  scores,
  giphy,
  chat,
  matchup,
  image,
};

/**
 * Extracts request message and responds if necessary.
 * Send request to GroupMe API to post message on bot's behalf
 */
export const respond = async (request, app = "groupme") => {
  let message;

  if (app === "discord") {
    message = request;
  } else {
    message = request.text;
  }

  if (message.charAt(0) === "!") {
    const commandKey = message.split(" ")[0].substring(1); // Extract command key
    let command;
    if (app === "discord") {
      command = discordCommands[commandKey];
    } else {
      command = groupmeCommands[commandKey];
    }

    if (command && message.match(command.matcher) !== null) {
      const response = await command.run(message, request);
      if (response) {
        if (app === "discord") {
          return Promise.resolve(response);
        } else {
          await sendHttpRequest(response);
        }
      }
    }
  }
};

const sendHttpRequest = async (response) => {
  response.bot_id = botId;
  const url = "https://api.groupme.com/v3/bots/post";
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(response),
  };

  const res = await fetch(url, options);

  if (res && res.status !== 202) {
    const error = new Error(`rejecting bad status code ${res.status}`);
    console.error(error);
    throw error;
  }
};
