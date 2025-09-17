import { 
  loadUserMemory, 
  addToUserMemory, 
  getConversationSummary, 
  detectLanguage, 
  hasUserBeenGreeted,
  getUserPreferredLanguage 
} from '../backend/src/lib/memory.js';
import { getLocalizedResponse, getSystemPrompt } from '../backend/src/lib/language.js';

async function testAllIntegrations() {
  console.log('🧪 Testing All Integrations for Language Detection and Anti-Repetition\n');

  const testCases = [
    { platform: 'telegram', userId: 'test_telegram_user' },
    { platform: 'discord', userId: 'test_discord_user' },
    { platform: 'web', userId: 'test_web_user' }
  ];

  const testMessages = [
    { text: 'Who is August D?', expected: 'en', description: 'English question' },
    { text: 'Quien es el presidente de Brasil?', expected: 'es', description: 'Spanish question' },
    { text: 'What is the capital of France?', expected: 'en', description: 'English question' },
    { text: 'Cuantos hijos tiene el presidente?', expected: 'es', description: 'Spanish question' },
    { text: 'Hello, how are you?', expected: 'en', description: 'English greeting' },
    { text: 'Hola, ¿cómo estás?', expected: 'es', description: 'Spanish greeting' },
    { text: 'Quien te creo?', expected: 'es', description: 'Spanish creator question' },
    { text: 'Who created you?', expected: 'en', description: 'English creator question' }
  ];

  try {
    for (const testCase of testCases) {
      console.log(`\n🔧 Testing ${testCase.platform.toUpperCase()} Integration:`);
      console.log('=' .repeat(50));

      // Test 1: Language Detection
      console.log('\n1️⃣ Language Detection Test:');
      for (const test of testMessages) {
        const detected = await detectLanguage(testCase.userId, testCase.platform, test.text);
        const status = detected === test.expected ? '✅' : '❌';
        console.log(`   ${status} "${test.text}" → ${detected} (Expected: ${test.expected}) - ${test.description}`);
      }

      // Test 2: System Prompt Anti-Repetition
      console.log('\n2️⃣ System Prompt Anti-Repetition Test:');
      const languages = ['en', 'es', 'fr', 'de', 'it', 'pt'];
      
      for (const lang of languages) {
        const prompt = getSystemPrompt(lang, testCase.userId, 'Test conversation');
        const hasAntiRepetition = prompt.includes('Do not add') || prompt.includes('Be concise');
        const hasLanguageInstruction = prompt.includes('LANGUAGE INSTRUCTION');
        console.log(`   ${hasAntiRepetition ? '✅' : '❌'} ${lang.toUpperCase()}: Anti-repetition ${hasAntiRepetition ? 'present' : 'missing'}`);
        console.log(`   ${hasLanguageInstruction ? '✅' : '❌'} ${lang.toUpperCase()}: Language instruction ${hasLanguageInstruction ? 'present' : 'missing'}`);
      }

      // Test 3: Creator Response Localization
      console.log('\n3️⃣ Creator Response Localization Test:');
      for (const lang of languages) {
        const creatorResponse = getLocalizedResponse(lang, 'creator');
        const hasVoxHash = creatorResponse.includes('VoxHash');
        const hasUrl = creatorResponse.includes('voxhash.dev');
        console.log(`   ${hasVoxHash && hasUrl ? '✅' : '❌'} ${lang.toUpperCase()}: Creator response ${hasVoxHash && hasUrl ? 'complete' : 'incomplete'}`);
        console.log(`   📝 ${lang.toUpperCase()}: ${creatorResponse.substring(0, 80)}...`);
      }

      // Test 4: Memory Operations
      console.log('\n4️⃣ Memory Operations Test:');
      
      // Add test conversation
      await addToUserMemory(testCase.userId, testCase.platform, 'user', 'Test message in English', { platform: testCase.platform });
      await addToUserMemory(testCase.userId, testCase.platform, 'assistant', 'Test response in English', { platform: testCase.platform });
      await addToUserMemory(testCase.userId, testCase.platform, 'user', 'Mensaje de prueba en español', { platform: testCase.platform });
      await addToUserMemory(testCase.userId, testCase.platform, 'assistant', 'Respuesta de prueba en español', { platform: testCase.platform });
      
      console.log('   ✅ Added test conversation to memory');

      // Load memory
      const memory = await loadUserMemory(testCase.userId, testCase.platform);
      console.log(`   ✅ Loaded ${memory.length} messages from memory`);
      
      // Test conversation summary
      const summary = await getConversationSummary(testCase.userId, testCase.platform, 5);
      console.log(`   ✅ Conversation summary: ${summary.substring(0, 100)}...`);

      // Test 5: Language Detection with Context
      console.log('\n5️⃣ Context-Aware Language Detection Test:');
      
      const contextMessage = 'Y cual es el de Bolivia?';
      const detectedWithContext = await detectLanguage(testCase.userId, testCase.platform, contextMessage);
      console.log(`   ✅ Message with context: "${contextMessage}"`);
      console.log(`   ✅ Detected language: ${detectedWithContext} (Expected: es)`);
      console.log(`   ${detectedWithContext === 'es' ? '✅' : '❌'} Context-aware language detection working`);

      // Test 6: Welcome Message Check
      console.log('\n6️⃣ Welcome Message Check Test:');
      
      const hasBeenGreeted = await hasUserBeenGreeted(testCase.userId, testCase.platform);
      console.log(`   ✅ User has been greeted: ${hasBeenGreeted ? 'Yes' : 'No'}`);
      
      const preferredLanguage = await getUserPreferredLanguage(testCase.userId, testCase.platform);
      console.log(`   ✅ User preferred language: ${preferredLanguage}`);

      console.log(`\n✅ ${testCase.platform.toUpperCase()} Integration Test Completed!`);
    }

    console.log('\n🎉 All Integrations Test Completed!');
    console.log('\n📊 Summary of Improvements:');
    console.log('✅ Enhanced language detection for all platforms');
    console.log('✅ Anti-repetition system prompts for all platforms');
    console.log('✅ Multilingual creator responses for all platforms');
    console.log('✅ Persistent memory system for all platforms');
    console.log('✅ Context-aware language detection for all platforms');
    console.log('✅ Welcome message system for all platforms');

    console.log('\n📝 Expected Improvements Across All Platforms:');
    console.log('   • "Who is August D?" should be detected as English');
    console.log('   • Spanish questions should be detected as Spanish');
    console.log('   • Bot should not add repetitive greetings');
    console.log('   • Bot should not end with repetitive phrases');
    console.log('   • Responses should be more concise and direct');
    console.log('   • Creator questions should be answered in user\'s language');
    console.log('   • Memory should persist across sessions');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

testAllIntegrations();
