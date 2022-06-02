const {prefix, err, adv } = require("./config.json");
const { execute, skip, stop,repeat, queue } = require("./musicPart.js");
const comands_list = [
  {
    name: "play",
    about: "Играть музыку.",
  },
  {
    name: "stop",
    about: "Остановить музыку.",
  },
  {
    name: "skip",
    about: "Пропустить музыку.",
  },
];
function executioner(message) {
  const serverQueue = queue.get(message.guild.id);
    if (message.content.startsWith(`${prefix}play`)) {
      execute(message, serverQueue);
      return;
    } else if (message.content.startsWith(`${prefix}skip`)) {
      skip(message, serverQueue);
      return;
    } else if (message.content.startsWith(`${prefix}stop`)) {
      stop(message, serverQueue);
      return;
    } else if (message.content.startsWith(`${prefix}repeat`)) {
      repeat(message, serverQueue);
      return;
    } else {
      message.channel.send(`${err}Такой команды нет :(`);
    }
}
module.exports = { executioner };
