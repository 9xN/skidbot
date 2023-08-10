const colors = require("../../Helpers/colors.js");
const functions = require("../../Structure/Functions.js");
module.exports = {
  name: "uptime",
  description: "Shows Current Uptime.",
  execute: (message, args, client) => {
    message.channel.send(
      `\`\`\`ansi\n${colors.bright}${colors.fg.cyan}Uptime: ${
        colors.fg.red
      }${functions.format(process.uptime)}\`\`\``
    );
  },
};
