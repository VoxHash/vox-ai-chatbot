import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import { getAIResponse } from '../ai/localai.js';
import { loadUserMemory, saveUserMemory } from '../lib/memory.js';
import { detectLanguageSimple } from '../lib/language-detection-simple.js';
import { getLocalizedResponse } from '../lib/language.js';
import { detectEmotion } from '../lib/emotion-detection.js';
import { getCurrentTime, getCurrentWeather } from '../lib/realtime.js';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Store raw body for signature verification
app.use((req, res, next) => {
  req.rawBody = JSON.stringify(req.body);
  next();
});

function verifySlack(req) {
  const ts = req.headers['x-slack-request-timestamp'];
  const sig = req.headers['x-slack-signature'];
  const base = `v0:${ts}:${req.rawBody}`;
  const mySig = 'v0=' + crypto.createHmac('sha256', process.env.SLACK_SIGNING_SECRET || 'x').update(base).digest('hex');
  return sig === mySig;
}

// Slack API client
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;

async function sendSlackMessage(channel, text, thread_ts = null) {
  try {
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SLACK_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: channel,
        text: text,
        thread_ts: thread_ts
      })
    });
    
    const result = await response.json();
    if (!result.ok) {
      console.error('Slack API error:', result.error);
    }
    return result;
  } catch (error) {
    console.error('Error sending Slack message:', error);
    return null;
  }
}

async function addSlackReaction(channel, timestamp, name) {
  try {
    const response = await fetch('https://slack.com/api/reactions.add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SLACK_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: channel,
        timestamp: timestamp,
        name: name
      })
    });
    
    const result = await response.json();
    if (!result.ok) {
      console.error('Slack reaction error:', result.error);
    }
    return result;
  } catch (error) {
    console.error('Error adding Slack reaction:', error);
    return null;
  }
}

async function processSlackMessage(event) {
  try {
    const messageText = event.text;
    const userId = event.user;
    const channel = event.channel;
    const timestamp = event.ts;
    const threadTs = event.thread_ts;

    // Skip if message is from bot
    if (event.bot_id || event.subtype === 'bot_message') {
      return;
    }

    // Skip if message doesn't mention bot (for channels)
    if (channel.startsWith('C') && !messageText.includes('<@')) {
      return;
    }

    console.log(`🧠 Processing Slack message with AI: ${messageText}`);
    console.log(`📍 Channel: ${channel}`);
    console.log(`👤 User: ${userId}`);

    // Detect language
    const detectedLanguage = detectLanguageSimple(messageText);
    console.log(`🌍 Detected language: ${detectedLanguage}`);

    // Load user memory
    const conversationHistory = await loadUserMemory(userId, 'slack');
    console.log(`🧠 Loaded ${conversationHistory.length} previous messages`);

    // Check for real-time queries
    const isTimeQuestion = /(what time|hora|heure|zeit|ora|시간|ordua)/i.test(messageText);
    const isWeatherQuestion = /(weather|clima|temps|wetter|tempo|날씨|eguraldia)/i.test(messageText);

    let response = '';

    if (isTimeQuestion || isWeatherQuestion) {
      // Extract location
      const locationPatterns = [
        /(?:in|en|à|in|에서|nola|nondik)\s+([^?.,!]+)/i,
        /(?:at|en|à|bei|에서|nola|nondik)\s+([^?.,!]+)/i,
        /(?:time|hora|heure|zeit|ora|시간|ordua)\s+(?:in|en|à|in|에서|nola|nondik)\s+([^?.,!]+)/i,
        /(?:weather|clima|temps|wetter|tempo|날씨|eguraldia)\s+(?:in|en|à|in|에서|nola|nondik)\s+([^?.,!]+)/i
      ];

      let location = null;
      for (const pattern of locationPatterns) {
        const match = messageText.match(pattern);
        if (match) {
          location = match[1].trim();
          // Clean up the location
          location = location
            .replace(/^(que|what|hora|time|clima|weather|tiempo|temps|heure|zeit|ora|hora|시간|ordua)\s+/i, '')
            .replace(/\s+(que|what|hora|time|clima|weather|tiempo|temps|heure|zeit|ora|hora|시간|ordua)$/i, '')
            .replace(/\s+/g, ' ')
            .trim();
          break;
        }
      }

      if (isTimeQuestion) {
        if (location) {
          try {
            const timeInfo = await getCurrentTime(location);
            response = `🕐 ${getLocalizedResponse(detectedLanguage, 'time', { location: timeInfo.location, time: timeInfo.time, timezone: timeInfo.timezone })}`;
          } catch (timeError) {
            console.error('Error getting current time:', timeError);
            // Fallback to server time
            const serverTime = new Date();
            const timeStr = serverTime.toLocaleString('en-US', {
              timeZone: 'UTC',
              year: 'numeric', month: 'long', day: 'numeric',
              hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
            });
            if (detectedLanguage === 'es') {
              response = `🕐 Hora del servidor para ${location}: ${timeStr} (UTC)`;
            } else if (detectedLanguage === 'fr') {
              response = `🕐 Heure du serveur pour ${location}: ${timeStr} (UTC)`;
            } else if (detectedLanguage === 'ko') {
              response = `🕐 ${location}의 서버 시간: ${timeStr} (UTC)`;
            } else if (detectedLanguage === 'eu') {
              response = `🕐 ${location}-ko zerbitzari ordua: ${timeStr} (UTC)`;
            } else {
              response = `🕐 Server time for ${location}: ${timeStr} (UTC)`;
            }
          }
        } else {
          // Server time
          const serverTime = new Date();
          const timeStr = serverTime.toLocaleString('en-US', {
            timeZone: 'UTC',
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
          });
          if (detectedLanguage === 'es') {
            response = `🕐 Hora del servidor: ${timeStr} (UTC)`;
          } else if (detectedLanguage === 'fr') {
            response = `🕐 Heure du serveur: ${timeStr} (UTC)`;
          } else if (detectedLanguage === 'ko') {
            response = `🕐 서버 시간: ${timeStr} (UTC)`;
          } else if (detectedLanguage === 'eu') {
            response = `🕐 Zerbitzari ordua: ${timeStr} (UTC)`;
          } else {
            response = `🕐 Server time: ${timeStr} (UTC)`;
          }
        }
      } else if (isWeatherQuestion) {
        if (location) {
          try {
            const weatherInfo = await getCurrentWeather(location);
            response = `🌤️ ${getLocalizedResponse(detectedLanguage, 'weather', { location: weatherInfo.location, temperature: weatherInfo.temperature, description: weatherInfo.weather_description })}`;
          } catch (weatherError) {
            console.error('Error getting current weather:', weatherError);
            // Fallback response
            if (detectedLanguage === 'es') {
              response = `🌤️ No puedo obtener el clima para ${location} en este momento. Por favor, intenta de nuevo más tarde.`;
            } else if (detectedLanguage === 'fr') {
              response = `🌤️ Je ne peux pas obtenir la météo pour ${location} en ce moment. Veuillez réessayer plus tard.`;
            } else if (detectedLanguage === 'ko') {
              response = `🌤️ ${location}의 날씨를 지금 가져올 수 없습니다. 나중에 다시 시도해주세요.`;
            } else if (detectedLanguage === 'eu') {
              response = `🌤️ Ezin dut ${location}-ko eguraldia orain lortu. Mesedez, saiatu berriro geroago.`;
            } else {
              response = `🌤️ I can't get the weather for ${location} right now. Please try again later.`;
            }
          }
        } else {
          // Generic weather response
          if (detectedLanguage === 'es') {
            response = `🌤️ Por favor, especifica una ubicación para obtener información del clima.`;
          } else if (detectedLanguage === 'fr') {
            response = `🌤️ Veuillez spécifier un emplacement pour obtenir les informations météorologiques.`;
          } else if (detectedLanguage === 'ko') {
            response = `🌤️ 날씨 정보를 얻기 위해 위치를 지정해주세요.`;
          } else if (detectedLanguage === 'eu') {
            response = `🌤️ Mesedez, zehaztu kokapena eguraldi informazioa lortzeko.`;
          } else {
            response = `🌤️ Please specify a location for weather information.`;
          }
        }
      }
    } else {
      // Regular AI response
      try {
        response = await getAIResponse(messageText, userId, 'slack', conversationHistory, detectedLanguage);
        console.log(`🤖 AI Response: ${response}`);
      } catch (error) {
        console.error('AI processing error:', error);
        response = getLocalizedResponse(detectedLanguage, 'error', {});
      }
    }

    // Send response
    if (response) {
      await sendSlackMessage(channel, response, threadTs);
      
      // Add reaction based on emotion
      const emotion = detectEmotion(messageText);
      if (emotion) {
        const reactionMap = {
          happy: '😊',
          sad: '😢',
          angry: '😠',
          fearful: '😨',
          confused: '😕',
          love: '❤️'
        };
        
        if (reactionMap[emotion]) {
          await addSlackReaction(channel, timestamp, reactionMap[emotion]);
        }
      }
    }

    // Save conversation to memory
    const newMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
      language: detectedLanguage
    };

    const newResponse = {
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
      language: detectedLanguage
    };

    await saveUserMemory(userId, 'slack', [...conversationHistory, newMessage, newResponse]);

  } catch (error) {
    console.error('Error processing Slack message:', error);
  }
}

app.post('/slack/events', async (req, res) => {
  if (req.body.type === 'url_verification') {
    return res.send(req.body.challenge);
  }

  // Verify signature (optional for development)
  if (process.env.NODE_ENV === 'production' && !verifySlack(req)) {
    console.error('Invalid Slack signature');
    return res.status(401).send('Unauthorized');
  }

  const event = req.body.event;
  if (event?.type === 'app_mention' || event?.type === 'message') {
    // Skip if message is from bot
    if (event.bot_id || event.subtype === 'bot_message') {
      return res.sendStatus(200);
    }

    // Process message
    await processSlackMessage(event);
  }

  res.sendStatus(200);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'slack-bot' });
});

const PORT = process.env.SLACK_PORT || 4002;
app.listen(PORT, () => {
  console.log('🤖 Slack bot is ready and online!');
  console.log(`📱 Bot is connected and ready to chat!`);
  console.log(`🧠 Memory system enabled for conversation context!`);
  console.log(`😊 Emotion detection enabled for user feedback!`);
  console.log(`🌍 Multilingual support enabled!`);
  console.log(`🚀 Slack app endpoint on port ${PORT}`);
});

export default app;