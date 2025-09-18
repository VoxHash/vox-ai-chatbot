import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import { getAIResponse } from '../ai/localai.js';
import { 
  loadUserMemory, 
  addToUserMemory, 
  getConversationSummary, 
  hasUserBeenGreeted,
  getUserPreferredLanguage 
} from '../lib/memory.js';
import { detectLanguageSimple } from '../lib/language-detection-simple.js';
import { getLocalizedResponse, getSystemPrompt } from '../lib/language.js';
import { getCurrentTime, getCurrentWeather, getLocationInfo, formatLocationInfo } from '../lib/realtime.js';

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

// Processing users to prevent duplicate processing
const processingUsers = new Set();

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

// Function to send reaction to user message
async function sendReactionToUser(chatId, messageId, emotion) {
  try {
    const sticker = getStickerForEmotion(emotion);
    if (sticker) {
      // Send a reaction message (Telegram doesn't have native reactions like Discord)
      const reactionText = `${sticker} *${emotion.charAt(0).toUpperCase() + emotion.slice(1)} detected!*`;
      
      const response = await fetch(`${api}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: reactionText,
          parse_mode: 'HTML',
          reply_to_message_id: messageId
        })
      });
      
      const result = await response.json();
      if (!result.ok) {
        console.error('Failed to send reaction:', result);
      }
    }
  } catch (error) {
    console.error('Error sending reaction:', error);
  }
}

// Function to get updates from Telegram
async function getUpdates() {
  try {
    console.log(`🔄 Polling for updates with offset: ${lastUpdateId + 1}`);
    const response = await fetch(`${api}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
    const data = await response.json();
    
    console.log(`📊 Received ${data.result ? data.result.length : 0} updates`);
    
    // Check if we're getting any updates at all
    if (data.result && data.result.length === 0) {
      console.log('⚠️  No updates received. Bot may not be properly added to groups or may need permissions.');
    }
    
        if (data.ok && data.result.length > 0) {
          for (const update of data.result) {
            lastUpdateId = update.update_id;
            console.log(`📱 Processing update ${update.update_id}:`, JSON.stringify(update, null, 2));

            // Handle callback queries (button presses)
            if (update.callback_query) {
              const callbackQuery = update.callback_query;
              const chatId = callbackQuery.message.chat.id;
              const userId = callbackQuery.from.id;
              const data = callbackQuery.data;
              const username = callbackQuery.from.username || callbackQuery.from.first_name || 'User';
              
              console.log(`😊 Received callback from ${username}: ${data}`);
              
              // Get user's conversation history for personalized response
              const history = await loadUserMemory(userId, 'telegram');
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
              console.log(`📱 Chat type: ${message.chat.type}, Chat ID: ${chatId}`);
              console.log(`📱 Message entities:`, message.entities);
              
              // Handle new member joins (for groups)
              if (message.new_chat_members && message.new_chat_members.length > 0) {
                for (const newMember of message.new_chat_members) {
                  if (!newMember.is_bot) { // Only welcome human users, not bots
                    const userId = newMember.id;
                    
                    // Check if user has been greeted before
                    if (!(await hasUserBeenGreeted(userId, 'telegram'))) {
                      const welcomeMessage = generateWelcomeMessage(newMember);
                      await sendMessage(chatId, welcomeMessage);
                      
                      // Mark user as greeted
                      await addToUserMemory(userId, 'telegram', 'system', 'User joined group and was welcomed', { 
                        platform: 'telegram',
                        action: 'welcome'
                      });
                      
                      console.log(`👋 Sent welcome message for ${newMember.first_name || newMember.username}`);
                    }
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
                await sendMessage(chatId, `Vox AI is online and ready! ✅\n\nI can help you with:\n• General questions\n• Information requests\n• Casual conversation\n• Remember our previous conversations\n• React to your emotions\n\nTry asking me anything!`);
              } else if (text.trim()) {
                // Check if this is a group message and if the bot is mentioned
                const isGroup = message.chat.type === 'group' || message.chat.type === 'supergroup';
                
                // Check for mention in multiple ways
                let isMentioned = false;
                if (message.entities) {
                  isMentioned = message.entities.some(entity => 
                    entity.type === 'mention' && text.includes('@VoxAssistantBot')
                  );
                }
                // Also check if text contains the mention directly
                if (!isMentioned) {
                  isMentioned = text.includes('@VoxAssistantBot');
                }
                
                // Check if this is a reply to the bot's message
                let isReplyToBot = false;
                if (message.reply_to_message && message.reply_to_message.from) {
                  isReplyToBot = message.reply_to_message.from.is_bot === true;
                }
                
                console.log(`📱 Is group: ${isGroup}, Is mentioned: ${isMentioned}, Is reply to bot: ${isReplyToBot}`);
                
                // Only process if it's a DM, if the bot is mentioned in a group, or if it's a reply to the bot
                if (!isGroup || isMentioned || isReplyToBot) {
                  // Remove the mention from the text for processing
                  let cleanText = text;
                  if (isMentioned) {
                    cleanText = text.replace(/@VoxAssistantBot\s*/g, '').trim();
                  }
                  
                  console.log(`📱 Processing message: "${cleanText}"`);
                  
                  if (cleanText) {
                    const userId = message.from.id;
                    
                    // Check if user is already being processed
                    if (processingUsers.has(userId)) {
                      console.log('⚠️ User already being processed, skipping...');
                      return;
                    }
                    
                    processingUsers.add(userId);
                    
                    try {
                      // Detect language from current message
                      const detectedLanguage = detectLanguageSimple(cleanText);
                      console.log(`🌍 Detected language: ${detectedLanguage}`);
                      
                      // Add user message to persistent memory
                      await addToUserMemory(userId, 'telegram', 'user', cleanText, { platform: 'telegram' });
                      
                      // Get conversation history from persistent memory
                      const history = await loadUserMemory(userId, 'telegram');
                      const conversationSummary = await getConversationSummary(userId, 'telegram', 10);
                      
                      // Get user display name for personalization
                      const displayName = getUserDisplayName(message.from);
                      
                      // Check for creator-related questions first (multilingual)
                      const lowerContent = cleanText.toLowerCase();
                      const isCreatorQuestion = lowerContent.includes('who made you') || lowerContent.includes('who created you') || 
                                               lowerContent.includes('who built you') || lowerContent.includes('who developed you') || 
                                               lowerContent.includes('who programmed you') || lowerContent.includes('quien te creo') ||
                                               lowerContent.includes('quien te hizo') || lowerContent.includes('quien te programo') ||
                                               lowerContent.includes('quien te desarrollo') || lowerContent.includes('quien te construyo') ||
                                               lowerContent.includes('qui vous a créé') || lowerContent.includes('qui t\'a créé') ||
                                               lowerContent.includes('wer hat dich erstellt') || lowerContent.includes('wer hat dich gemacht');
                      
                      if (isCreatorQuestion) {
                        const creatorResponse = getLocalizedResponse(detectedLanguage, 'creator');
                        console.log(`🤖 Creator question detected, responding directly: ${creatorResponse}`);
                        await sendMessage(chatId, creatorResponse, true);
                        await addToUserMemory(userId, 'telegram', 'assistant', creatorResponse, { platform: 'telegram' });
                        return;
                      }
                      
                      // Check for time-related questions
                      const isTimeQuestion = lowerContent.includes('what time') || lowerContent.includes('current time') || 
                                            lowerContent.includes('hora actual') || lowerContent.includes('heure actuelle') ||
                                            lowerContent.includes('aktuelle zeit') || lowerContent.includes('ora attuale') ||
                                            lowerContent.includes('hora atual') || lowerContent.includes('time in') ||
                                            lowerContent.includes('hora en') || lowerContent.includes('heure à') ||
                                            lowerContent.includes('zeit in') || lowerContent.includes('ora a') ||
                                            lowerContent.includes('hora em') || lowerContent.includes('quelle heure') ||
                                            lowerContent.includes('que hora') || lowerContent.includes('welche uhrzeit') ||
                                            lowerContent.includes('che ora') || lowerContent.includes('que horas');
                      
                      // Check for weather-related questions
                      const isWeatherQuestion = lowerContent.includes('weather') || lowerContent.includes('temperature') || 
                                               lowerContent.includes('clima') || lowerContent.includes('météo') ||
                                               lowerContent.includes('wetter') || lowerContent.includes('tempo') ||
                                               lowerContent.includes('temperatura') || lowerContent.includes('température') ||
                                               lowerContent.includes('temperatur') || lowerContent.includes('temperatura') ||
                                               lowerContent.includes('rain') || lowerContent.includes('lluvia') ||
                                               lowerContent.includes('pluie') || lowerContent.includes('regen') ||
                                               lowerContent.includes('pioggia') || lowerContent.includes('chuva') ||
                                               lowerContent.includes('fecha') || lowerContent.includes('date') ||
                                               lowerContent.includes('aujourd\'hui') || lowerContent.includes('heute') ||
                                               lowerContent.includes('oggi') || lowerContent.includes('hoje');
                      
                      // Check for location-specific questions with more flexible patterns
                      const locationPatterns = [
                        // Pattern 1: "time/weather in [location]"
                        /(?:time|weather|clima|météo|wetter|tempo|hora|heure|zeit|ora)\s+(?:in|en|à|a|em)\s+([^?.,!]+)/i,
                        // Pattern 2: "what time is it in [location]"
                        /(?:what time is it|hora actual|heure actuelle|aktuelle zeit|ora attuale|hora atual)\s+(?:in|en|à|a|em)\s+([^?.,!]+)/i,
                        // Pattern 3: "weather in [location]"
                        /(?:weather|clima|météo|wetter|tempo)\s+(?:in|en|à|a|em)\s+([^?.,!]+)/i,
                        // Pattern 4: "current time in [location]"
                        /(?:current time|hora actual|heure actuelle|aktuelle zeit|ora attuale|hora atual)\s+(?:in|en|à|a|em)\s+([^?.,!]+)/i
                      ];
                      
                      let location = null;
                      for (const pattern of locationPatterns) {
                        const match = cleanText.match(pattern);
                        if (match) {
                          location = match[1].trim();
                          break;
                        }
                      }
                      
                      // Handle real-time queries
                      if (isTimeQuestion || isWeatherQuestion) {
                        console.log(`🌍 Real-time query detected: ${isTimeQuestion ? 'time' : 'weather'}${location ? ` for ${location}` : ' (no location specified)'}`);
                        
                        try {
                          let response = '';
                          
                          if (isTimeQuestion && isWeatherQuestion) {
                            // Both time and weather
                            if (location) {
                              const locationInfo = await getLocationInfo(location);
                              response = formatLocationInfo(locationInfo, detectedLanguage);
                            } else {
                              // Server time and generic weather info
                              const serverTime = new Date();
                              const timeStr = serverTime.toLocaleString('en-US', {
                                timeZone: 'UTC',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true
                              });
                              response = `🕐 ${getLocalizedResponse(detectedLanguage, 'time', { location: 'Server Time', time: timeStr, timezone: 'UTC' })}\n\n🌤️ ${getLocalizedResponse(detectedLanguage, 'weather', { location: 'Server Location', temperature: 'N/A', description: 'Weather data not available for server location' })}`;
                            }
                          } else if (isTimeQuestion) {
                            // Time only
                            if (location) {
                              const timeInfo = await getCurrentTime(location);
                              response = `🕐 ${getLocalizedResponse(detectedLanguage, 'time', { location: timeInfo.location, time: timeInfo.time, timezone: timeInfo.timezone })}`;
                            } else {
                              // Server time
                              const serverTime = new Date();
                              const timeStr = serverTime.toLocaleString('en-US', {
                                timeZone: 'UTC',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true
                              });
                              response = `🕐 ${getLocalizedResponse(detectedLanguage, 'time', { location: 'Server Time', time: timeStr, timezone: 'UTC' })}`;
                            }
                          } else if (isWeatherQuestion) {
                            // Weather only
                            if (location) {
                              const weatherInfo = await getCurrentWeather(location);
                              response = `🌤️ ${getLocalizedResponse(detectedLanguage, 'weather', { location: weatherInfo.location, temperature: weatherInfo.temperature, description: weatherInfo.weather_description })}`;
                            } else {
                              // Generic weather response
                              response = `🌤️ ${getLocalizedResponse(detectedLanguage, 'weather', { location: 'Server Location', temperature: 'N/A', description: 'Please specify a location for weather information' })}`;
                            }
                          }
                          
                          if (response) {
                            await sendMessage(chatId, response, true);
                            await addToUserMemory(userId, 'telegram', 'assistant', response, { platform: 'telegram' });
                            return;
                          }
                        } catch (error) {
                          console.error('Error handling real-time query:', error);
                          // Continue to normal AI processing if real-time fails
                        }
                      }
                    
                      // Get system prompt with proper language detection
                      const systemPrompt = getSystemPrompt(detectedLanguage, displayName, conversationSummary);
                      
                      // Build messages with memory
                      const messages = [
                        { 
                          role: 'system', 
                          content: systemPrompt
                        },
                        ...history.slice(-10), // Use last 10 messages for context
                        { role: 'user', content: cleanText }
                      ];
                      
                      const aiResponse = await getAIResponse(cleanText, userId, 'telegram', recentHistory, detectedLanguage);
                      console.log(`🤖 AI Response: ${aiResponse}`);
                      
                      // Add AI response to persistent memory
                      await addToUserMemory(userId, 'telegram', 'assistant', aiResponse, { platform: 'telegram' });
                      
                      // Detect emotion in user's message and send reaction
                      const emotion = detectEmotion(cleanText);
                      if (emotion && emotion !== 'neutral') {
                        console.log(`😊 Detected emotion: ${emotion} in message: "${cleanText}"`);
                        await sendReactionToUser(chatId, message.message_id, emotion);
                      }
                      
                      // Send AI response to user with reactions
                      await sendMessage(chatId, aiResponse, true);
                      
                    } catch (error) {
                      console.error('AI processing error:', error);
                      // Fallback response if AI fails
                      await sendMessage(chatId, `I apologize, but I'm having trouble processing your request right now. Please try again in a moment.`);
                    } finally {
                      processingUsers.delete(userId);
                    }
                  }
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
