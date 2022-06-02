const { err, suc, req, adv } = require("./config.json");
const ytdl = require("ytdl-core");
const youtubesearchapi = require("youtube-search-api");
const queue = new Map();

async function execute(message, serverQueue) {
  const args = message.content.split(" ");

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    return message.channel.send(`${err}${req}Войдите в любой голсовой-канал`);
  }
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(`${err}У меня нет прав на вашем сервере`);
  }

  const songInfo = await getInfo(args[1]);
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
      count: 0,
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
}
async function getInfo(search) {
  try {
    const songInfo = await ytdl.getInfo(search);
    return songInfo;
  } catch {
    const res = await youtubesearchapi.GetListByKeyword(search);
    console.log(res);
    const songInfo = await ytdl.getInfo(res.items[0].id);
    return songInfo;
  }
}
function skip(message, serverQueue) {
  console.log(serverQueue);
  if (!message.member.voice.channel) {
    return message.channel.send(
      `${err}${req}Войдите голсовой-канал, чтобы пропустить!`
    );
  }
  if (!serverQueue) return message.channel.send(`${err}Нечего пропускать!`);
  if (serverQueue.repeat) {
    serverQueue.count++;
  }
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel) {
    return message.channel.send(
      `${err}${req}Войдите голсовой-канал, чтобы остановить!`
    );
  }
  if (!serverQueue) return message.channel.send(`${err}Нечего остановить!`);
  serverQueue.songs = [];
  serverQueue.savedsongs = [];
  serverQueue.connection.dispatcher.end();
}

function repeat(message, serverQueue) {
if (serverQueue.repeat){stoprepeat(message, serverQueue); return}
else {
  serverQueue.repeat = true;
  if (!message.member.voice.channel) {
    return message.channel.send(
      `${err}${req}Войдите голсовой-канал, чтобы включить цикл!`
    );
  }
  if (!serverQueue) return message.channel.send(`${err}Нечего повторять!`);
  serverQueue.count = 0;
  serverQueue.savedsongs = serverQueue.songs;
  serverQueue.textChannel.send(`${suc}Повтор включен`);
}
}
function stoprepeat(message, serverQueue) {
    serverQueue.repeat = false;
    if (!message.member.voice.channel) {
      return message.channel.send(
        `${err}${req}Войдите голсовой-канал, чтобы выключить цикл!`
      );
    }
    if (!serverQueue) return message.channel.send(`${err}Нечего выключать!`);
    serverQueue.count = 0;
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
      if (serverQueue.repeat) {
        if (serverQueue.count < serverQueue.savedsongs.length) {
          play(guild, serverQueue.savedsongs[serverQueue.count]);
          serverQueue.count++;
        } else {
          serverQueue.count = 0;
          play(guild, serverQueue.savedsongs[serverQueue.count]);
        }
      } else {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      }
    })
    .on("error", (error) => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`${adv}Начала играть:**${song.title}**`);
}
module.exports = { execute, skip, stop, repeat, queue };
