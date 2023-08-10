module.exports = {
  name: "messageEdit",
  execute: (message, client) => {
    client.editedMessages.set(message.id, client.messages.get(message.id));
  },
};
