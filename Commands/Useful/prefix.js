const settings = require("../../config.json");
const colors = require("../../Helpers/colors.js");
const fs = require("fs/promises");
module.exports = {
  name: "prefix",
  description: "Changes Prefix to Specified Prefix.",
  aliases: ["px"],
  usage: "[{Prefix}]",
  execute: (message, args, client) => {
    settings.prefix = args[0];
    fs.writeFile("././config/settings.json", JSON.stringify(settings)).then(
      () => {
        message.channel.send(`\`\`\`ansi
${colors.bright}${colors.fg.cyan}Prefix changed to: ${colors.bright}${colors.fg.red}${settings.prefix}
\`\`\``);
      }
    );
  },
};
