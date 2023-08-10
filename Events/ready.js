const colors = require("../Helpers/colors.js");
const constants = require("../Data/constants.json");

module.exports = {
  name: "ready",
  execute: (ready, client) => {
    // console.log(` ${colors.bright}${colors.fg.cyan}Welcome to ${constants.name}.`);
    if (client.user.discriminator === "0") {
      console.log(
        ` ${colors.bright}${colors.fg.cyan}Logged In as: ${colors.fg.red}${client.user.username} ${colors.fg.blue}(${colors.fg.red}${client.user.id}${colors.fg.blue})`
      );
    } else {
      console.log(
        ` ${colors.bright}${colors.fg.cyan}Logged In as: ${colors.fg.red}${client.user.username}#${client.user.discriminator} ${colors.fg.blue}(${colors.fg.red}${client.user.id}${colors.fg.blue})`
      );
    }
    console.log(
      ` ${colors.bright}${colors.fg.cyan}Version: ${colors.fg.red}${constants.version}`
    );
    console.log(
      ` ${colors.bright}${colors.fg.cyan}Commands: ${colors.fg.red}${client.commands.size}`
    );
    for (const category of client.commandCategories) {
      console.log(
        ` ${colors.bright}${colors.fg.cyan}Loaded Category: ${colors.fg.red}${[
          category.split("")[0].toUpperCase(),
          category.substring(1),
        ].join("")}`
      );
    }
    let large_image = "1";
    client.getAssets("", (assets) => {
      for (const asset of assets) {
        if (asset.name === large_image) {
          client.setStatus("dnd", [
            {
              type: 3,
              name: "you skids",
              created_at: Date.now(),
              application_id: "",
              details: "you skids",
              assets: {
                large_image: asset.id,
              },
            },
          ]);
          continue;
        }
        continue;
      }
    });
  },
};
