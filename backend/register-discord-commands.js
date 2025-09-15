#!/usr/bin/env node

import 'dotenv/config';
import fetch from 'node-fetch';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

if (!DISCORD_BOT_TOKEN || !DISCORD_CLIENT_ID) {
  console.error('❌ Missing Discord configuration!');
  console.error('Please set DISCORD_BOT_TOKEN and DISCORD_CLIENT_ID in your .env file');
  process.exit(1);
}

const commands = [
  {
    name: 'chat',
    description: 'Chat with Vox AI',
    options: [
      {
        type: 3, // STRING
        name: 'message',
        description: 'The message to send to Vox AI',
        required: true
      }
    ]
  }
];

async function registerCommands() {
  try {
    console.log('🚀 Registering Discord slash commands...');
    
    const url = `https://discord.com/api/v10/applications/${DISCORD_CLIENT_ID}/commands`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commands)
    });

    if (response.ok) {
      console.log('✅ Discord slash commands registered successfully!');
      console.log('📋 Available commands:');
      commands.forEach(cmd => {
        console.log(`   /${cmd.name} - ${cmd.description}`);
      });
      console.log('\n🎉 You can now use /chat in your Discord server!');
    } else {
      const error = await response.text();
      console.error('❌ Failed to register commands:', error);
    }
  } catch (error) {
    console.error('❌ Error registering commands:', error.message);
  }
}

registerCommands();
