import { 
  getCurrentTime, 
  getCurrentWeather, 
  getLocationInfo, 
  formatLocationInfo 
} from '../backend/src/lib/realtime.js';
import { getLocalizedResponse } from '../backend/src/lib/language.js';

async function testAllPlatformsRealtime() {
  console.log('🧪 Testing All Platforms Real-time Functionality\n');

  const testCases = [
    {
      platform: 'Telegram',
      message: "What time is it?",
      language: "en",
      expectedType: "time",
      hasLocation: false
    },
    {
      platform: 'Telegram',
      message: "quelle heure est-il?",
      language: "fr", 
      expectedType: "time",
      hasLocation: false
    },
    {
      platform: 'Telegram',
      message: "Cual es el clima actual? Y que fecha es hoy?",
      language: "es",
      expectedType: "weather",
      hasLocation: false
    },
    {
      platform: 'Discord',
      message: "What time is it in Madrid, Spain?",
      language: "en",
      expectedType: "time",
      hasLocation: true,
      location: "Madrid, Spain"
    },
    {
      platform: 'Discord',
      message: "Weather in Montreal, Canada",
      language: "en",
      expectedType: "weather", 
      hasLocation: true,
      location: "Montreal, Canada"
    },
    {
      platform: 'Frontend',
      message: "Hora y clima en Madrid, España",
      language: "es",
      expectedType: "both",
      hasLocation: true,
      location: "Madrid, España"
    }
  ];

  for (const testCase of testCases) {
    console.log(`📱 Testing ${testCase.platform}: "${testCase.message}"`);
    console.log(`🌍 Expected Language: ${testCase.language}`);
    console.log(`🎯 Expected Type: ${testCase.expectedType}`);
    console.log(`📍 Has Location: ${testCase.hasLocation}`);
    
    if (testCase.hasLocation) {
      console.log(`📍 Location: ${testCase.location}`);
    }
    
    try {
      let response = '';
      
      if (testCase.expectedType === 'time') {
        if (testCase.hasLocation) {
          const timeInfo = await getCurrentTime(testCase.location);
          response = `🕐 ${getLocalizedResponse(testCase.language, 'time', { 
            location: timeInfo.location, 
            time: timeInfo.time, 
            timezone: timeInfo.timezone 
          })}`;
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
          response = `🕐 ${getLocalizedResponse(testCase.language, 'time', { 
            location: 'Server Time', 
            time: timeStr, 
            timezone: 'UTC' 
          })}`;
        }
      } else if (testCase.expectedType === 'weather') {
        if (testCase.hasLocation) {
          const weatherInfo = await getCurrentWeather(testCase.location);
          response = `🌤️ ${getLocalizedResponse(testCase.language, 'weather', { 
            location: weatherInfo.location, 
            temperature: weatherInfo.temperature, 
            description: weatherInfo.weather_description 
          })}`;
        } else {
          response = `🌤️ ${getLocalizedResponse(testCase.language, 'weather', { 
            location: 'Server Location', 
            temperature: 'N/A', 
            description: 'Please specify a location for weather information' 
          })}`;
        }
      } else if (testCase.expectedType === 'both') {
        if (testCase.hasLocation) {
          const locationInfo = await getLocationInfo(testCase.location);
          response = formatLocationInfo(locationInfo, testCase.language);
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
          response = `🕐 ${getLocalizedResponse(testCase.language, 'time', { 
            location: 'Server Time', 
            time: timeStr, 
            timezone: 'UTC' 
          })}\n\n🌤️ ${getLocalizedResponse(testCase.language, 'weather', { 
            location: 'Server Location', 
            temperature: 'N/A', 
            description: 'Weather data not available for server location' 
          })}`;
        }
      }
      
      console.log(`✅ Response: ${response}`);
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('─'.repeat(60));
  }

  console.log('\n🔍 Checking Platform-Specific Issues:\n');

  // Test Telegram Bot specific patterns
  console.log('📱 Telegram Bot Pattern Testing:');
  const telegramPatterns = [
    "What time is it?",
    "quelle heure est-il?",
    "Cual es el clima actual?",
    "What time is it in Madrid, Spain?",
    "Weather in Montreal, Canada"
  ];

  for (const message of telegramPatterns) {
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
    
    console.log(`  "${message}" → Time: ${isTimeQuestion}, Weather: ${isWeatherQuestion}`);
  }

  console.log('\n🎯 Expected Behavior:');
  console.log('✅ All platforms should detect time/weather questions');
  console.log('✅ All platforms should provide server time when no location specified');
  console.log('✅ All platforms should respond in correct detected language');
  console.log('✅ All platforms should handle location-specific queries properly');
  console.log('✅ All platforms should avoid repetitive AI responses for real-time queries');

  console.log('\n🚀 Platform Real-time Testing Complete!');
}

testAllPlatformsRealtime();
