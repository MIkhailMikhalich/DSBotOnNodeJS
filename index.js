const Discord = require("discord.js");
const { prefix, token, err, suc, req, adv } = require("./config.json");
const { executioner } = require("./commands.js");
const client = new Discord.Client();
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
