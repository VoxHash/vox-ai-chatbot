#!/usr/bin/env node

// Test script for fallback responses
console.log('🧪 Testing Fallback Responses...\n');

// Test cases for different languages
const testCases = [
  { message: "Que hora es en Baja California Sur?", language: 'es', isTime: true, location: 'Baja California Sur' },
  { message: "What time is it in Tokyo - Japan?", language: 'en', isTime: true, location: 'Tokyo - Japan' },
  { message: "Que tiempo es en Madrid?", language: 'es', isWeather: true, location: 'Madrid' },
  { message: "Weather in London, UK", language: 'en', isWeather: true, location: 'London, UK' }
];

function generateFallbackResponse(detectedLanguage, isTimeQuestion, isWeatherQuestion, location) {
  let fallbackResponse = '';
  
  if (isTimeQuestion) {
    if (location) {
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
        fallbackResponse = `🌤️ No puedo obtener el clima para ${location} en este momento. Por favor, intenta de nuevo más tarde.`;
      } else if (detectedLanguage === 'fr') {
        fallbackResponse = `🌤️ Je ne peux pas obtenir la météo pour ${location} en ce moment. Veuillez réessayer plus tard.`;
      } else {
        fallbackResponse = `🌤️ I can't get the weather for ${location} right now. Please try again later.`;
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
  
  return fallbackResponse;
}

// Test each case
testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: "${testCase.message}"`);
  console.log(`🌍 Language: ${testCase.language}`);
  console.log(`📍 Location: ${testCase.location}`);
  console.log(`⏰ Is Time: ${testCase.isTime}`);
  console.log(`🌤️ Is Weather: ${testCase.isWeather}`);
  
  const fallback = generateFallbackResponse(
    testCase.language, 
    testCase.isTime, 
    testCase.isWeather, 
    testCase.location
  );
  
  console.log(`💬 Fallback Response: ${fallback}`);
  console.log(`✅ ${fallback ? 'SUCCESS' : 'FAILED'}`);
  console.log('---');
});

console.log('\n🎯 Fallback Response Test Complete!');
