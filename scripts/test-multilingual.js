#!/usr/bin/env node

// Test script to demonstrate multilingual capabilities
import { completeChat } from '../backend/src/ai/openai.js';

const testMessages = [
  {
    language: 'Spanish',
    message: 'Hola, ¿cómo estás? ¿Puedes ayudarme con programación en JavaScript?',
    expected: 'Should respond in Spanish'
  },
  {
    language: 'English', 
    message: 'Hello! Can you help me with Python programming?',
    expected: 'Should respond in English'
  },
  {
    language: 'French',
    message: 'Bonjour! Comment allez-vous? Pouvez-vous m\'aider avec React?',
    expected: 'Should respond in French'
  },
  {
    language: 'German',
    message: 'Hallo! Wie geht es dir? Kannst du mir mit Node.js helfen?',
    expected: 'Should respond in German'
  }
];

console.log('🌍 Testing Multilingual Capabilities of Vox AI Chatbot\n');

for (const test of testMessages) {
  console.log(`\n📝 Testing ${test.language}:`);
  console.log(`User: ${test.message}`);
  console.log(`Expected: ${test.expected}`);
  
  try {
    const messages = [
      {
        role: 'system',
        content: 'You are Vox AI, a helpful and intelligent assistant created by VoxHash. You can communicate in multiple languages including English, Spanish, French, German, Italian, Portuguese, and more. Respond in the same language the user writes to you. If they write in Spanish, respond in Spanish. If they write in English, respond in English. Be friendly, informative, and engaging in your responses.'
      },
      {
        role: 'user',
        content: test.message
      }
    ];
    
    const response = await completeChat(messages);
    console.log(`Vox AI: ${response}`);
    console.log('✅ Test completed');
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  console.log('─'.repeat(50));
}

console.log('\n🎉 Multilingual testing completed!');
console.log('💡 The chatbot should respond in the same language as the user.');
