#!/usr/bin/env node

import { getAIResponse } from './backend/src/ai/localai.js';
import { detectLanguageSimple } from './backend/src/lib/language-detection-simple.js';

// Test messages in different languages
const testMessages = [
  // English
  { message: "What's your background?", language: "en" },
  { message: "Tell me about yourself", language: "en" },
  { message: "Who made you?", language: "en" },
  { message: "Where are you from?", language: "en" },
  
  // Spanish
  { message: "¿Cuál es tu background?", language: "es" },
  { message: "Cuéntame sobre ti", language: "es" },
  { message: "¿Quién te creó?", language: "es" },
  { message: "¿De dónde eres?", language: "es" },
  
  // French
  { message: "Quel est ton background?", language: "fr" },
  { message: "Parle-moi de toi", language: "fr" },
  { message: "Qui t'a créé?", language: "fr" },
  { message: "D'où viens-tu?", language: "fr" },
  
  // German
  { message: "Was ist dein Hintergrund?", language: "de" },
  { message: "Erzähl mir von dir", language: "de" },
  { message: "Wer hat dich erschaffen?", language: "de" },
  { message: "Woher kommst du?", language: "de" },
  
  // Italian
  { message: "Qual è il tuo background?", language: "it" },
  { message: "Parlami di te", language: "it" },
  { message: "Chi ti ha creato?", language: "it" },
  { message: "Da dove vieni?", language: "it" },
  
  // Portuguese
  { message: "Qual é o seu background?", language: "pt" },
  { message: "Fale-me sobre você", language: "pt" },
  { message: "Quem te criou?", language: "pt" },
  { message: "De onde você é?", language: "pt" },
  
  // Korean
  { message: "당신의 배경은 무엇인가요?", language: "ko" },
  { message: "자신에 대해 말해주세요", language: "ko" },
  { message: "누가 당신을 만들었나요?", language: "ko" },
  { message: "어디서 왔나요?", language: "ko" },
  
  // Basque
  { message: "Zein da zure atzealdea?", language: "eu" },
  { message: "Esan iezadazu zure buruari buruz", language: "eu" },
  { message: "Nork sortu zintuen?", language: "eu" },
  { message: "Nongoa zara?", language: "eu" },
  
  // Estonian
  { message: "Mis on sinu taust?", language: "et" },
  { message: "Räägi mulle endast", language: "et" },
  { message: "Kes sind lõi?", language: "et" },
  { message: "Kust sa pärit oled?", language: "et" }
];

// Test text expressions that should be converted to emojis
const textExpressionTests = [
  "*chuckles*",
  "*winks*",
  "*giggles*",
  "*adjusts glasses*",
  "*mysterious*",
  "*sparkles*",
  "*giggles cutely*",
  "*adjusts dark glasses*",
  "*mysterious smile*",
  "*dark and mysterious*"
];

async function testIntegration() {
  console.log('🧪 Testing Vox AI Integrations...\n');
  
  // Test 1: Language Detection
  console.log('📝 Test 1: Language Detection');
  console.log('=' .repeat(50));
  
  for (const test of testMessages.slice(0, 4)) {
    const detected = detectLanguageSimple(test.message);
    const status = detected === test.language ? '✅' : '❌';
    console.log(`${status} "${test.message}" -> Detected: ${detected} (Expected: ${test.language})`);
  }
  
  // Test 2: Background Responses
  console.log('\n📖 Test 2: Background Responses');
  console.log('=' .repeat(50));
  
  const backgroundTests = testMessages.filter(t => 
    t.message.toLowerCase().includes('background') || 
    t.message.toLowerCase().includes('about yourself') ||
    t.message.toLowerCase().includes('about you') ||
    t.message.toLowerCase().includes('tell me about')
  );
  
  for (const test of backgroundTests.slice(0, 3)) {
    try {
      const response = await getAIResponse(test.message, 'test-user', 'test-platform');
      const hasHaapsalu = response.toLowerCase().includes('haapsalu');
      const hasEstonia = response.toLowerCase().includes('estonia');
      const hasVoxHash = response.toLowerCase().includes('voxhash');
      const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(response);
      const hasTextExpressions = /\*[^*]+\*/.test(response);
      
      console.log(`\n${test.language.toUpperCase()}: "${test.message}"`);
      console.log(`Response: ${response.substring(0, 100)}...`);
      console.log(`✅ Has Haapsalu: ${hasHaapsalu}`);
      console.log(`✅ Has Estonia: ${hasEstonia}`);
      console.log(`✅ Has VoxHash: ${hasVoxHash}`);
      console.log(`✅ Has Emojis: ${hasEmojis}`);
      console.log(`❌ Has Text Expressions: ${hasTextExpressions}`);
    } catch (error) {
      console.log(`❌ Error testing "${test.message}": ${error.message}`);
    }
  }
  
  // Test 3: Text Expression Conversion
  console.log('\n😊 Test 3: Text Expression Conversion');
  console.log('=' .repeat(50));
  
  for (const expression of textExpressionTests.slice(0, 5)) {
    try {
      const response = await getAIResponse(`Test message with ${expression}`, 'test-user', 'test-platform');
      const hasTextExpression = /\*[^*]+\*/.test(response);
      const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(response);
      
      console.log(`${hasTextExpression ? '❌' : '✅'} "${expression}" -> Text expressions: ${hasTextExpression}, Emojis: ${hasEmojis}`);
    } catch (error) {
      console.log(`❌ Error testing "${expression}": ${error.message}`);
    }
  }
  
  // Test 4: Creator Questions
  console.log('\n👨‍💻 Test 4: Creator Questions');
  console.log('=' .repeat(50));
  
  const creatorTests = testMessages.filter(t => 
    t.message.toLowerCase().includes('who made') || 
    t.message.toLowerCase().includes('who created') ||
    t.message.toLowerCase().includes('creator') ||
    t.message.toLowerCase().includes('creó') ||
    t.message.toLowerCase().includes('créé') ||
    t.message.toLowerCase().includes('erschaffen') ||
    t.message.toLowerCase().includes('creato') ||
    t.message.toLowerCase().includes('criou') ||
    t.message.toLowerCase().includes('만들었') ||
    t.message.toLowerCase().includes('sortu') ||
    t.message.toLowerCase().includes('lõi')
  );
  
  for (const test of creatorTests.slice(0, 3)) {
    try {
      const response = await getAIResponse(test.message, 'test-user', 'test-platform');
      const hasVoxHash = response.toLowerCase().includes('voxhash');
      const hasCreator = response.toLowerCase().includes('creator') || response.toLowerCase().includes('creó') || response.toLowerCase().includes('créé');
      const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(response);
      
      console.log(`\n${test.language.toUpperCase()}: "${test.message}"`);
      console.log(`Response: ${response.substring(0, 100)}...`);
      console.log(`✅ Has VoxHash: ${hasVoxHash}`);
      console.log(`✅ Has Creator: ${hasCreator}`);
      console.log(`✅ Has Emojis: ${hasEmojis}`);
    } catch (error) {
      console.log(`❌ Error testing "${test.message}": ${error.message}`);
    }
  }
  
  console.log('\n🎉 Integration testing completed!');
  console.log('\n📋 Summary:');
  console.log('- All integrations use the same getAIResponse function');
  console.log('- Emoji conversion should work across all platforms');
  console.log('- Background responses should include Haapsalu, Estonia');
  console.log('- Creator responses should mention VoxHash');
  console.log('- Multilingual support should work in all 9 languages');
}

// Run the test
testIntegration().catch(console.error);
