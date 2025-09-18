import express from 'express';
import { z } from 'zod';
import { pool } from '../lib/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
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

const router = express.Router();
const msgSchema = z.object({
  conversationId: z.number().optional(),
  message: z.string().min(1).max(5000),
});

router.get('/conversations', requireAuth, async (req, res) => {
  const q = await pool.query('SELECT id, title, created_at FROM conversations WHERE user_id=$1 ORDER BY id DESC', [req.user.sub]);
  res.json(q.rows);
});

router.post('/message', requireAuth, async (req, res) => {
  try {
    const { conversationId, message } = msgSchema.parse(req.body);
    const userId = req.user.sub;
    
    // Detect language from current message
    const detectedLanguage = detectLanguageSimple(message);
    console.log(`🌍 Detected language: ${detectedLanguage}`);
    
    // Add user message to persistent memory
    await addToUserMemory(userId, 'web', 'user', message, { platform: 'web' });
    
    // Check for time-related questions
    const lowerContent = message.toLowerCase();
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
      const match = message.match(pattern);
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
          // Add AI response to persistent memory
          await addToUserMemory(userId, 'web', 'assistant', response, { platform: 'web' });
          
          let convId = conversationId;
          if (!convId) {
            const c = await pool.query('INSERT INTO conversations (user_id, title) VALUES ($1,$2) RETURNING id', [userId, message.slice(0, 40)]);
            convId = c.rows[0].id;
          }
          
          await pool.query('INSERT INTO messages (conversation_id, sender, content) VALUES ($1,$2,$3)', [convId, 'user', message]);
          await pool.query('INSERT INTO messages (conversation_id, sender, content) VALUES ($1,$2,$3)', [convId, 'assistant', response]);
          
          res.json({ conversationId: convId, reply: response });
          return;
        }
      } catch (error) {
        console.error('Error handling real-time query:', error);
        // Continue to normal AI processing if real-time fails
      }
    }
    
    // Get conversation history from persistent memory
    const history = await loadUserMemory(userId, 'web');
    const conversationSummary = await getConversationSummary(userId, 'web', 10);
    
    // Get system prompt with proper language detection
    const systemPrompt = getSystemPrompt(detectedLanguage, userId, conversationSummary);
    
    let convId = conversationId;
    if (!convId) {
      const c = await pool.query('INSERT INTO conversations (user_id, title) VALUES ($1,$2) RETURNING id', [userId, message.slice(0, 40)]);
      convId = c.rows[0].id;
    }
    
    await pool.query('INSERT INTO messages (conversation_id, sender, content) VALUES ($1,$2,$3)', [convId, 'user', message]);
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10), // Use last 10 messages for context
      { role: 'user', content: message }
    ];
    
    const reply = await getAIResponse(message, userId, 'web', recentHistory, detectedLanguage);
    
    // Add AI response to persistent memory
    await addToUserMemory(userId, 'web', 'assistant', reply, { platform: 'web' });
    
    await pool.query('INSERT INTO messages (conversation_id, sender, content) VALUES ($1,$2,$3)', [convId, 'assistant', reply]);
    res.json({ conversationId: convId, reply });
  } catch (e) {
    res.status(400).json({ error: e.errors?.[0]?.message || String(e) });
  }
});

router.get('/admin/metrics', requireAuth, requireAdmin, async (_req, res) => {
  const stats = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users) as users,
      (SELECT COUNT(*) FROM conversations) as conversations,
      (SELECT COUNT(*) FROM messages) as messages
  `);
  res.json(stats.rows[0]);
});

export default router;
