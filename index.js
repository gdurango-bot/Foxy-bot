require('dotenv').config();

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('OK');
}).listen(process.env.PORT || 3000, () => {
  console.log(`✅ Health check server running on port ${process.env.PORT || 3000}`);
});

const { Client, GatewayIntentBits, Options } = require('discord.js');
const axios = require('axios');

console.log('📦 Modules loaded');
console.log('🔑 BOT_TOKEN exists:', !!process.env.BOT_TOKEN);
console.log('🔑 BOT_TOKEN length:', process.env.BOT_TOKEN?.length);
console.log('📺 CHANNEL_ID:', process.env.CHANNEL_ID || '1500983150174535901');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  makeCache: Options.cacheWithLimits({
    MessageManager: 0,
    UserManager: 0,
  }),
});

client.on('debug', (msg) => {
  if (
    msg.includes('connect') || msg.includes('login') || msg.includes('ready') ||
    msg.includes('identify') || msg.includes('READY') || msg.includes('error') ||
    msg.includes('Error') || msg.includes('session') || msg.includes('shard') ||
    msg.includes('heartbeat') || msg.includes('resume') || msg.includes('token')
  ) {
    console.log('🐛 DEBUG:', msg);
  }
});

client.on('warn', (msg) => console.warn('⚠️ WARN:', msg));
client.on('error', (err) => console.error('❌ CLIENT ERROR:', err));
client.on('shardError', (err, shardId) => console.error(`❌ SHARD ${shardId} ERROR:`, err.message));
client.on('shardReady', (id) => console.log(`✅ Shard ${id} ready`));
client.on('shardDisconnect', (event, id) => console.log(`🔌 Shard ${id} disconnected:`, event.code, event.reason));
client.on('shardReconnecting', (id) => console.log(`🔄 Shard ${id} reconnecting...`));
client.on('invalidated', () => console.error('🚫 Session INVALIDATED — token inválido o revocado'));

const CHANNEL_ID = process.env.CHANNEL_ID || '1500983150174535901';
const SCRIPT_URL = process.env.SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbyZhrQCmyjicNDw7Na-jSoswLm_kG1pCcSlDqe14GhV2RnfUoViSSqz7VZ3sQUY2Fvm/exec';

const validStatuses = {
  offline: 'Offline', online: 'Online', back: 'Online', lunch: 'Lunch', break: 'Break'
};

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`👀 Watching channel: ${CHANNEL_ID}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== CHANNEL_ID) return;
  const firstWord = message.content.trim().split(/\s+/)[0].toLowerCase();
  const status = validStatuses[firstWord];
  if (!status) return;
  try {
    const response = await axios.post(SCRIPT_URL, { username: message.author.username, status });
    console.log(`✅ ${message.author.username} -> ${status}`, response.data);
    // await message.delete().catch((e) => console.log('⚠️ Could not delete:', e.message));
  } catch (err) {
    console.error('❌ Axios error:', err.message);
  }
});

const loginTimeout = setTimeout(() => {
  console.error('⏰ TIMEOUT: Login no completó en 30s — token revocado o Discord rechazando sesión');
}, 30000);

console.log('🔐 Attempting login...');
client.login(process.env.BOT_TOKEN)
  .then(() => { clearTimeout(loginTimeout); console.log('✅ Login call resolved'); })
  .catch(err => { clearTimeout(loginTimeout); console.error('❌ Login failed:', err.message, err.code); });
