const colors = require("../../Helpers/colors.js");
module.exports = {
  name: "serverlookup",
  description: "Looks up Info on Server id.",
  aliases: ["server"],
  usage: "[{Server ID}]",
  execute: (message, args, client) => {
    client.getServerInfo(args[0], (server) => {
      client.getUsersInfo(server.owner_id, (user) => {
        message.channel.send(`\`\`\`ansi
${colors.bright}${colors.fg.cyan}Server ID: ${colors.fg.red}${server.id}
${colors.bright}${colors.fg.cyan}Name: ${colors.fg.red}${server.name}
${colors.bright}${colors.fg.cyan}Owner: ${colors.fg.red}${user.username}#${
          user.discriminator
        } ${colors.fg.blue}(${colors.fg.cyan}${user.id}${colors.fg.blue})
${colors.bright}${colors.fg.cyan}Roles: ${colors.fg.red}${server.roles.length}
${colors.fg.cyan}Created: ${colors.fg.red}${new Date(
          new Number(BigInt(server.id) >> 22n) + 1420070400000
        )}\`\`\``);
      });
    });
  },
};
