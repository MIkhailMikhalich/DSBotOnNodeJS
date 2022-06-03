const { errm, suc, req, adv } = require("./config.json");
const ytdl = require("ytdl-core");
const youtubesearchapi = require("youtube-search-api");
const queue = new Map();

async function execute(message, serverQueue) {
  try {
    const args = message.content.split(" ");
    const search = setupSearchInfo(args.length);
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.channel.send(
        `${errm}${req}Войдите в любой голсовой-канал`
      );
    }
     let chechPeople = setInterval(() => {
      let MemberCount = voiceChannel.members.size;
      if ((MemberCount <= 1)) {
        voiceChannel.leave();
        clearInterval(chechPeople);
        return message.channel.send(
          `${adv}В канале более никого не присутсвует, до встречи`
        );
      }
    }, 5000);
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(`${errm}У меня нет прав на вашем сервере`);
    }

    const songInfo = await getInfo(args[search], message);
    const song = {
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url,
    };

    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        savedsongs: [],
        volume: 5,
        playing: true,
        repeat: false,
      };

      queue.set(message.guild.id, queueContruct);
      queueContruct.songs.push(song);

      try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        play(message.guild, queueContruct.songs[0]);
      } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(`${this.err}${err}`);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(
        `${suc}${song.title} была добавлена в очередь!`
      );
    }
  } catch (err) {
    console.error(err);
  }
}
function setupSearchInfo(count) {
  if (count > 2) {
    return 2;
  } else return 1;
}
async function getInfo(search, message) {
  try {
    const songInfo = await ytdl.getInfo(search);
    return songInfo;
  } catch {
    const res = await youtubesearchapi.GetListByKeyword(search, false, 5);
    let index = 0;
    message.channel.send(`
    ${adv}\n${res.items
      .map((song) => `***${++index}***-${song.title}`)
      .join("\n")}\n${req}Выберете нужную из 5 представленных`);
    try {
      try {
        var response;
        const filter = (mes) => mes.content > 0 && mes.content < 6;
        await message.channel
          .awaitMessages(filter, {
            max: 1,
            time: 10000,
            errors: ["time"],
          })
          .then((collected) => {
            response = collected.first();
            return;
          })
          .catch((err) => {
            console.log(err);
            return message.channel.send(
              `${errm}Ответ отсутствовал или был отклонен`
            );
          });
      } catch (err) {
        console.error(err);
      }
      console.log(response);
      const videoIndex = parseInt(response.content);
      const songInfo = await ytdl.getInfo(res.items[videoIndex - 1].id);
      return songInfo;
    } catch (err) {
      console.error(err);
    }
  }
}
function skip(message, serverQueue) {
  console.log(serverQueue);
  if (!message.member.voice.channel) {
    return message.channel.send(
      `${errm}${req}Войдите голсовой-канал, чтобы пропустить!`
    );
  }
  if (!serverQueue) return message.channel.send(`${errm}Нечего пропускать!`);
  serverQueue.connection.dispatcher.end();
  
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel) {
    return message.channel.send(
      `${errm}${req}Войдите голсовой-канал, чтобы остановить!`
    );
  }
  if (!serverQueue) return message.channel.send(`${errm}Нечего остановить!`);
  serverQueue.songs = [];
  serverQueue.savedsongs = [];
  serverQueue.connection.dispatcher.end();
}

function repeat(message, serverQueue) {
  if (serverQueue.repeat) {
    stoprepeat(message, serverQueue);
    return;
  } else {
    serverQueue.repeat = true;
    if (!message.member.voice.channel) {
      return message.channel.send(
        `${errm}${req}Войдите голсовой-канал, чтобы включить цикл!`
      );
    }
    if (!serverQueue) return message.channel.send(`${errm}Нечего повторять!`);
    serverQueue.savedsongs = serverQueue.songs;
    serverQueue.textChannel.send(`${suc}Повтор включен`);
  }
}
function stoprepeat(message, serverQueue) {
  serverQueue.repeat = false;
  if (!message.member.voice.channel) {
    return message.channel.send(
      `${errm}${req}Войдите голсовой-канал, чтобы выключить цикл!`
    );
  }
  if (!serverQueue) return message.channel.send(`${errm}Нечего выключать!`);
  serverQueue.savedsongs = [];
  serverQueue.textChannel.send(`${suc}Повтор выключен`);
}
function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }
  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      if (serverQueue.repeat)
        if (serverQueue.songs.length === 0)
          serverQueue.songs = serverQueue.savedsongs;
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", (error) => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`${adv}Начала играть:**${song.title}**`);
}
module.exports = { execute, skip, stop, repeat, queue };
