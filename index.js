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
console.log('📺 CHANNEL_ID:', process.env.CHANNEL_ID || '1500983150174535901');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

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
client.login(process.env.BOT_TOKEN)
  .then(() => console.log('✅ Login successful'))
  .catch(err => console.error('❌ Login failed:', err.message));