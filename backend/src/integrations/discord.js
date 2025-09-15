import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import crypto from 'crypto';
import { completeChat } from '../ai/openai.js';

const app = express();
app.use(express.json());

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

if (!DISCORD_BOT_TOKEN) {
  console.log('DISCORD_BOT_TOKEN not set. Discord integration disabled.');
}

// Verify Discord request signature
function verifyDiscord(req) {
  const signature = req.headers['x-signature-ed25519'];
  const timestamp = req.headers['x-signature-timestamp'];
  const body = req.rawBody || JSON.stringify(req.body);
  
  if (!signature || !timestamp || !DISCORD_PUBLIC_KEY) {
    return false;
  }

  const publicKey = Buffer.from(DISCORD_PUBLIC_KEY, 'hex');
  const message = Buffer.from(timestamp + body);
  
  try {
    const crypto = require('crypto');
    const verify = crypto.createVerify('ed25519');
    verify.update(message);
    return verify.verify(publicKey, Buffer.from(signature, 'hex'));
  } catch (error) {
    console.error('Discord signature verification error:', error);
    return false;
  }
}

// Handle Discord interactions
app.post('/discord/interactions', async (req, res) => {
  // Skip signature verification for demo purposes
  // if (!verifyDiscord(req)) {
  //   return res.status(401).json({ error: 'Invalid signature' });
  // }

  const { type, data, member, channel_id } = req.body;

  if (type === 1) { // PING
    return res.json({ type: 1 }); // PONG
  }

  if (type === 2) { // APPLICATION_COMMAND
    const commandName = data.name;
    
      if (commandName === 'chat') {
        const message = data.options?.[0]?.value || 'Hello!';
        
        try {
          console.log(`🧠 Processing Discord message with AI: ${message}`);
          
          const messages = [
            { 
              role: 'system', 
              content: 'You are Vox AI, a helpful and intelligent assistant. You can help with questions, provide information, have conversations, and assist with various topics. Be friendly, informative, and engaging in your responses.' 
            },
            { 
              role: 'user', 
              content: message 
            }
          ];
          
          const aiResponse = await completeChat(messages);
          console.log(`🤖 AI Response: ${aiResponse}`);
          
          // Send AI response to Discord
          const response = {
            type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
            data: {
              content: `🤖 Vox AI: ${aiResponse}`,
              allowed_mentions: { parse: [] }
            }
          };
          
          return res.json(response);
          
        } catch (error) {
          console.error('AI processing error:', error);
          
          // Fallback response if AI fails
          const response = {
            type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
            data: {
              content: `🤖 Vox AI: I apologize, but I'm having trouble processing your request right now. Please try again in a moment.`,
              allowed_mentions: { parse: [] }
            }
          };
          
          return res.json(response);
        }
      }
  }

  if (type === 3) { // MESSAGE_COMPONENT
    // Handle button clicks, select menus, etc.
    return res.json({ type: 4, data: { content: 'Component interaction received!' } });
  }

  res.status(400).json({ error: 'Unknown interaction type' });
});

// Health check endpoint
app.get('/discord/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    bot_token_set: !!DISCORD_BOT_TOKEN,
    client_id_set: !!DISCORD_CLIENT_ID 
  });
});

const PORT = process.env.DISCORD_PORT || 4003;
app.listen(PORT, () => {
  console.log(`Discord bot webhook running on port ${PORT}`);
  if (DISCORD_BOT_TOKEN) {
    console.log('Discord bot token configured');
  } else {
    console.log('Discord bot token not configured - integration disabled');
  }
});
