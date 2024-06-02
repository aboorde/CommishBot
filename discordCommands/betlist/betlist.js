import { SlashCommandBuilder } from "discord.js";
import { sql } from "@vercel/postgres";

// Define the slash command
export const data = new SlashCommandBuilder()
  .setName("betlist")
  .setDescription("Lists all current bets made");

// Main command execution function
export const execute = async (interaction) => {
  await interaction.deferReply();

  try {
    const result = await sql`SELECT * FROM Bets;`;

    const headers = result.fields.map((field) => field.name);
    const betData = await getBetData(result.rows, headers, interaction);

    const table = generateTable(headers, betData);
    await interaction.editReply({
      content: "```\n" + table + "\n```",
    });
  } catch (error) {
    console.error("Error creating bet list: ", error);
    await interaction.editReply({
      content: "Error getting the bet list. Report to owner",
      ephemeral: true,
    });
  }
};

// Helper function to get bet data
const getBetData = async (rows, headers, interaction) => {
  return Promise.all(
    rows.map(async (row) => {
      return Promise.all(
        headers.map(async (header) => {
          if (header === "bettorone" || header === "bettortwo") {
            try {
              const user = await interaction.guild.members.fetch(row[header]);
              return user.nickname || "Unknown";
            } catch (error) {
              console.error(`Error fetching user ${row[header]}: `, error);
              return "Unknown";
            }
          } else {
            return row[header];
          }
        })
      );
    })
  );
};

// Helper function to generate a table string
const generateTable = (headers, betData) => {
  let table = "";

  const colWidths = headers.map(
    (header, i) =>
      Math.max(header.length, ...betData.map((row) => String(row[i]).length)) +
      2
  );

  // Top border
  table += generateBorder(colWidths);

  // Header row
  table += generateRow(headers, colWidths);

  // Separator
  table += generateBorder(colWidths);

  // Data rows
  for (let row of betData) {
    table += generateDataRows(row, colWidths);
  }

  return table;
};

// Helper function to generate the table border
const generateBorder = (colWidths) => {
  let border = "+";
  for (let width of colWidths) {
    border += "-".repeat(width) + "+";
  }
  border += "\n";
  return border;
};

// Helper function to generate a single row of the table
const generateRow = (cells, colWidths) => {
  let row = "|";
  cells.forEach((cell, i) => {
    row += " " + String(cell).padEnd(colWidths[i] - 1) + "|";
  });
  row += "\n";
  return row;
};

// Helper function to generate data rows, including handling multiline cells
const generateDataRows = (row, colWidths) => {
  let splitRows = row.map((cell, i) =>
    splitCell(String(cell), colWidths[i] - 2)
  );
  let maxLines = Math.max(...splitRows.map((lines) => lines.length));
  let rows = "";

  for (let line = 0; line < maxLines; line++) {
    rows += "|";
    for (let i = 0; i < row.length; i++) {
      rows += " " + (splitRows[i][line] || "").padEnd(colWidths[i] - 1) + "|";
    }
    rows += "\n";
  }

  rows += generateBorder(colWidths);
  return rows;
};

// Helper function to split cell content into multiple lines
const splitCell = (cell, width) => {
  const regex = new RegExp(`.{1,${width}}`, "g");
  return cell.match(regex) || [];
};
