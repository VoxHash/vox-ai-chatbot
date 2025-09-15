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

// Memory system for conversation context
const conversationMemory = new Map();
const MAX_MEMORY_SIZE = 10; // Keep last 10 messages per user

// Helper function to get conversation history
function getConversationHistory(userId) {
  return conversationMemory.get(userId) || [];
}

// Helper function to add message to memory
function addToMemory(userId, role, content) {
  if (!conversationMemory.has(userId)) {
    conversationMemory.set(userId, []);
  }
  
  const history = conversationMemory.get(userId);
  history.push({ role, content, timestamp: Date.now() });
  
  // Keep only last MAX_MEMORY_SIZE messages
  if (history.length > MAX_MEMORY_SIZE) {
    history.splice(0, history.length - MAX_MEMORY_SIZE);
  }
  
  conversationMemory.set(userId, history);
}

// Helper function to detect emotions in user messages
function detectEmotion(text) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('😊') || lowerText.includes(':)') || lowerText.includes('happy') || lowerText.includes('great') || lowerText.includes('awesome') || lowerText.includes('thanks') || lowerText.includes('thank you')) {
    return 'happy';
  }
  if (lowerText.includes('😢') || lowerText.includes(':(') || lowerText.includes('sad') || lowerText.includes('upset') || lowerText.includes('disappointed')) {
    return 'sad';
  }
  if (lowerText.includes('😡') || lowerText.includes('angry') || lowerText.includes('mad') || lowerText.includes('frustrated')) {
    return 'angry';
  }
  if (lowerText.includes('😮') || lowerText.includes('wow') || lowerText.includes('amazing') || lowerText.includes('incredible')) {
    return 'surprised';
  }
  if (lowerText.includes('🤔') || lowerText.includes('hmm') || lowerText.includes('confused') || lowerText.includes('?') || lowerText.includes('help')) {
    return 'confused';
  }
  if (lowerText.includes('❤️') || lowerText.includes('love') || lowerText.includes('heart')) {
    return 'love';
  }
  
  return 'neutral';
}

// Helper function to get appropriate sticker for emotion
function getStickerForEmotion(emotion) {
  const stickers = {
    'happy': '😊',
    'sad': '😢',
    'angry': '😡',
    'surprised': '😮',
    'confused': '🤔',
    'love': '❤️',
    'neutral': '👍'
  };
  return stickers[emotion] || '👍';
}

// Helper function to generate personalized thread title (for group discussions)
function generateThreadTitle(message, aiResponse) {
  const messageText = message.toLowerCase();
  const responseText = aiResponse.toLowerCase();
  
  // Extract key topics from the message
  const topics = [];
  
  // Check for specific topics
  if (messageText.includes('harry potter') || messageText.includes('hogwarts')) {
    topics.push('Harry Potter');
  }
  if (messageText.includes('programming') || messageText.includes('code') || messageText.includes('development') || messageText.includes('php') || messageText.includes('javascript') || messageText.includes('python')) {
    topics.push('Programming');
  }
  if (messageText.includes('ai') || messageText.includes('artificial intelligence')) {
    topics.push('AI Discussion');
  }
  if (messageText.includes('telegram') || messageText.includes('bot')) {
    topics.push('Telegram Bot');
  }
  if (messageText.includes('help') || messageText.includes('question')) {
    topics.push('Q&A');
  }
  if (messageText.includes('project') || messageText.includes('planning')) {
    topics.push('Project Discussion');
  }
  if (messageText.includes('tutorial') || messageText.includes('guide')) {
    topics.push('Tutorial');
  }
  if (messageText.includes('dragon ball') || messageText.includes('one piece') || messageText.includes('anime')) {
    topics.push('Anime Discussion');
  }
  if (messageText.includes('straw hat') || messageText.includes('one piece')) {
    topics.push('One Piece Discussion');
  }
  if (messageText.includes('fried chicken') || messageText.includes('food') || messageText.includes('cooking') || messageText.includes('recipe')) {
    topics.push('Food Discussion');
  }
  if (messageText.includes('movie') || messageText.includes('film') || messageText.includes('cinema')) {
    topics.push('Movie Discussion');
  }
  if (messageText.includes('game') || messageText.includes('gaming') || messageText.includes('gta') || messageText.includes('video game')) {
    topics.push('Gaming Discussion');
  }
  if (messageText.includes('music') || messageText.includes('song') || messageText.includes('band')) {
    topics.push('Music Discussion');
  }
  if (messageText.includes('sport') || messageText.includes('football') || messageText.includes('basketball') || messageText.includes('soccer')) {
    topics.push('Sports Discussion');
  }
  if (messageText.includes('travel') || messageText.includes('vacation') || messageText.includes('trip')) {
    topics.push('Travel Discussion');
  }
  if (messageText.includes('book') || messageText.includes('reading') || messageText.includes('novel')) {
    topics.push('Books Discussion');
  }
  if (messageText.includes('science') || messageText.includes('technology') || messageText.includes('tech')) {
    topics.push('Science & Tech Discussion');
  }
  
  // If we found specific topics, use them
  if (topics.length > 0) {
    return topics.join(' & ') + ' Discussion';
  }
  
  // Extract first few meaningful words from the message as fallback
  const words = message.split(' ').filter(word => 
    word.length > 2 && 
    !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an'].includes(word.toLowerCase())
  ).slice(0, 3);
  
  if (words.length > 0) {
    const cleanWords = words.join(' ').replace(/[^\w\s]/g, '').trim();
    if (cleanWords.length > 0) {
      return cleanWords + ' Discussion';
    }
  }
  
  // Extract first few words from the message as fallback
  const fallbackWords = message.split(' ').slice(0, 3).join(' ');
  const cleanFallback = fallbackWords.replace(/[^\w\s]/g, '').trim();
  
  if (cleanFallback.length > 0) {
    return cleanFallback + ' Discussion';
  }
  
  // Final fallback
  return 'General Discussion';
}

// Helper function to get user display name (first name or username)
function getUserDisplayName(user) {
  if (user.first_name) {
    return user.first_name;
  }
  return user.username || 'User';
}

// Helper function to generate welcome message
function generateWelcomeMessage(user) {
  const displayName = getUserDisplayName(user);
  const welcomeMessages = [
    `Welcome to the group, ${displayName}! 🎉 I'm Vox AI, your friendly assistant. Feel free to ask me anything or just say hello!`,
    `Hey there, ${displayName}! 👋 Great to have you here! I'm Vox AI and I'm here to help with any questions you might have.`,
    `Welcome aboard, ${displayName}! 🚀 I'm Vox AI, your AI assistant. Don't hesitate to reach out if you need help with anything!`,
    `Hello ${displayName}! 😊 Welcome to our community! I'm Vox AI and I'm excited to chat with you. What brings you here today?`,
    `Hi ${displayName}! 🌟 Welcome to the group! I'm Vox AI, your helpful assistant. Feel free to start a conversation anytime!`
  ];
  
  return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
}

// Helper function to check if message should create a discussion topic
function shouldCreateDiscussionTopic(message, aiResponse) {
  const messageText = message.toLowerCase();
  const responseText = aiResponse.toLowerCase();
  
  // Check if user explicitly wants to discuss a topic
  const discussionKeywords = [
    'discuss', 'talk about', 'chat about', 'discussion', 'conversation',
    'create topic', 'start topic', 'new topic', 'let\'s talk'
  ];
  
  const wantsToDiscuss = discussionKeywords.some(keyword => 
    messageText.includes(keyword)
  );
  
  // Check if response is very long (more than 200 characters)
  const isVeryLongResponse = aiResponse.length > 200;
  
  // Check if it's a complex topic that might need follow-up
  const complexKeywords = [
    'tutorial', 'guide', 'step by step', 'how to', 'explain in detail',
    'project', 'planning', 'brainstorm', 'discussion', 'debate'
  ];
  
  const isComplexTopic = complexKeywords.some(keyword => 
    messageText.includes(keyword) || responseText.includes(keyword)
  );
  
  // Create discussion topic if user wants to discuss OR topic is very long/complex
  return wantsToDiscuss || (isVeryLongResponse && isComplexTopic);
}

// Function to send message to Telegram
async function sendMessage(chatId, text, withReactions = false) {
  try {
    const messageData = { 
      chat_id: chatId, 
      text: text,
      parse_mode: 'HTML'
    };
    
    // Add inline keyboard for reactions if requested
    if (withReactions) {
      messageData.reply_markup = {
        inline_keyboard: [[
          { text: '👍 Like', callback_data: 'reaction_like' },
          { text: '👎 Dislike', callback_data: 'reaction_dislike' },
          { text: '💡 Idea', callback_data: 'reaction_idea' },
          { text: '❓ Question', callback_data: 'reaction_question' }
        ]]
      };
    }
    
    const response = await fetch(`${api}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
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

            // Handle callback queries (button presses)
            if (update.callback_query) {
              const callbackQuery = update.callback_query;
              const chatId = callbackQuery.message.chat.id;
              const userId = callbackQuery.from.id;
              const data = callbackQuery.data;
              const username = callbackQuery.from.username || callbackQuery.from.first_name || 'User';
              
              console.log(`😊 Received callback from ${username}: ${data}`);
              
              // Get user's conversation history for personalized response
              const history = getConversationHistory(userId);
              const lastUserMessage = history.filter(msg => msg.role === 'user').slice(-1)[0]?.content || '';
              
              // Get user display name for personalization
              const displayName = getUserDisplayName(callbackQuery.from);
              
              let response = '';
              switch (data) {
                case 'reaction_like':
                  response = `😊 Thanks for the positive feedback, ${displayName}! I'm glad I could help! ${lastUserMessage ? `I hope my response about "${lastUserMessage.substring(0, 50)}..." was helpful!` : ''}`;
                  break;
                case 'reaction_dislike':
                  response = `😔 I see you didn't find that helpful, ${displayName}. Could you tell me what I can improve? I want to give you the best possible response!`;
                  break;
                case 'reaction_idea':
                  response = `💡 Great idea, ${displayName}! I love your thinking! Feel free to share more thoughts or ask follow-up questions!`;
                  break;
                case 'reaction_question':
                  response = `❓ I'm here to help, ${displayName}! What would you like to know more about? I'm ready to dive deeper into any topic!`;
                  break;
                default:
                  response = `Thanks for your feedback, ${displayName}!`;
              }
              
              await sendMessage(chatId, response);
              
              // Answer the callback query to remove loading state
              await fetch(`${api}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callback_query_id: callbackQuery.id })
              });
              
              continue;
            }

            if (update.message) {
              const message = update.message;
              const chatId = message.chat.id;
              const text = message.text || '';
              const username = message.from.username || message.from.first_name || 'User';

              console.log(`📱 Received message from ${username}: ${text}`);
              
              // Handle new member joins (for groups)
              if (message.new_chat_members && message.new_chat_members.length > 0) {
                for (const newMember of message.new_chat_members) {
                  if (!newMember.is_bot) { // Only welcome human users, not bots
                    const welcomeMessage = generateWelcomeMessage(newMember);
                    await sendMessage(chatId, welcomeMessage);
                    console.log(`👋 Sent welcome message for ${newMember.first_name || newMember.username}`);
                  }
                }
                continue; // Skip normal message processing for member joins
              }
              
              // Process different types of messages
              if (text.startsWith('/start')) {
                await sendMessage(chatId, `Hello ${username}! I'm Vox AI. Send me any message and I'll respond!`);
              } else if (text.startsWith('/help')) {
                await sendMessage(chatId, `Vox AI Commands:\n/start - Start the bot\n/help - Show this help\n/status - Check bot status\n\nJust send me any message to chat!`);
              } else if (text.startsWith('/status')) {
                await sendMessage(chatId, `Vox AI is online and ready! ✅\n\nI can help you with:\n• General questions\n• Information requests\n• Casual conversation\n• Remember our previous conversations\n• React to your emotions\n• Discussion topics in groups\n\nTry asking me anything!`);
              } else if (text.trim()) {
            // Add user message to memory
            addToMemory(message.from.id, 'user', text);
            
            // Get conversation history
            const history = getConversationHistory(message.from.id);
            
            // Get user display name for personalization
            const displayName = getUserDisplayName(message.from);
            
            // Use AI model to generate response
            try {
              console.log(`🧠 Processing message with AI: ${text}`);
              
              // Build messages with memory
              const messages = [
                { 
                  role: 'system', 
                  content: `You are Vox AI, a helpful and intelligent assistant created by VoxHash. You can help with questions, provide information, have conversations, and assist with various topics. Be friendly, informative, and engaging in your responses.

If someone asks about your creator, mention that you were created by VoxHash and direct them to https://voxhash.dev or https://github.com/VoxHash for more information.

You have access to conversation history to provide better context-aware responses.

Special features:
- You remember previous conversations for better context
- You can detect and respond to user emotions
- You provide personalized responses based on conversation history
- When referring to users, use their first name if available, otherwise their username
- The current user's display name is: ${displayName}` 
                }
              ];
              
              // Add conversation history
              history.forEach(msg => {
                messages.push({ role: msg.role, content: msg.content });
              });
              
              // Add current message
              messages.push({ role: 'user', content: text });
              
              const aiResponse = await completeChat(messages);
              console.log(`🤖 AI Response: ${aiResponse}`);
              
              // Add AI response to memory
              addToMemory(message.from.id, 'assistant', aiResponse);
              
              // Check if user explicitly wants to create a discussion topic
              if (message.chat.type === 'group' || message.chat.type === 'supergroup') {
                if (text.toLowerCase().includes('create topic') || text.toLowerCase().includes('start discussion') || text.toLowerCase().includes('discuss topic')) {
                  // Extract the actual topic from the message
                  let topic = text;
                  
                  // Remove common topic creation phrases to get the actual topic
                  topic = topic.replace(/create topic about/gi, '');
                  topic = topic.replace(/create topic for/gi, '');
                  topic = topic.replace(/start discussion about/gi, '');
                  topic = topic.replace(/discuss topic about/gi, '');
                  topic = topic.replace(/create topic/gi, '');
                  topic = topic.replace(/start discussion/gi, '');
                  topic = topic.replace(/discuss topic/gi, '');
                  topic = topic.replace(/about/gi, '');
                  topic = topic.trim();
                  
                  // If no topic extracted, use the original message
                  if (!topic || topic.length < 3) {
                    topic = text;
                  }
                  
                  // Generate personalized topic title
                  const topicTitle = generateThreadTitle(topic, aiResponse);
                  
                  await sendMessage(chatId, `📌 **Discussion Topic: ${topicTitle}**\n\nThis seems like a great topic for discussion! Feel free to continue the conversation here. I'll be monitoring and can help with follow-up questions!`);
                  console.log(`📌 Created discussion topic: ${topicTitle} (user requested) - Original topic: "${topic}"`);
                } else if (shouldCreateDiscussionTopic(text, aiResponse)) {
                  const topicTitle = generateThreadTitle(text, aiResponse);
                  await sendMessage(chatId, `📌 **Discussion Topic: ${topicTitle}**\n\nThis seems like a great topic for discussion! Feel free to continue the conversation here. I'll be monitoring and can help with follow-up questions!`);
                  console.log(`📌 Created discussion topic: ${topicTitle}`);
                }
              }
              
              // Send AI response to user with reactions
              await sendMessage(chatId, aiResponse, true);
              
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
