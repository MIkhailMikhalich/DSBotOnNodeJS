const { prefix, errm, adv } = require("./config.json");
const { execute, skip, stop, repeat, queue } = require("./musicPart.js");
const commands_list = [
  {
    name: "help",
    about: "Показать данный текст.",
    alies: ["h", "hp"],
    func: help,
  },
  {
    name: "play",
    about: "Играть музыку.",
    alies: ["p", "pl"],
    func: execute,
  },
  {
    name: "stop",
    about: "Остановить музыку.",
    alies: ["st"],
    func: stop,
  },
  {
    name: "repeat",
    about: "Повторять музыку.",
    alies: ["r", "re"],
    func: repeat,
  },
  {
    name: "skip",
    about: "Пропустить музыку.",
    alies: ["s", "sk"],
    func: skip,
  },
];
function executioner(message) {
  regexpStr = /^(?<prefix>\>\>)\s*(?<command>\S+)\s*(?<args>[^\n]*)$/;
  const regex = new RegExp(regexpStr);
  const groups = message.content.match(regex).groups;
  const prefixMessage = groups.prefix;
  const commandMessage = groups.command;
  const argsMessage = groups.args;
  const serverQueue = queue.get(message.guild.id);

  if (!prefixMessage === prefix) return;

  for (let com of commands_list) {
    if (commandMessage === com.name) {
      com.func(message, serverQueue, argsMessage);
      return;
    } else {
      for (let alies of com.alies) {
        if (commandMessage === alies) {
          com.func(message, serverQueue, argsMessage);
          return;
        }
      }
    }
  }
  message.channel.send(`${errm}Такой команды нет :(`);
}
function help(message) {
  return message.channel.send(`
  ${adv}\n***Мои команды:***\n${commands_list
    .map(
      (command) =>
        `============================\n***>Комманда: ***${
          command.name
        }\n***>Алтернативный вызов:***${command.alies.map(
          (alie) => ` ${alie} `
        )}\n***>Описание: ***${command.about}`
    )
    .join("\n")}\n============================`);
}
module.exports = { executioner };
