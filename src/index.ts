import dotenv from 'dotenv';
dotenv.config();
import { Client, GatewayIntentBits, Message } from 'discord.js';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnection,
  AudioPlayer
} from '@discordjs/voice';
import path from 'path';
import fs from 'fs';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.DISCORD_TOKEN;;
const AUDIO_PATH = path.join(__dirname, `../assets/audio/${process.env.AUDIO_NAME}`);

if (fs.existsSync(AUDIO_PATH)) {
  console.log(`Audio found in ${AUDIO_PATH}`);
} else {
  console.error(`Audio not found: ${AUDIO_PATH}`);
}

let connection: VoiceConnection | null = null;
let player: AudioPlayer | null = null;

client.once('ready', () => {
  console.log(`✅ Logged as ${client.user?.tag}`);
});

client.on('messageCreate', async (message: Message) => {
  if (message.author.bot) {
    return;
  }

  if (message.content === '!play-fla') {
    try {
      const channel = message.member?.voice.channel;

      if (!channel) {
        return message.reply('You need to join a voice channel first!');
      }

      connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator
      });

      player = createAudioPlayer();
      playAudioInLoop(player, connection);

      connection.subscribe(player);
      message.reply('▶️ Playing Radio fla!');
    } catch (error) {
      console.error('Error while processing the command:', error);
      message.reply('There was an error playing the Radio fla!');
    }
  }

  if (message.content === '!stop-fla') {
    if (connection) {
      connection.destroy();
      connection = null;
    }
    if (player) {
      player.stop();
      player = null;
    }

    message.reply('⏹️ Stopped and disconnected from the voice channel.');
  }
});

const playAudioInLoop = (player: AudioPlayer, connection: VoiceConnection) => {
  const createLoop = () => {
    const resource = createAudioResource(AUDIO_PATH);
    console.log('Audio resource created:', AUDIO_PATH);
    return resource;
  };

  let resource = createLoop();
  player.play(resource);
  console.log('Audio is playing');

  player.on(AudioPlayerStatus.Idle, () => {
    console.log('Player is idle, creating new audio resource.');
    resource = createLoop();
    player.play(resource);
  });

  player.on('error', (error) => {
    console.error('Error with the audio player:', error);
    connection.destroy();
  });
};

client.login(TOKEN);