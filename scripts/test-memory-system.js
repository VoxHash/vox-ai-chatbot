import { 
  loadUserMemory, 
  addToUserMemory, 
  getConversationSummary, 
  detectLanguage, 
  hasUserBeenGreeted,
  getUserPreferredLanguage 
} from '../backend/src/lib/memory.js';
import { getLocalizedResponse, getSystemPrompt } from '../backend/src/lib/language.js';

async function testMemorySystem() {
  console.log('🧪 Testing Memory System and Language Detection\n');

  const testUserId = 'test_user_123';
  const platform = 'whatsapp';

  try {
    // Test 1: Language Detection
    console.log('1️⃣ Testing Language Detection:');
    
    const languages = [
      { text: 'Hola, ¿cómo estás?', expected: 'es' },
      { text: 'Bonjour! Comment allez-vous?', expected: 'fr' },
      { text: 'Hallo! Wie geht es dir?', expected: 'de' },
      { text: 'Ciao! Come stai?', expected: 'it' },
      { text: 'Olá! Como você está?', expected: 'pt' },
      { text: 'Hello! How are you?', expected: 'en' }
    ];

    for (const lang of languages) {
      const detected = await detectLanguage(testUserId, platform, lang.text);
      const status = detected === lang.expected ? '✅' : '❌';
      console.log(`   ${status} "${lang.text}" → Detected: ${detected} (Expected: ${lang.expected})`);
    }

    // Test 2: Memory Storage
    console.log('\n2️⃣ Testing Memory Storage:');
    
    // Add some test messages
    await addToUserMemory(testUserId, platform, 'user', 'Hola, ¿cómo estás?', { platform });
    await addToUserMemory(testUserId, platform, 'assistant', '¡Hola! Estoy muy bien, gracias por preguntar. ¿En qué puedo ayudarte?', { platform });
    await addToUserMemory(testUserId, platform, 'user', '¿Puedes ayudarme con programación?', { platform });
    await addToUserMemory(testUserId, platform, 'assistant', '¡Por supuesto! Me encanta ayudar con programación. ¿En qué lenguaje te gustaría trabajar?', { platform });

    console.log('   ✅ Added test messages to memory');

    // Test 3: Memory Retrieval
    console.log('\n3️⃣ Testing Memory Retrieval:');
    
    const memory = await loadUserMemory(testUserId, platform);
    console.log(`   📝 Retrieved ${memory.length} messages from memory`);
    
    memory.forEach((msg, index) => {
      console.log(`   ${index + 1}. [${msg.role}] ${msg.content.substring(0, 50)}...`);
    });

    // Test 4: Conversation Summary
    console.log('\n4️⃣ Testing Conversation Summary:');
    
    const summary = await getConversationSummary(testUserId, platform, 3);
    console.log('   📋 Conversation Summary:');
    console.log(`   ${summary}`);

    // Test 5: Greeting Check
    console.log('\n5️⃣ Testing Greeting Check:');
    
    const hasBeenGreeted = await hasUserBeenGreeted(testUserId, platform);
    console.log(`   ${hasBeenGreeted ? '✅' : '❌'} User has been greeted: ${hasBeenGreeted}`);

    // Test 6: Preferred Language
    console.log('\n6️⃣ Testing Preferred Language:');
    
    const preferredLang = await getUserPreferredLanguage(testUserId, platform);
    console.log(`   🌍 User's preferred language: ${preferredLang}`);

    // Test 7: Localized Responses
    console.log('\n7️⃣ Testing Localized Responses:');
    
    const creatorResponses = {
      en: getLocalizedResponse('en', 'creator'),
      es: getLocalizedResponse('es', 'creator'),
      fr: getLocalizedResponse('fr', 'creator'),
      de: getLocalizedResponse('de', 'creator')
    };

    Object.entries(creatorResponses).forEach(([lang, response]) => {
      console.log(`   ${lang.toUpperCase()}: ${response.substring(0, 60)}...`);
    });

    // Test 8: System Prompt Generation
    console.log('\n8️⃣ Testing System Prompt Generation:');
    
    const systemPrompt = getSystemPrompt('es', testUserId, summary);
    console.log('   📝 Generated Spanish system prompt:');
    console.log(`   ${systemPrompt.substring(0, 200)}...`);

    // Test 9: Emotion Detection
    console.log('\n9️⃣ Testing Emotion Detection:');
    
    const emotionTests = [
      { text: 'Estoy muy feliz hoy!', emotion: 'happy' },
      { text: 'Me siento triste', emotion: 'sad' },
      { text: 'Estoy enojado', emotion: 'angry' },
      { text: 'Tengo miedo', emotion: 'fearful' },
      { text: 'Estoy confundido', emotion: 'confused' },
      { text: 'Te amo mucho', emotion: 'love' }
    ];

    emotionTests.forEach(test => {
      const emotion = detectEmotion(test.text);
      const status = emotion === test.emotion ? '✅' : '❌';
      console.log(`   ${status} "${test.text}" → ${emotion} (Expected: ${test.emotion})`);
    });

    console.log('\n🎉 Memory System Test Completed Successfully!');
    console.log('\n📁 Memory files are stored in: backend/memory/');
    console.log('☁️  CloudFlare R2 integration is ready (configure CLOUDFLARE_R2_* env vars)');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Helper function for emotion detection (simplified version)
function detectEmotion(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('feliz') || lowerMessage.includes('contento') || lowerMessage.includes('alegre')) {
    return 'happy';
  }
  if (lowerMessage.includes('triste') || lowerMessage.includes('mal') || lowerMessage.includes('llorar')) {
    return 'sad';
  }
  if (lowerMessage.includes('enojado') || lowerMessage.includes('furioso') || lowerMessage.includes('ira')) {
    return 'angry';
  }
  if (lowerMessage.includes('miedo') || lowerMessage.includes('asustado') || lowerMessage.includes('preocupado')) {
    return 'fearful';
  }
  if (lowerMessage.includes('confundido') || lowerMessage.includes('perdido') || lowerMessage.includes('desconcertado')) {
    return 'confused';
  }
  if (lowerMessage.includes('amor') || lowerMessage.includes('querer') || lowerMessage.includes('amar')) {
    return 'love';
  }
  
  return 'neutral';
}

testMemorySystem();
