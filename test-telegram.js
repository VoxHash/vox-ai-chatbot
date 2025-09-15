import fetch from 'node-fetch';

const BOT_TOKEN = '8202362285:AAH5U94lqFU8z_Pms4hHCOSWaZrA0Y9BLWM';
const api = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function testBot() {
  try {
    console.log('🤖 Testing Telegram bot...');
    
    // Get bot info
    const botInfoResponse = await fetch(`${api}/getMe`);
    const botInfo = await botInfoResponse.json();
    console.log('Bot info:', botInfo);
    
    // Get updates
    const updatesResponse = await fetch(`${api}/getUpdates`);
    const updates = await updatesResponse.json();
    console.log('Updates:', JSON.stringify(updates, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testBot();
