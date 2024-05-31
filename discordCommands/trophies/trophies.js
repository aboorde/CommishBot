import { SlashCommandBuilder } from "discord.js";
import pkg from "espn-fantasy-football-api/node.js";
const { Client } = pkg;
import { formatNumber } from "../../helpers/utils.js";
import { espnMembers } from "../../constants/espnMembers.js";

export const data = new SlashCommandBuilder()
  .setName("trophies")
  .setDescription("Returns trophies by week and year")
  .addStringOption((option) =>
    option
      .setName("week")
      .setDescription("input week of matchup")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("year")
      .setDescription("input year of matchup")
      .setRequired(true)
  );

export async function execute(interaction) {
  const matchupWeek = interaction.options.getString("week");
  const matchupYear = interaction.options.getString("year");
  console.log(("WAT MATCH", matchupWeek, matchupYear));
  if (!matchupWeek || !matchupYear) {
    await interaction.reply({
      content: "incorrect parameters input",
      ephemeral: true,
    });
    return;
  }
  await interaction.deferReply({ ephemeral: true });
  const response = await getMatchups(matchupWeek, matchupYear);
  await interaction.editReply({ content: response, ephemeral: true });
}

const getMatchups = async (matchupWeek = 1, matchupYear = 2023) => {
  let lowScore = 9999;
  let lowScoreTeam = "";
  let highScore = -1;
  let highScoreTeam = "";
  let closeScore = 9999;
  let closeScoreWinner = "";
  let closeScoreLoser = "";
  let biggestBlowout = -1;
  let biggestBlowoutWinner = "";
  let biggestBlowoutLoser = "";

  // return new Promise(function (resolve, reject) {
  const myClient = await new Client({
    leagueId: Number.parseInt(process.env.LEAGUE_ID),
  });
  await myClient.setCookies({
    espnS2: process.env.ESPN_S2,
    SWID: process.env.SWID,
  });
  console.error("WAT MY CLIENT", myClient);
  return await myClient
    .getBoxscoreForWeek({
      seasonId: Number.parseInt(matchupYear),
      matchupPeriodId: Number.parseInt(matchupWeek),
      scoringPeriodId: Number.parseInt(matchupWeek),
    })
    .then((matchups) => {
      console.error("WAT MY matchups", matchups);
      matchups.forEach(({ homeTeamId, awayTeamId, homeScore, awayScore }) => {
        const homeMemberName = espnMembers.find(
          (member) => member.id === homeTeamId
        ).name;
        const awayMemberName = espnMembers.find(
          (member) => member.id === awayTeamId
        ).name;

        if (homeScore > highScore) {
          highScore = homeScore;
          highScoreTeam = homeMemberName;
        }
        if (homeScore < lowScore) {
          lowScore = homeScore;
          lowScoreTeam = homeMemberName;
        }
        if (awayScore > highScore) {
          highScore = awayScore;
          highScoreTeam = awayMemberName;
        }
        if (awayScore < lowScore) {
          lowScore = awayScore;
          lowScoreTeam = awayMemberName;
        }
        if (
          awayScore - homeScore !== 0 &&
          Math.abs(awayScore - homeScore) < closeScore
        ) {
          closeScore = Math.abs(awayScore - homeScore);
          if (awayScore - homeScore < 0) {
            closeScoreWinner = homeMemberName;
            closeScoreLoser = awayMemberName;
          } else {
            closeScoreWinner = awayMemberName;
            closeScoreLoser = homeMemberName;
          }
        }
        if (Math.abs(awayScore - homeScore) > biggestBlowout) {
          biggestBlowout = Math.abs(awayScore - homeScore);
          if (awayScore - homeScore < 0) {
            biggestBlowoutWinner = homeMemberName;
            biggestBlowoutLoser = awayMemberName;
          } else {
            biggestBlowoutWinner = awayMemberName;
            biggestBlowoutLoser = homeMemberName;
          }
        }
      });
      let response =
        `Week ${matchupWeek} ${matchupYear} Trophies:\n` +
        `- Lowest Score with ${formatNumber(
          lowScore
        )} points: ${lowScoreTeam}\n` +
        `- Highest Score with ${formatNumber(
          highScore
        )} points: ${highScoreTeam}\n` +
        `- ${closeScoreWinner} barely beat ${closeScoreLoser} by a margin of ${formatNumber(
          closeScore
        )} points\n` +
        `- ${biggestBlowoutLoser} blown out by ${biggestBlowoutWinner} by a margin of ${formatNumber(
          biggestBlowout
        )}`;
      console.log(response);
      return response;
    })
    .catch((err) => {
      console.error(err);
      return "API returned an error. You did something stupid or it's broken. Try again later";
    });
  // });
};
