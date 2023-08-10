const settings = require("../config.json");

module.exports = {
  name: "messageCreate",
  execute: (message, client) => {
    let prefix = settings.prefix;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (cmd.length == 0) return;
    let command = client.commands.get(cmd);
    if (message.author.bot) return;
      command.execute(message, args, client);
  },
};
