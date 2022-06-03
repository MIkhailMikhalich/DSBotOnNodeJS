const { prefix, err, adv } = require("./config.json");
const { execute, skip, stop, repeat, queue } = require("./musicPart.js");
const comands_list = [
  {
    name: "Help",
    about: "Показать данный текст.",
    alies: ["h", "hp"],
  },
  {
    name: "play",
    about: "Играть музыку.",
    alies: ["p", "pl"],
  },
  {
    name: "stop",
    about: "Остановить музыку.",
    alies: ["st"],
  },
  {
    name: "repeat",
    about: "Повторять музыку.",
    alies: ["r", "re"],
  },
  {
    name: "skip",
    about: "Пропустить музыку.",
    alies: ["s", "sk"],
  },
];
function executioner(message) {
  const mesg = message.content.replace(/\s/g, "");
  const serverQueue = queue.get(message.guild.id);
  if (
    mesg.startsWith(`${prefix}${comands_list[1].name}`) ||
    mesg.startsWith(`${prefix}${comands_list[1].alies[0]}`) ||
    mesg.startsWith(`${prefix}${comands_list[1].alies[1]}`)
  ) {
    execute(message, serverQueue);
    return;
  } else if (
    mesg.startsWith(`${prefix}skip`) ||
    mesg.startsWith(`${prefix}${comands_list[4].alies[0]}`) ||
    mesg.startsWith(`${prefix}${comands_list[4].alies[1]}`)
  ) {
    skip(message, serverQueue);
    return;
  } else if (
    mesg.startsWith(`${prefix}stop`) ||
    mesg.startsWith(`${prefix}${comands_list[2].alies[0]}`)
  ) {
    stop(message, serverQueue);
    return;
  } else if (
    mesg.startsWith(`${prefix}repeat`) ||
    mesg.startsWith(`${prefix}${comands_list[3].alies[0]}`) ||
    mesg.startsWith(`${prefix}${comands_list[3].alies[1]}`)
  ) {
    repeat(message, serverQueue);
    return;
  } else if (
    mesg.startsWith(`${prefix}help`) ||
    mesg.startsWith(`${prefix}${comands_list[0].alies[0]}`) ||
    mesg.startsWith(`${prefix}${comands_list[0].alies[1]}`)
  ) {
    return message.channel.send(`
    ${adv}\n***Мои команды:***\n${comands_list
      .map(
        (command) =>
          `============================\n***>Комманда: ***${command.name}\n***>Алтернативный вызов:***${command.alies.map((alie)=>` ${alie} `)}\n***>Описание: ***${command.about}`
      )
      .join("\n")}`);
  } else {
    message.channel.send(`${err}Такой команды нет :(`);
  }
}
module.exports = { executioner };
