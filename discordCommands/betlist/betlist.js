import { SlashCommandBuilder } from "discord.js";
import { sql } from "@vercel/postgres";

export const data = new SlashCommandBuilder()
  .setName("betlist")
  .setDescription("Lists all current bets made");

export const execute = async (interaction) => {
  await interaction.deferReply();

  try {
    const result = await sql`
      SELECT * FROM Bets;
  `;
    const headers = result.fields.map((field) => field.name);
    const data = result.rows.map((row) =>
      headers.map(async (header) => {
        if (header === "bettorone" || header === "bettortwo") {
          username = await interaction.guild.members.fetch(row[header]);
          if (username) return username;
          return "Unknown";
        } else {
          return row[header];
        }
      })
    );
    const table = generateTable(headers, data);
    await interaction.editReply({
      content: "```\n" + table + "\n```",
    });
  } catch (error) {
    console.error("create error: ", error);
    await interaction.editReply({
      content: "Error getting the bet list. Report to owner",
      ephemeral: true,
    });
  }
};

const generateTable = (headers, data) => {
  let table = "";

  // Calculate the width of each column
  const colWidths = headers.map(
    (header, i) =>
      Math.max(header.length, ...data.map((row) => row[i].length)) + 2
  );

  // Top border
  table += "+";
  for (let width of colWidths) {
    table += "-".repeat(width) + "+";
  }
  table += "\n";

  // Header row
  table += "|";
  for (let header of headers) {
    table += " " + header.padEnd(colWidths[headers.indexOf(header)] - 1) + "|";
  }
  table += "\n";

  // Separator
  table += "+";
  for (let width of colWidths) {
    table += "-".repeat(width) + "+";
  }
  table += "\n";

  // Data rows
  for (let row of data) {
    let splitRows = row.map((cell, i) => splitCell(cell, colWidths[i] - 2));
    let maxLines = Math.max(...splitRows.map((lines) => lines.length));
    for (let line = 0; line < maxLines; line++) {
      table += "|";
      for (let i = 0; i < headers.length; i++) {
        table +=
          " " + (splitRows[i][line] || "").padEnd(colWidths[i] - 1) + "|";
      }
      table += "\n";
    }
    // Separator between rows
    table += "+";
    for (let width of colWidths) {
      table += "-".repeat(width) + "+";
    }
    table += "\n";
  }

  return table;
};

const splitCell = (cell, width) => {
  const regex = new RegExp(`.{1,${width}}`, "g");
  return cell.match(regex) || [];
};
