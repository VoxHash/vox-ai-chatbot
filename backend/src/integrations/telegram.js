import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import { completeChat } from '../ai/openai.js';

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.log('TELEGRAM_BOT_TOKEN not set. Exiting.');
  process.exit(0);
}

const app = express();
app.use(express.json());
const api = `https://api.telegram.org/bot${token}`;

// Store last update ID to avoid processing the same message twice
let lastUpdateId = 0;

// Function to send message to Telegram
async function sendMessage(chatId, text) {
  try {
    const response = await fetch(`${api}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: chatId, 
        text: text,
        parse_mode: 'HTML'
      })
    });
    
    if (!response.ok) {
      console.error('Failed to send message:', await response.text());
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Function to get updates from Telegram
async function getUpdates() {
  try {
    const response = await fetch(`${api}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
    const data = await response.json();
    
    if (data.ok && data.result.length > 0) {
      for (const update of data.result) {
        lastUpdateId = update.update_id;
        
        if (update.message) {
          const message = update.message;
          const chatId = message.chat.id;
          const text = message.text || '';
          const username = message.from.username || message.from.first_name || 'User';
          
          console.log(`📱 Received message from ${username}: ${text}`);
          
          // Process different types of messages
          if (text.startsWith('/start')) {
            await sendMessage(chatId, `🤖 Hello ${username}! I'm Vox. Send me any message and I'll respond!`);
          } else if (text.startsWith('/help')) {
            await sendMessage(chatId, `🤖 Vox AI Commands:\n/start - Start the bot\n/help - Show this help\n/status - Check bot status\n\nJust send me any message to chat!`);
          } else if (text.startsWith('/status')) {
            await sendMessage(chatId, `🤖 Vox AI is online and ready! ✅\n\nI can help you with:\n• General questions\n• Information requests\n• Casual conversation\n\nTry asking me anything!`);
          } else if (text.trim()) {
            // Use AI model to generate response
            try {
              console.log(`🧠 Processing message with AI: ${text}`);
              
              const messages = [
                { 
                  role: 'system', 
                  content: 'You are Vox, a helpful and intelligent assistant. You can help with questions, provide information, have conversations, and assist with various topics. Be friendly, informative, and engaging in your responses.' 
                },
                { 
                  role: 'user', 
                  content: text 
                }
              ];
              
              const aiResponse = await completeChat(messages);
              console.log(`${aiResponse}`);
              
              // Send AI response to user
              await sendMessage(chatId, `${aiResponse}`);
              
            } catch (error) {
              console.error('AI processing error:', error);
              // Fallback response if AI fails
              await sendMessage(chatId, `I apologize, but I'm having trouble processing your request right now. Please try again in a moment.`);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error getting updates:', error);
  }
}

// Webhook endpoint (for production)
app.post('/webhook', async (req, res) => {
  const msg = req.body?.message;
  const chatId = msg?.chat?.id;
  const text = msg?.text || '';
  if (chatId) {
    await sendMessage(chatId, `Echo: ${text}`);
  }
  res.sendStatus(200);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    bot_token_set: !!token,
    last_update_id: lastUpdateId,
    mode: 'polling'
  });
});

const PORT = process.env.PORT || 4001;

// Start the server
app.listen(PORT, () => {
  console.log(`🤖 Telegram bot running on port ${PORT}`);
  console.log(`📱 Bot token: ${token.substring(0, 10)}...`);
  console.log(`🔄 Starting polling for messages...`);
  
  // Start polling for messages
  setInterval(getUpdates, 2000); // Poll every 2 seconds
  
  // Initial poll
  getUpdates();
});
