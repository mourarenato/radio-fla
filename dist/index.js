"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const discord_js_1 = require("discord.js");
const voice_1 = require("@discordjs/voice");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildVoiceStates,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent
    ]
});
const TOKEN = process.env.DISCORD_TOKEN;
;
const AUDIO_PATH = path_1.default.join(__dirname, `../assets/audio/${process.env.AUDIO_NAME}`);
console.log(TOKEN);
if (fs_1.default.existsSync(AUDIO_PATH)) {
    console.log(`Audio found in ${AUDIO_PATH}`);
}
else {
    console.error(`Audio not found: ${AUDIO_PATH}`);
}
let connection = null;
let player = null;
client.once('ready', () => {
    var _a;
    console.log(`✅ Logged as ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}`);
});
client.on('messageCreate', (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (message.author.bot) {
        return;
    }
    if (message.content === '!play-horse') {
        try {
            const channel = (_a = message.member) === null || _a === void 0 ? void 0 : _a.voice.channel;
            if (!channel) {
                return message.reply('You need to join a voice channel first!');
            }
            connection = (0, voice_1.joinVoiceChannel)({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator
            });
            player = (0, voice_1.createAudioPlayer)();
            playAudioInLoop(player, connection);
            connection.subscribe(player);
            message.reply('▶️ Playing Radio Horse!');
        }
        catch (error) {
            console.error('Error while processing the command:', error);
            message.reply('There was an error playing the Radio Horse!');
        }
    }
    if (message.content === '!stop-horse') {
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
}));
const playAudioInLoop = (player, connection) => {
    const createLoop = () => {
        const resource = (0, voice_1.createAudioResource)(AUDIO_PATH);
        console.log('Audio resource created:', AUDIO_PATH);
        return resource;
    };
    let resource = createLoop();
    player.play(resource);
    console.log('Audio is playing');
    player.on(voice_1.AudioPlayerStatus.Idle, () => {
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
//# sourceMappingURL=index.js.map