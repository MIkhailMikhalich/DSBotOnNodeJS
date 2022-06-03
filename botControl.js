const { prefix, token, errm, suc, req, adv } = require("./config.json");
const { executioner } = require("./commands.js");
const client = require("./bot.js");

client.once("ready", () => {
  console.log("Ready!");
});
client.once("reconnecting", () => {
  console.log("Reconnecting!");
});
client.once("disconnect", () => {
  console.log("Disconnect!");
});

client.on("message", async (message) => {
  
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  executioner(message);
});

client.login(token);
