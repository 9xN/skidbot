const colors = require("../../Helpers/colors.js");
module.exports = {
  name: "userlookup",
  description: "Looks up Info on User id.",
  aliases: ["user"],
  usage: "[{User ID}]",
  execute: (message, args, client) => {
    client.getUsersInfo(args[0], (user) => {
      message.channel.send(`\`\`\`ansi
${colors.bright}${colors.fg.cyan}User ID: ${colors.fg.red}${user.id}
${colors.bright}${colors.fg.cyan}Username: ${colors.fg.red}${user.username}
${colors.bright}${colors.fg.cyan}Discriminator: ${colors.fg.red}${
        user.discriminator
      }
${colors.fg.cyan}Created: ${colors.fg.red}${new Date(
        new Number(BigInt(user.id) >> 22n) + 1420070400000
      )}\`\`\``);
    });
  },
};
