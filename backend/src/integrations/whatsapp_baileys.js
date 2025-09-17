import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { completeChat } from '../ai/openai.js';
import fs from 'fs';
import pino from 'pino';
import QRCode from 'qrcode';
import qrcode from 'qrcode-terminal';
import { 
  loadUserMemory, 
  addToUserMemory, 
  getConversationSummary, 
  detectLanguage, 
  hasUserBeenGreeted,
  getUserPreferredLanguage 
} from '../lib/memory.js';
import { getLocalizedResponse, getSystemPrompt } from '../lib/language.js';
import { getCurrentTime, getCurrentWeather, getLocationInfo, formatLocationInfo } from '../lib/realtime.js';

// WhatsApp Bot Integration using Baileys
const BOT_TOKEN = process.env.WHATSAPP_SESSION_NAME || 'vox-ai-session';

if (!BOT_TOKEN) {
  console.log('WHATSAPP_SESSION_NAME not set. WhatsApp integration disabled.');
  process.exit(0);
}

// Processing users to prevent duplicate processing
const processingUsers = new Set();

// QR Code generation function
async function generateQRCodeImage(qrString) {
  try {
    // Generate QR code as PNG buffer
    const qrBuffer = await QRCode.toBuffer(qrString, {
      type: 'png',
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Save QR code image
    const qrPath = `../logs/whatsapp-qr-${Date.now()}.png`;
    fs.writeFileSync(qrPath, qrBuffer);
    
    console.log('📱 QR Code image saved to:', qrPath);
    console.log('📱 You can open this image to scan with WhatsApp');
    
    // Schedule cleanup after 3 minutes
    setTimeout(() => {
      try {
        if (fs.existsSync(qrPath)) {
          fs.unlinkSync(qrPath);
          console.log('🧹 QR code image cleaned up');
        }
      } catch (error) {
        console.log('⚠️ Could not clean up QR code image:', error.message);
      }
    }, 180000); // 3 minutes
    
    return qrPath;
  } catch (error) {
    console.error('❌ Error generating QR code image:', error);
    return null;
  }
}

function detectEmotion(message) {
  const lowerMessage = message.toLowerCase();
  
  // Happy emotions (multilingual)
  if (lowerMessage.includes('😊') || lowerMessage.includes('😄') || lowerMessage.includes('😃') || 
      lowerMessage.includes(':)') || lowerMessage.includes('happy') || lowerMessage.includes('great') || 
      lowerMessage.includes('awesome') || lowerMessage.includes('amazing') ||
      lowerMessage.includes('feliz') || lowerMessage.includes('genial') || lowerMessage.includes('increíble') ||
      lowerMessage.includes('contento') || lowerMessage.includes('alegre') || lowerMessage.includes('fantástico') ||
      lowerMessage.includes('heureux') || lowerMessage.includes('génial') || lowerMessage.includes('incroyable') ||
      lowerMessage.includes('glücklich') || lowerMessage.includes('toll') || lowerMessage.includes('fantastisch')) {
    return 'happy';
  }
  
  // Sad emotions (multilingual)
  if (lowerMessage.includes('😢') || lowerMessage.includes('😭') || lowerMessage.includes('sad') || 
      lowerMessage.includes('cry') || lowerMessage.includes('depressed') || lowerMessage.includes('upset') ||
      lowerMessage.includes('triste') || lowerMessage.includes('llorar') || lowerMessage.includes('deprimido') ||
      lowerMessage.includes('mal') || lowerMessage.includes('tristeza') || lowerMessage.includes('melancólico') ||
      lowerMessage.includes('triste') || lowerMessage.includes('pleurer') || lowerMessage.includes('déprimé') ||
      lowerMessage.includes('traurig') || lowerMessage.includes('weinen') || lowerMessage.includes('deprimiert')) {
    return 'sad';
  }
  
  // Angry emotions (multilingual) - more specific to avoid false positives
  if (lowerMessage.includes('😠') || lowerMessage.includes('😡') || lowerMessage.includes('angry') || 
      (lowerMessage.includes('mad') && !lowerMessage.includes('madrid')) || lowerMessage.includes('furious') || lowerMessage.includes('rage') ||
      lowerMessage.includes('enojado') || lowerMessage.includes('furioso') || lowerMessage.includes('ira') ||
      lowerMessage.includes('molesto') || lowerMessage.includes('rabia') || lowerMessage.includes('enfadado') ||
      lowerMessage.includes('en colère') || lowerMessage.includes('furieux') || lowerMessage.includes('rage') ||
      lowerMessage.includes('wütend') || lowerMessage.includes('zornig') || lowerMessage.includes('ärgerlich') ||
      lowerMessage.includes('estoy enojado') || lowerMessage.includes('estoy furioso') || lowerMessage.includes('estoy molesto') ||
      lowerMessage.includes('je suis en colère') || lowerMessage.includes('je suis furieux') || lowerMessage.includes('je suis fâché') ||
      lowerMessage.includes('ich bin wütend') || lowerMessage.includes('ich bin zornig') || lowerMessage.includes('ich bin ärgerlich')) {
    return 'angry';
  }
  
  // Fearful emotions (multilingual)
  if (lowerMessage.includes('😨') || lowerMessage.includes('😰') || lowerMessage.includes('scared') || 
      lowerMessage.includes('afraid') || lowerMessage.includes('fear') || lowerMessage.includes('worried') ||
      lowerMessage.includes('asustado') || lowerMessage.includes('miedo') || lowerMessage.includes('preocupado') ||
      lowerMessage.includes('temor') || lowerMessage.includes('ansioso') || lowerMessage.includes('nervioso') ||
      lowerMessage.includes('peur') || lowerMessage.includes('effrayé') || lowerMessage.includes('inquiet') ||
      lowerMessage.includes('angst') || lowerMessage.includes('verängstigt') || lowerMessage.includes('besorgt')) {
    return 'fearful';
  }
  
  // Confused emotions (multilingual)
  if (lowerMessage.includes('😕') || lowerMessage.includes('🤔') || lowerMessage.includes('confused') || 
      lowerMessage.includes('puzzled') || lowerMessage.includes('lost') || lowerMessage.includes('unclear') ||
      lowerMessage.includes('confundido') || lowerMessage.includes('perdido') || lowerMessage.includes('desconcertado') ||
      lowerMessage.includes('confuso') || lowerMessage.includes('desorientado') || lowerMessage.includes('perplejo') ||
      lowerMessage.includes('confus') || lowerMessage.includes('perdu') || lowerMessage.includes('déconcerté') ||
      lowerMessage.includes('verwirrt') || lowerMessage.includes('verloren') || lowerMessage.includes('verblüfft')) {
    return 'confused';
  }
  
  // Love emotions (multilingual)
  if (lowerMessage.includes('❤️') || lowerMessage.includes('💕') || lowerMessage.includes('love') || 
      lowerMessage.includes('heart') || lowerMessage.includes('adore') || lowerMessage.includes('cherish') ||
      lowerMessage.includes('amor') || lowerMessage.includes('corazón') || lowerMessage.includes('adorar') ||
      lowerMessage.includes('querer') || lowerMessage.includes('amar') || lowerMessage.includes('cariño') ||
      lowerMessage.includes('amour') || lowerMessage.includes('cœur') || lowerMessage.includes('adorer') ||
      lowerMessage.includes('liebe') || lowerMessage.includes('herz') || lowerMessage.includes('verehren')) {
    return 'love';
  }
  
  return 'neutral';
}

function getEmojiForEmotion(emotion) {
  const emotionEmojis = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    fearful: '😨',
    confused: '😕',
    love: '❤️',
    neutral: '😐'
  };
  return emotionEmojis[emotion] || '😐';
}

async function sendMessage(sock, jid, message) {
  await sock.sendMessage(jid, { text: message });
}

async function sendReactionToUser(sock, jid, emotion, language = 'en') {
  const emoji = getEmojiForEmotion(emotion);
  const message = getLocalizedResponse(language, 'emotions', { emotion });
  await sock.sendMessage(jid, { text: message });
}

// Initialize WhatsApp client with better error handling
let sock;
let state;
let saveCreds;

try {
  const authState = await useMultiFileAuthState(`./auth_info_${BOT_TOKEN}`);
  state = authState.state;
  saveCreds = authState.saveCreds;
} catch (error) {
  console.error('❌ Failed to load auth state:', error);
  console.log('🔄 Creating new auth state...');
  
  // Create fresh auth state if loading fails
  const authState = await useMultiFileAuthState(`./auth_info_${BOT_TOKEN}_new`);
  state = authState.state;
  saveCreds = authState.saveCreds;
}

sock = makeWASocket({
  auth: state,
  logger: pino({ level: 'error' }), // Only show errors, not debug info
  browser: ['Vox AI Chatbot', 'Chrome', '1.0.0'],
  generateHighQualityLinkPreview: false,
  markOnlineOnConnect: false,
  defaultQueryTimeoutMs: 90000, // 1.5 minutes
  keepAliveIntervalMs: 120000, // 2 minutes
  connectTimeoutMs: 90000, // 1.5 minutes
  retryRequestDelayMs: 5000,
  maxMsgRetryCount: 1,
  msgRetryCounterCache: new Map(),
  getMessage: async (key) => {
    return {
      conversation: "conversation"
    };
  },
  printQRInTerminal: false,
  shouldSyncHistoryMessage: () => false,
  shouldIgnoreJid: () => false,
  syncFullHistory: false,
  fireInitQueries: false,
  emitOwnEvents: false
});

// Event handlers
sock.ev.on('connection.update', (update) => {
  const { connection, lastDisconnect, qr } = update;
  
  if (qr) {
    console.log('📱 WhatsApp QR Code:');
    console.log(qr);
    console.log('📱 Scan this QR code with your WhatsApp to connect the bot');
    console.log('📱 QR code is valid for 2 minutes - take your time!');
    console.log('📱 Go to WhatsApp > Linked Devices > Link a Device');
    
    // Generate QR code image
    generateQRCodeImage(qr);
    
    // Also display QR code in terminal
    console.log('\n📱 QR Code (Terminal):');
    qrcode.generate(qr, { small: true });
    console.log('\n');
  }
  
  if (connection === 'close') {
    const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
    const isUnauthorized = lastDisconnect?.error?.output?.statusCode === 401;
    
    if (isUnauthorized) {
      console.log('❌ Authentication failed (401 Unauthorized)');
      console.log('🔄 This usually means the session expired or was invalidated');
      console.log('🔄 Please delete the auth folder and restart to get a new QR code');
      console.log('🔄 Run: rm -rf ./auth_info_* && npm run start:whatsapp');
      return;
    }
    
    console.log('❌ Connection closed due to:', lastDisconnect?.error?.message || 'Unknown error');
    console.log('🔄 Reconnecting:', shouldReconnect);
    
    if (shouldReconnect) {
      console.log('🔄 Waiting 10 seconds before reconnecting...');
      setTimeout(() => {
        console.log('🔄 Attempting to reconnect...');
        // Restart the bot process
        process.exit(1);
      }, 10000);
    } else {
      console.log('❌ Not reconnecting - session logged out');
      process.exit(0);
    }
  } else if (connection === 'open') {
    console.log('🤖 WhatsApp bot is ready and online!');
    console.log('📱 Bot is connected and ready to chat!');
    console.log('🧠 Memory system enabled for conversation context!');
    console.log('😊 Emotion detection enabled for user feedback!');
    console.log('👋 Welcome messages enabled for new contacts!');
  } else if (connection === 'connecting') {
    console.log('🔄 Connecting to WhatsApp...');
  }
});

sock.ev.on('creds.update', saveCreds);

sock.ev.on('messages.upsert', async (m) => {
  try {
    const msg = m.messages[0];
    
    if (!msg.message || msg.key.fromMe) return;
    
    const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    if (!messageText.trim()) return;
    
    const jid = msg.key.remoteJid;
    const userId = jid;
    const isGroup = jid.endsWith('@g.us');
    
    if (processingUsers.has(userId)) {
      return;
    }
  
  // For group messages, check if bot is mentioned
  if (isGroup) {
    const isMentioned = messageText.includes('@') && (messageText.toLowerCase().includes('vox') || messageText.toLowerCase().includes('bot'));
    const isReplyToBot = msg.message.extendedTextMessage?.contextInfo?.participant === sock.user?.id;
    
    if (!isMentioned && !isReplyToBot) {
      return;
    }
  }
  
  processingUsers.add(userId);
  
  try {
    console.log(`📱 Processing message: "${messageText}" from ${jid}`);
    
    // Detect language from current message and conversation history
    const detectedLanguage = await detectLanguage(userId, 'whatsapp', messageText);
    console.log(`🌍 Detected language: ${detectedLanguage}`);
    
    // Add user message to persistent memory
    await addToUserMemory(userId, 'whatsapp', 'user', messageText, { platform: 'whatsapp' });
    
    // Get conversation history for context (but limit to recent messages)
    const history = await loadUserMemory(userId, 'whatsapp');
    const recentHistory = history.slice(-5); // Use only last 5 messages for context
    const conversationSummary = await getConversationSummary(userId, 'whatsapp', 5);
    
    // Get system prompt with proper language detection and context
    const systemPrompt = getSystemPrompt(detectedLanguage, jid, conversationSummary);
    
    const messages = [
      { 
        role: 'system', 
        content: systemPrompt
      },
      ...recentHistory, // Use recent history for context
      { role: 'user', content: messageText }
    ];
    
    // Check for creator-related questions first (multilingual)
    const lowerContent = messageText.toLowerCase();
    const isCreatorQuestion = lowerContent.includes('who made you') || lowerContent.includes('who created you') || 
                             lowerContent.includes('who built you') || lowerContent.includes('who developed you') || 
                             lowerContent.includes('who programmed you') || lowerContent.includes('quien te creo') ||
                             lowerContent.includes('quien te hizo') || lowerContent.includes('quien te programo') ||
                             lowerContent.includes('quien te desarrollo') || lowerContent.includes('quien te construyo') ||
                             lowerContent.includes('qui vous a créé') || lowerContent.includes('qui t\'a créé') ||
                             lowerContent.includes('wer hat dich erstellt') || lowerContent.includes('wer hat dich gemacht');
    
    if (isCreatorQuestion) {
      const creatorResponse = getLocalizedResponse(detectedLanguage, 'creator');
      await sendMessage(sock, jid, creatorResponse);
      await addToUserMemory(userId, 'whatsapp', 'assistant', creatorResponse, { platform: 'whatsapp' });
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
                          lowerContent.includes('che ora') || lowerContent.includes('que horas') ||
                          lowerContent.includes('hora local') || lowerContent.includes('hora es') ||
                          lowerContent.includes('que hora es') || lowerContent.includes('cual es la hora') ||
                          lowerContent.includes('hora de') || lowerContent.includes('tiempo en');
    
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
      // Pattern 1: "time/weather in [location]" - English
      /(?:time|weather)\s+(?:in|at)\s+([^?.,!]+)/i,
      // Pattern 2: "what time is it in [location]" - English
      /(?:what time is it|current time)\s+(?:in|at)\s+([^?.,!]+)/i,
      // Pattern 3: "weather in [location]" - English
      /(?:weather|temperature)\s+(?:in|at)\s+([^?.,!]+)/i,
      // Pattern 4: Spanish patterns - "hora en [location]"
      /(?:hora|clima|tiempo)\s+(?:en|de)\s+([^?.,!]+)/i,
      // Pattern 5: Spanish patterns - "que hora es en [location]"
      /(?:que hora es|hora actual|hora local)\s+(?:en|de)\s+([^?.,!]+)/i,
      // Pattern 6: French patterns
      /(?:heure|météo|temps)\s+(?:à|en)\s+([^?.,!]+)/i,
      // Pattern 7: German patterns
      /(?:zeit|wetter)\s+(?:in|um)\s+([^?.,!]+)/i,
      // Pattern 8: Italian patterns
      /(?:ora|tempo)\s+(?:a|in)\s+([^?.,!]+)/i,
      // Pattern 9: Portuguese patterns
      /(?:hora|tempo|clima)\s+(?:em|no|na)\s+([^?.,!]+)/i,
      // Pattern 10: Generic location patterns with dashes and commas (more specific)
      /([A-Za-zÀ-ÿ\s]+(?:-|,)\s*[A-Za-zÀ-ÿ\s]+)/i,
      // Pattern 11: Locations with "y" (and) in Spanish
      /([A-Za-zÀ-ÿ\s]+(?:,|y|and)\s*[A-Za-zÀ-ÿ\s]+)/i,
      // Pattern 12: Direct location mentions after time/weather keywords
      /(?:hora|clima|tiempo|time|weather|heure|météo|temps|zeit|wetter|ora|tempo)\s+(?:en|de|in|at|à|a|em|no|na|um)\s+([^?.,!]+)/i
    ];
    
    let location = null;
    for (const pattern of locationPatterns) {
      const match = messageText.match(pattern);
      if (match) {
        location = match[1].trim();
        // Clean up the location - remove common words and extra spaces
        location = location
          .replace(/^(que|what|hora|time|clima|weather|tiempo|temps|heure|zeit|ora|hora)\s+/i, '')
          .replace(/\s+(que|what|hora|time|clima|weather|tiempo|temps|heure|zeit|ora|hora)$/i, '')
          .replace(/\s+/g, ' ')
          .trim();
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
            try {
              const timeInfo = await getCurrentTime(location);
              response = `🕐 ${getLocalizedResponse(detectedLanguage, 'time', { location: timeInfo.location, time: timeInfo.time, timezone: timeInfo.timezone })}`;
            } catch (timeError) {
              console.error('Error getting current time:', timeError);
              // Fallback to server time
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
              if (detectedLanguage === 'es') {
                response = `🕐 Hora del servidor para ${location}: ${timeStr} (UTC)`;
              } else if (detectedLanguage === 'fr') {
                response = `🕐 Heure du serveur pour ${location}: ${timeStr} (UTC)`;
              } else {
                response = `🕐 Server time for ${location}: ${timeStr} (UTC)`;
              }
            }
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
            if (detectedLanguage === 'es') {
              response = `🕐 Hora del servidor: ${timeStr} (UTC)`;
            } else if (detectedLanguage === 'fr') {
              response = `🕐 Heure du serveur: ${timeStr} (UTC)`;
            } else {
              response = `🕐 Server time: ${timeStr} (UTC)`;
            }
          }
        } else if (isWeatherQuestion) {
          // Weather only
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
            } else {
              response = `🌤️ Please specify a location for weather information.`;
            }
          }
        }
        
        if (response) {
          await sendMessage(sock, jid, response);
          await addToUserMemory(userId, 'whatsapp', 'assistant', response, { platform: 'whatsapp' });
          return;
        }
      } catch (error) {
        console.error('Error handling real-time query:', error);
        
        // Provide fallback response for real-time queries
        let fallbackResponse = '';
        if (isTimeQuestion) {
          if (location) {
            // Simple fallback without getLocalizedResponse
            if (detectedLanguage === 'es') {
              fallbackResponse = `🕐 Lo siento, no puedo obtener la hora actual para ${location} debido a problemas de conexión. Por favor, intenta de nuevo más tarde.`;
            } else if (detectedLanguage === 'fr') {
              fallbackResponse = `🕐 Désolé, je ne peux pas obtenir l'heure actuelle pour ${location} en raison de problèmes de connexion. Veuillez réessayer plus tard.`;
            } else {
              fallbackResponse = `🕐 Sorry, I can't get the current time for ${location} due to connection issues. Please try again later.`;
            }
          } else {
            const serverTime = new Date();
            if (detectedLanguage === 'es') {
              fallbackResponse = `🕐 Hora del servidor: ${serverTime.toLocaleString()} (UTC)`;
            } else if (detectedLanguage === 'fr') {
              fallbackResponse = `🕐 Heure du serveur: ${serverTime.toLocaleString()} (UTC)`;
            } else {
              fallbackResponse = `🕐 Server time: ${serverTime.toLocaleString()} (UTC)`;
            }
          }
        } else if (isWeatherQuestion) {
          if (location) {
            if (detectedLanguage === 'es') {
              fallbackResponse = `🌤️ Lo siento, no puedo obtener el clima para ${location} debido a problemas de conexión. Por favor, intenta de nuevo más tarde.`;
            } else if (detectedLanguage === 'fr') {
              fallbackResponse = `🌤️ Désolé, je ne peux pas obtenir la météo pour ${location} en raison de problèmes de connexion. Veuillez réessayer plus tard.`;
            } else {
              fallbackResponse = `🌤️ Sorry, I can't get the weather for ${location} due to connection issues. Please try again later.`;
            }
          } else {
            if (detectedLanguage === 'es') {
              fallbackResponse = `🌤️ Por favor, especifica una ubicación para obtener información del clima.`;
            } else if (detectedLanguage === 'fr') {
              fallbackResponse = `🌤️ Veuillez spécifier un emplacement pour obtenir les informations météorologiques.`;
            } else {
              fallbackResponse = `🌤️ Please specify a location for weather information.`;
            }
          }
        }
        
        if (fallbackResponse) {
          await sendMessage(sock, jid, fallbackResponse);
          await addToUserMemory(userId, 'whatsapp', 'assistant', fallbackResponse, { platform: 'whatsapp' });
          return;
        }
        
        // Continue to normal AI processing if real-time fails
      }
    }
    
    // Detect emotion first and send reaction if needed
    const emotion = detectEmotion(messageText);
    if (emotion !== 'neutral') {
      console.log(`😊 Detected emotion: ${emotion} in message: "${messageText}"`);
      await sendReactionToUser(sock, jid, emotion, detectedLanguage);
    }
    
    // Process with AI
    console.log(`🧠 Processing message with AI: ${messageText}`);
    const aiResponse = await completeChat(messages);
    console.log(`🤖 AI Response: ${aiResponse}`);
    
    // Add AI response to persistent memory
    await addToUserMemory(userId, 'whatsapp', 'assistant', aiResponse, { platform: 'whatsapp' });
    await sendMessage(sock, jid, aiResponse);
    
  } catch (error) {
    console.error('AI processing error:', error);
    await sendMessage(sock, jid, `I apologize, but I'm having trouble processing your request right now. Please try again in a moment.`);
  } finally {
    processingUsers.delete(userId);
  }
  } catch (error) {
    console.error('❌ Error processing message:', error);
  }
});

// Handle group updates (new members)
sock.ev.on('groups.update', async (updates) => {
  for (const update of updates) {
    if (update.participants) {
      for (const participant of update.participants) {
        if (participant.action === 'add') {
          const jid = update.id;
          const userName = participant.id.split('@')[0];
          const userId = participant.id;
          
          console.log(`👋 New member joined group: ${userName}`);
          
          // Check if user has been greeted before
          if (!(await hasUserBeenGreeted(userId, 'whatsapp'))) {
            // Detect language preference (default to English for new users)
            const language = 'en'; // Default for welcome messages
            const welcomeMessage = getLocalizedResponse(language, 'welcome', { userName });
            
            await sendMessage(sock, jid, welcomeMessage);
            
            // Mark user as greeted
            await addToUserMemory(userId, 'whatsapp', 'system', 'User joined group and was welcomed', { 
              platform: 'whatsapp',
              action: 'welcome'
            });
          }
        }
      }
    }
  }
});

// Error handling
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down WhatsApp bot...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down WhatsApp bot...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the bot
console.log('🚀 Starting WhatsApp bot (Baileys version)...');
console.log('📱 Session name:', BOT_TOKEN);

export default sock;
