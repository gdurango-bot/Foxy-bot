require('dotenv').config();

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

// Health check server
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('OK');
}).listen(process.env.PORT || 3000, () => {
  console.log(`✅ Health check server running on port ${process.env.PORT || 3000}`);
});

const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

console.log('📦 Modules loaded');
console.log('🔑 BOT_TOKEN exists:', !!process.env.BOT_TOKEN);
console.log('🔑 BOT_TOKEN length:', process.env.BOT_TOKEN?.length);
console.log('📺 CHANNEL_ID:', process.env.CHANNEL_ID || '1500983150174535901');

// ── Test de red hacia Discord ──────────────────────────────────────────────
console.log('🌐 Testing connectivity to Discord API...');
axios.get('https://discord.com/api/v10/gateway')
  .then(r => console.log('✅ Discord API reachable:', JSON.stringify(r.data)))
  .catch(e => console.error('🚫 Cannot reach Discord API:', e.message, e.code));

// ── Test WebSocket gateway ─────────────────────────────────────────────────
const { WebSocket } = require('ws');
console.log('🌐 Testing WebSocket to Discord gateway...');
const testWs = new WebSocket('wss://gateway.discord.gg/?v=10&encoding=json');
testWs.on('open', () => {
  console.log('✅ WebSocket connection to Discord gateway: OK');
  testWs.close();
});
testWs.on('error', (e) => {
  console.error('🚫 WebSocket to Discord gateway FAILED:', e.message, e.code);
});
// ──────────────────────────────────────────────────────────────────────────

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Eventos de debug del cliente
client.on('debug', (msg) => console.log('🐛 DEBUG:', msg));
client.on('warn', (msg) => console.warn('⚠️ WARN:', msg));
client.on('error', (err) => console.error('❌ CLIENT ERROR:', err));
client.on('disconnect', () => console.log('🔌 DISCONNECTED'));
client.on('reconnecting', () => console.log('🔄 RECONNECTING...'));
client.on('shardError', (err, shardId) => console.error(`❌ SHARD ${shardId} ERROR:`, err));

const CHANNEL_ID = process.env.CHANNEL_ID || '1500983150174535901';
const SCRIPT_URL = process.env.SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbyZhrQCmyjicNDw7Na-jSoswLm_kG1pCcSlDqe14GhV2RnfUoViSSqz7VZ3sQUY2Fvm/exec';

const validStatuses = {
  offline: 'Offline',
  online: 'Online',
  back: 'Online',
  lunch: 'Lunch',
  break: 'Break'
};

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`👀 Watching channel: ${CHANNEL_ID}`);
});

client.on('messageCreate', async (message) => {
  console.log(`📨 Message received from ${message.author.username} in ${message.channel.id}`);

  if (message.author.bot) return;
  if (message.channel.id !== CHANNEL_ID) {
    console.log(`❌ Wrong channel: ${message.channel.id} !== ${CHANNEL_ID}`);
    return;
  }

  const firstWord = message.content.trim().split(/\s+/)[0].toLowerCase();
  console.log(`🔍 First word: "${firstWord}"`);

  const status = validStatuses[firstWord];
  if (!status) {
    console.log(`❌ Invalid status: "${firstWord}"`);
    return;
  }

  console.log(`✅ Valid status: ${status}`);

  try {
    const response = await axios.post(SCRIPT_URL, {
      username: message.author.username,
      status: status
    });
    console.log(`📊 Sheet response:`, response.data);
    console.log(`✅ ${message.author.username} -> ${status}`);
    await message.delete().catch((e) => console.log('⚠️ Could not delete message:', e.message));
  } catch (err) {
    console.error('❌ Axios error:', err.message);
  }
});

console.log('🔐 Attempting login...');
setTimeout(() => {
  console.log('⏳ Login still pending after 10s — possible network block or bad token');
}, 10000);

client.login(process.env.BOT_TOKEN)
  .then(() => console.log('✅ Login call resolved'))
  .catch(err => {
    console.error('❌ Login failed:', err.message);
    console.error('❌ Full error:', err);
  });