const colors = require("../../Helpers/colors.js");

module.exports = {
  name: "purge",
  description: "Purges Specified Number of Message. Default 100.",
  usage: "[(Number of Messages)]",
  execute: (message, args, client) => {
    let number = new Number((args[0] += 1));
    if (number === 1) number = 100;
    client.getMessages(message.channel.id, number, (messages) => {
      let count = 0;
      for (const msg of messages) {
        let fetchedMessages = client.messages.get(msg.id);
        setTimeout(() => {
          if (count < number) {
            fetchedMessages?.delete();
            count++;
          }
        }, 500);
      }
      message.channel.send(`\`\`\`ansi
${colors.bright}${colors.fg.cyan}Purged: ${colors.fg.red}${count} Messages.\`\`\``);
    });
  },
};
