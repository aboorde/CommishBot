import { SlashCommandBuilder } from "discord.js";
import { Client } from "../../espnClient.cjs";
import { espnMembers } from "../../constants/espnMembers.js";

export const data = new SlashCommandBuilder()
  .setName("standings")
  .setDescription("Returns standings by week and year")
  .addIntegerOption((option) =>
    option
      .setName("week")
      .setDescription("Input week of standings")
      .setRequired(true)
  )
  .addIntegerOption((option) =>
    option
      .setName("year")
      .setDescription("Input year of standings")
      .setRequired(true)
  );

export const execute = async (interaction) => {
  const matchupWeek = interaction.options.getInteger("week");
  const matchupYear = interaction.options.getInteger("year");

  if (!matchupWeek || !matchupYear) {
    await interaction.reply({
      content: "Incorrect parameters input",
      ephemeral: true,
    });
    return;
  }

  const { LEAGUE_ID, ESPN_S2, SWID } = process.env;
  if (!LEAGUE_ID || !ESPN_S2 || !SWID) {
    await interaction.reply({
      content: "Missing required environment variables",
      ephemeral: true,
    });
    return;
  }

  if (matchupYear < 2018) {
    await interaction.reply({
      content: "Cant view activity before 2018",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const client = new Client({ leagueId: Number.parseInt(LEAGUE_ID) });
    client.setCookies({ espnS2: ESPN_S2, SWID });

    const teams = await myClient.getTeamsAtWeek({
      seasonId: Number.parseInt(matchupYear),
      scoringPeriodId: Number.parseInt(matchupWeek),
    });

    let sortedTeams;
    if (teams[0].finalStandingsPosition === 0) {
      sortedTeams = teams.sort((a, b) => a.playoffSeed - b.playoffSeed);
    } else {
      sortedTeams = teams.sort(
        (a, b) => a.finalStandingsPosition - b.finalStandingsPosition
      );
    }

    let response = "";

    sortedTeams.forEach((team) => {
      const member = espnMembers.find((member) => member.id === team.id);
      const memberName = member ? member.name : "Unknown";

      const position = team.finalStandingsPosition || team.playoffSeed;
      const record = `(${team.wins}-${team.losses}-${team.ties})`;

      if (position === 1) {
        response += `#${position} 👑${memberName} ${record}👑\n`;
      } else if (position === 14) {
        response += `#${position} 💩${memberName} ${record}💩\n`;
      } else {
        response += `#${position} ${memberName} ${record}\n`;
      }
    });

    console.log(response);

    await interaction.editReply({ content: response, ephemeral: true });
  } catch (e) {
    console.error("Standings command error: ", e);
    await interaction.editReply({
      content: `An error occurred: ${e.message}`,
      ephemeral: true,
    });
  }
};
