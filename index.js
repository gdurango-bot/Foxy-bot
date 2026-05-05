const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('OK');
}).listen(process.env.PORT || 3000, () => {
  console.log('Health check server running');
});

require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const CHANNEL_ID = '1500983150174535901';

const SCRIPT_URL =
'https://script.google.com/macros/s/AKfycbyZhrQCmyjicNDw7Na-jSoswLm_kG1pCcSlDqe14GhV2RnfUoViSSqz7VZ3sQUY2Fvm/exec';

const validStatuses = {
  offline: 'Offline',
  online: 'Online',
  back: 'Online',
  lunch: 'Lunch',
  break: 'Break'
};

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {

  if (message.author.bot) return;

  if (message.channel.id !== CHANNEL_ID) return;

  const firstWord = message.content
    .trim()
    .split(/\s+/)[0]
    .toLowerCase();

  if (!validStatuses[firstWord]) return;

  const status = validStatuses[firstWord];

  try {

    await axios.post(SCRIPT_URL, {
      username: message.author.username,
      status: status
    });

    console.log(`${message.author.username} -> ${status}`);

    // Borra el mensaje automáticamente
    await message.delete().catch(() => {});

  } catch (err) {

    console.error(err);

  }

});

client.login(process.env.BOT_TOKEN)
  .then(() => console.log('Token OK, conectando...'))
  .catch(err => console.error('Login failed:', err.message));