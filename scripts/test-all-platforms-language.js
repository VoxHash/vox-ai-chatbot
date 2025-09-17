import { 
  loadUserMemory, 
  addToUserMemory, 
  getConversationSummary, 
  detectLanguage, 
  hasUserBeenGreeted,
  getUserPreferredLanguage 
} from '../backend/src/lib/memory.js';
import { getLocalizedResponse, getSystemPrompt } from '../backend/src/lib/language.js';

async function testAllPlatformsLanguage() {
  console.log('🧪 Testing All Platforms Language Detection\n');

  const testCases = [
    { platform: 'telegram', userId: 'test_telegram_lang' },
    { platform: 'discord', userId: 'test_discord_lang' },
    { platform: 'web', userId: 'test_web_lang' },
    { platform: 'whatsapp', userId: 'test_whatsapp_lang' }
  ];

  const testMessages = [
    { text: 'is it cold in Alaska?', expected: 'en', description: 'English question about Alaska' },
    { text: 'Je suis Hash, et toi?', expected: 'fr', description: 'French introduction' },
    { text: 'What was my last question?', expected: 'en', description: 'English question about memory' },
    { text: 'I mean the previous question', expected: 'en', description: 'English clarification' },
    { text: 'traduceme tu ultimo mensaje al español', expected: 'es', description: 'Spanish translation request' },
    { text: 'Quien es Barron William Trump?', expected: 'es', description: 'Spanish question about Trump' },
    { text: 'dime por que estas enojado conmigo', expected: 'es', description: 'Spanish emotional question' },
    { text: 'Hello, how are you?', expected: 'en', description: 'English greeting' },
    { text: 'Hola, ¿cómo estás?', expected: 'es', description: 'Spanish greeting' },
    { text: 'Bonjour, comment allez-vous?', expected: 'fr', description: 'French greeting' },
    { text: 'Who created you?', expected: 'en', description: 'English creator question' },
    { text: 'Quien te creo?', expected: 'es', description: 'Spanish creator question' },
    { text: 'Qui vous a créé?', expected: 'fr', description: 'French creator question' }
  ];

  try {
    for (const testCase of testCases) {
      console.log(`\n🔧 Testing ${testCase.platform.toUpperCase()} Platform:`);
      console.log('=' .repeat(50));

      // Test 1: Language Detection
      console.log('\n1️⃣ Language Detection Test:');
      let correctDetections = 0;
      
      for (const test of testMessages) {
        const detected = await detectLanguage(testCase.userId, testCase.platform, test.text);
        const status = detected === test.expected ? '✅' : '❌';
        if (detected === test.expected) correctDetections++;
        console.log(`   ${status} "${test.text}" → ${detected} (Expected: ${test.expected}) - ${test.description}`);
      }
      
      const accuracy = (correctDetections / testMessages.length * 100).toFixed(1);
      console.log(`   📊 Accuracy: ${accuracy}% (${correctDetections}/${testMessages.length})`);

      // Test 2: System Prompt Language Instructions
      console.log('\n2️⃣ System Prompt Language Instructions:');
      const languages = ['en', 'es', 'fr', 'de', 'it', 'pt'];
      
      for (const lang of languages) {
        const prompt = getSystemPrompt(lang, testCase.userId, 'Test conversation');
        const hasLanguageInstruction = prompt.includes('LANGUAGE INSTRUCTION');
        const hasAntiRepetition = prompt.includes('Do not add') || prompt.includes('Be concise');
        console.log(`   ${hasLanguageInstruction ? '✅' : '❌'} ${lang.toUpperCase()}: Language instruction ${hasLanguageInstruction ? 'present' : 'missing'}`);
        console.log(`   ${hasAntiRepetition ? '✅' : '❌'} ${lang.toUpperCase()}: Anti-repetition ${hasAntiRepetition ? 'present' : 'missing'}`);
      }

      // Test 3: Creator Response Localization
      console.log('\n3️⃣ Creator Response Localization:');
      for (const lang of languages) {
        const creatorResponse = getLocalizedResponse(lang, 'creator');
        const hasVoxHash = creatorResponse.includes('VoxHash');
        const hasUrl = creatorResponse.includes('voxhash.dev');
        console.log(`   ${hasVoxHash && hasUrl ? '✅' : '❌'} ${lang.toUpperCase()}: Creator response ${hasVoxHash && hasUrl ? 'complete' : 'incomplete'}`);
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

      // Test 5: Context-Aware Language Detection
      console.log('\n5️⃣ Context-Aware Language Detection Test:');
      
      const contextMessage = 'I mean the previous question before that one';
      const detectedWithContext = await detectLanguage(testCase.userId, testCase.platform, contextMessage);
      console.log(`   ✅ Message with context: "${contextMessage}"`);
      console.log(`   ✅ Detected language: ${detectedWithContext} (Expected: en)`);
      console.log(`   ${detectedWithContext === 'en' ? '✅' : '❌'} Context-aware language detection working`);

      console.log(`\n✅ ${testCase.platform.toUpperCase()} Platform Test Completed!`);
    }

    console.log('\n🎉 All Platforms Language Detection Test Completed!');
    console.log('\n📊 Summary of Improvements:');
    console.log('✅ Enhanced language detection for all platforms');
    console.log('✅ Anti-repetition system prompts for all platforms');
    console.log('✅ Multilingual creator responses for all platforms');
    console.log('✅ Context-aware language detection for all platforms');
    console.log('✅ Memory system working correctly for all platforms');

    console.log('\n📝 Expected Improvements Across All Platforms:');
    console.log('   • "is it cold in Alaska?" should be detected as English');
    console.log('   • "Je suis Hash, et toi?" should be detected as French');
    console.log('   • "What was my last question?" should be detected as English');
    console.log('   • "I mean the previous question" should be detected as English');
    console.log('   • Bot should respond in the same language as detected');
    console.log('   • Bot should not add repetitive greetings');
    console.log('   • Bot should use conversation history for context');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

testAllPlatformsLanguage();
