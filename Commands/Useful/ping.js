//const colors = require("../Helpers/colors.js")
const colors = require("../../Helpers/colors.js");

module.exports = {
  name: "ping",
  description: "Sends Current Ping (ms).",
  aliases: ["p"],
  execute: async (message, args, client) => {
    message.channel.send(
      `\`\`\`ansi\n${colors.bright}${colors.fg.cyan}Ping: ${colors.fg.red}${
        new Date(message.timestamp).getMilliseconds() -
        new Date().getMilliseconds()
      }${colors.fg.blue}ms\`\`\``
    );
  },
};
