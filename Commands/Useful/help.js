const settings = require("../../config.json");
const colors = require("../../Helpers/colors.js");
const constants = require("../../Data/constants.json");
module.exports = {
  name: "help",
  description: `Get help on How to Use ${constants.name} and the Specific Commands.`,
  aliases: ["h"],
  usage: "[(Category)]",
  execute: (message, args, client) => {
    let customMessage = "";
    if (args.length === 0) {
      for (let category of client.commandCategories) {
        if (category === undefined) continue;
        customMessage += `${colors.bright}${colors.fg.cyan}=> ${colors.bright}${
          colors.fg.red
        }${[category.split("")[0].toUpperCase(), category.substring(1)].join(
          ""
        )}\n`;
      }
      message.channel.send(`\`\`\`ansi
${colors.bright}${colors.fg.cyan}Welcome to ${colors.fg.red}${constants.name}
${colors.fg.cyan}Version: ${colors.fg.red}${constants.version} ${colors.fg.cyan}

${colors.bright}${colors.fg.cyan}Prefix: ${colors.bright}${colors.fg.red}${settings.prefix}
${colors.bright}${colors.fg.cyan}Usage: ${colors.bright}${colors.fg.blue}() ${colors.fg.cyan}Alias. ${colors.fg.red}${colors.fg.blue}[{}] ${colors.fg.cyan}Required. ${colors.fg.blue}[()] ${colors.fg.cyan}Optional.

${customMessage}
\`\`\``);
      return;
    }
    if (
      !client.commandCategories.includes(
        [args[0].split("")[0].toUpperCase(), args[0].substring(1)].join("")
      )
    ) {
      message.channel.send(`\`\`\`ansi
${colors.bright}${colors.fg.cyan}Category: ${colors.bright}${colors.fg.red}Not Found
\`\`\``);
      return;
    }
    for (const command of client.commands.values()) {
      if (
        [args[0].split("")[0].toUpperCase(), args[0].substring(1)].join("") ===
        command.category
      ) {
        if (command.aliases) {
          if (command.usage) {
            customMessage += `${colors.bright}${colors.fg.cyan}=> ${
              colors.bright
            }${colors.fg.red}${[
              command.name.split("")[0].toUpperCase(),
              command.name.substring(1),
            ].join("")} ${colors.fg.blue}(${
              colors.fg.red
            }${command.aliases.toString()}${colors.fg.blue}) ${colors.reset}- ${
              colors.bright
            }${colors.fg.blue}${command.description} ${colors.reset}- ${
              colors.bright
            }${colors.fg.red}${command.usage}\n`;
            continue;
          }
          customMessage += `${colors.bright}${colors.fg.cyan}=> ${
            colors.bright
          }${colors.fg.red}${[
            command.name.split("")[0].toUpperCase(),
            command.name.substring(1),
          ].join("")} ${colors.fg.blue}(${
            colors.fg.red
          }${command.aliases.toString()}${colors.fg.blue}) ${colors.reset}- ${
            colors.bright
          }${colors.fg.blue}${command.description}\n`;
          continue;
        } else {
          if (command.usage) {
            customMessage += `${colors.bright}${colors.fg.cyan}=> ${
              colors.bright
            }${colors.fg.red}${[
              command.name.split("")[0].toUpperCase(),
              command.name.substring(1),
            ].join("")} ${colors.reset}- ${colors.bright}${colors.fg.blue}${
              command.description
            } ${colors.reset}- ${colors.bright}${colors.fg.red}${
              command.usage
            }\n`;
            continue;
          }
          customMessage += `${colors.bright}${colors.fg.cyan}=> ${
            colors.bright
          }${colors.fg.red}${[
            command.name.split("")[0].toUpperCase(),
            command.name.substring(1),
          ].join("")} ${colors.reset}- ${colors.bright}${colors.fg.blue}${
            command.description
          }\n`;
          continue;
        }
      } else {
        continue;
      }
    }
    message.channel.send(`\`\`\`ansi
${colors.bright}${colors.fg.cyan}Category: ${colors.bright}${colors.fg.red}${[
      args[0].split("")[0].toUpperCase(),
      args[0].substring(1),
    ].join("")}

${colors.bright}${colors.fg.cyan}Prefix: ${colors.bright}${colors.fg.red}${
      settings.prefix
    }
${colors.bright}${colors.fg.cyan}Usage: ${colors.bright}${colors.fg.blue}() ${
      colors.fg.cyan
    }Alias. ${colors.fg.red}${colors.fg.blue}[{}] ${colors.fg.cyan}Required. ${
      colors.fg.blue
    }[()] ${colors.fg.cyan}Optional.

${customMessage}
\`\`\``);
  },
};
