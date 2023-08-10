const colors = require("./Helpers/colors.js");
const fs = require("fs/promises");
const Client = require("./Structure/Websocket.js");
const client = new Client();
const logger = require("./Helpers/logger.js");
require("dotenv").config();
let commands = new Map();

const initialize = async () => {
  process.chdir(__dirname);
  fs.readdir("./Commands/").then((files) => {
    for (const file of files) {
      fs.readdir("./Commands/" + file).then((commandDir) => {
        for (const commandFile of commandDir) {
          const command = require(`./Commands/${file}/${commandFile}`);
          client.commands.set(command.name, command);
          command.category = file;
          commands.set(command.name, command);
          if (command.aliases && Array.isArray(command.aliases)) {
            command.aliases.forEach((alias) => {
              client.commandAliases.set(alias, command.name);
            });
            if (!client.commandCategories.includes(command.category)) {
              client.commandCategories.push(command.category);
            }
          }
          if (!client.commandCategories.includes(command.category)) {
            client.commandCategories.push(command.category);
          }
        }
      });
    }
  });

  fs.readdir("./Events/").then((files) => {
    for (const file of files) {
      const event = require(`./Events/${file}`);
      client.on(event.name, (user) => {
        event?.execute(user, client);
      });
    }
  });
};
client.login(process.env.token);
initialize();

console.log(
  `${colors.bright}${colors.fg.cyan}  ╔╗╔═══╦═══╦═══╦═══╦═══╦╗  ╔═══╦══╗╔═══╦════╗`
);
console.log(
  `${colors.bright}${colors.fg.cyan} ╔╝║║╔═╗║╔═╗║╔═╗║╔═╗║╔══╣║  ║╔══╣╔╗║║╔═╗║╔╗╔╗║`
);
console.log(
  `${colors.bright}${colors.fg.cyan} ╚╗║╚╝╔╝╠╝╔╝╠╝╔╝║╚══╣╚══╣║  ║╚══╣╚╝╚╣║ ║╠╝║║╚╝`
);
console.log(
  `${colors.bright}${colors.fg.cyan}  ║║╔╗╚╗╠╗╚╗║ ║╔╩══╗║╔══╣║ ╔╣╔══╣╔═╗║║ ║║ ║║  `
);
console.log(
  `${colors.bright}${colors.fg.cyan} ╔╝╚╣╚═╝║╚═╝║ ║║║╚═╝║╚══╣╚═╝║║  ║╚═╝║╚═╝║ ║║  `
);
console.log(
  `${colors.bright}${colors.fg.cyan} ╚══╩═══╩═══╝ ╚╝╚═══╩═══╩═══╩╝  ╚═══╩═══╝ ╚╝  `
);
console.log(`${colors.bright}${colors.fg.cyan}`);

process.on(`uncaughtException`, (error) => {
  if (!client) return;
  logger.log(`uncaughtException\n` + error.message);
});
process.on(`unhandledRejection`, (listener) => {
  if (!client) return;
  logger.log(`unhandledRejection\n` + listener.message);
});
process.on(`rejectionHandled`, (listener) => {
  if (!client) return;
  logger.log(`rejectionHandled\n` + listener.message);
});
process.on(`warning`, (warning) => {
  if (!client) return;
  logger.log(`warning\n` + warning.message);
});
