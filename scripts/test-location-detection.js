#!/usr/bin/env node

// Test script for location detection improvements
console.log('🧪 Testing Location Detection Improvements...\n');

// Test cases
const testCases = [
  "What time is it in Tijuana, Mexico? @bot",
  "Que hora es en Tijuana, Mexico? @vox",
  "Que hora es en Monterrey - Mexico y en Valladolid, España!",
  "What time is it in Orlando, Florida?",
  "Hora en Madrid, España",
  "Weather in London, UK",
  "Clima en Barcelona, España"
];

// Location patterns (same as in the bot)
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
  // Pattern 10: Generic location patterns with dashes and commas
  /([A-Za-zÀ-ÿ\s]+(?:-|,)\s*[A-Za-zÀ-ÿ\s]+)/i,
  // Pattern 11: Locations with "y" (and) in Spanish
  /([A-Za-zÀ-ÿ\s]+(?:,|y|and)\s*[A-Za-zÀ-ÿ\s]+)/i
];

function extractLocation(messageText) {
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
  return location;
}

// Test each case
testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: "${testCase}"`);
  const location = extractLocation(testCase);
  console.log(`📍 Detected location: "${location}"`);
  console.log(`✅ ${location ? 'SUCCESS' : 'FAILED'}`);
  console.log('---');
});

console.log('\n🎯 Location Detection Test Complete!');
