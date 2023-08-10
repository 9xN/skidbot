module.exports = {
  name: "messageDelete",
  execute: (message, client) => {
    client.deletedMessages.set(message.id, client.messages.get(message.id));
  },
};
