const os = require("os");
const colors = require("../../Helpers/colors.js");
const settings = require("../../config.json");
const constants = require("../../Data/constants.json");
const functions = require("../../Structure/Functions.js");

module.exports = {
  name: "stats",
  description: "Shows Current Stats of Selfbot.",
  execute: (message, args, client) => {
    const uptime = process.uptime();

    message.channel.send(`\`\`\`ansi
${colors.bright}${colors.fg.cyan}Name: ${colors.fg.red}1337Selfbot
${colors.bright}${colors.fg.cyan}Version: ${colors.fg.red}${constants.version}
${colors.bright}${colors.fg.cyan}Uptime: ${colors.fg.red}${functions.format(
      uptime
    )}
${colors.bright}${colors.fg.cyan}Ping: ${colors.fg.red}${
      new Date(message.timestamp).getTime() - new Date().getTime()
    }ms
${colors.bright}${colors.fg.cyan}Guilds: ${colors.fg.red}${client.guilds.size}
${colors.bright}${colors.fg.cyan}Commands: ${colors.fg.red}${
      client.commands.size
    }
${colors.bright}${colors.fg.cyan}Categories: ${colors.fg.red}${
      client.commandCategories.length
    }
\`\`\``);
  },
};
