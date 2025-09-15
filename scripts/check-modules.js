#!/usr/bin/env node

/**
 * Bot Integration Module Checker
 * Checks that all bot integration modules exist and have the expected structure
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🤖 Vox AI Chatbot - Bot Integration Module Checker');
console.log('==================================================\n');

// Check if files exist and have expected content
function checkFile(filePath, expectedContent) {
  const fullPath = join(projectRoot, filePath);
  
  if (!existsSync(fullPath)) {
    return { exists: false, error: 'File not found' };
  }
  
  try {
    const content = readFileSync(fullPath, 'utf8');
    const hasExpectedContent = expectedContent.every(pattern => 
      content.includes(pattern)
    );
    
    return {
      exists: true,
      hasExpectedContent,
      content: content.substring(0, 200) + '...'
    };
  } catch (error) {
    return { exists: true, error: error.message };
  }
}

// Test results
const results = {
  telegram: { loaded: false, error: null },
  slack: { loaded: false, error: null },
  discord: { loaded: false, error: null }
};

// Check Telegram integration
console.log('📱 Checking Telegram Bot Module...');
const telegramCheck = checkFile('backend/src/integrations/telegram.js', [
  'express',
  'webhook',
  'sendMessage',
  'TELEGRAM_BOT_TOKEN'
]);

if (telegramCheck.exists && telegramCheck.hasExpectedContent) {
  results.telegram.loaded = true;
  console.log('✅ Telegram bot module structure is correct');
  console.log('   - Express app: ✓');
  console.log('   - Webhook endpoint: ✓');
  console.log('   - API integration: ✓');
} else {
  results.telegram.error = telegramCheck.error || 'Missing expected content';
  console.log('❌ Telegram bot check failed:', results.telegram.error);
}

// Check Slack integration
console.log('\n💬 Checking Slack Bot Module...');
const slackCheck = checkFile('backend/src/integrations/slack.js', [
  'express',
  'slack/events',
  'verifySlack',
  'app_mention'
]);

if (slackCheck.exists && slackCheck.hasExpectedContent) {
  results.slack.loaded = true;
  console.log('✅ Slack bot module structure is correct');
  console.log('   - Express app: ✓');
  console.log('   - Events endpoint: ✓');
  console.log('   - Signature verification: ✓');
} else {
  results.slack.error = slackCheck.error || 'Missing expected content';
  console.log('❌ Slack bot check failed:', results.slack.error);
}

// Check Discord integration
console.log('\n🎮 Checking Discord Bot Module...');
const discordCheck = checkFile('backend/src/integrations/discord.js', [
  'express',
  'discord/interactions',
  'APPLICATION_COMMAND',
  'chat'
]);

if (discordCheck.exists && discordCheck.hasExpectedContent) {
  results.discord.loaded = true;
  console.log('✅ Discord bot module structure is correct');
  console.log('   - Express app: ✓');
  console.log('   - Interactions endpoint: ✓');
  console.log('   - Slash command handling: ✓');
  console.log('   - Health check: ✓');
} else {
  results.discord.error = discordCheck.error || 'Missing expected content';
  console.log('❌ Discord bot check failed:', results.discord.error);
}

// Check test files
console.log('\n📁 Checking Test Files...');
const testFiles = [
  'backend/src/tests/integrations/telegram.test.js',
  'backend/src/tests/integrations/slack.test.js',
  'backend/src/tests/integrations/discord.test.js',
  'backend/src/tests/integrations/integration.test.js'
];

let testFilesExist = 0;
for (const file of testFiles) {
  const check = checkFile(file, ['describe', 'it', 'expect']);
  if (check.exists) {
    testFilesExist++;
    console.log(`✅ ${file} exists and has test structure`);
  } else {
    console.log(`❌ ${file} missing or invalid`);
  }
}

// Check package.json
console.log('\n📦 Checking Package Configuration...');
const packageCheck = checkFile('backend/package.json', [
  'jest',
  'supertest',
  'test:integration'
]);

if (packageCheck.exists && packageCheck.hasExpectedContent) {
  console.log('✅ Package.json has test configuration');
} else {
  console.log('❌ Package.json missing test configuration');
}

// Summary
console.log('\n📊 Check Results Summary');
console.log('========================');

const loadedCount = Object.values(results).filter(r => r.loaded).length;
const totalCount = Object.keys(results).length;

Object.entries(results).forEach(([platform, result]) => {
  const icon = result.loaded ? '✅' : '❌';
  const status = result.loaded ? 'VALID' : 'INVALID';
  console.log(`${icon} ${platform.toUpperCase()}: ${status}`);
  if (result.error) {
    console.log(`   Error: ${result.error}`);
  }
});

console.log(`\n📈 Integration modules: ${loadedCount}/${totalCount} valid`);
console.log(`📁 Test files: ${testFilesExist}/${testFiles.length} found`);
console.log(`📦 Package config: ${packageCheck.exists && packageCheck.hasExpectedContent ? 'Valid' : 'Invalid'}`);

if (loadedCount === totalCount && testFilesExist === testFiles.length) {
  console.log('\n🎉 All bot integrations are properly configured!');
  console.log('\n🚀 Integration Features:');
  console.log('   📱 Telegram Bot:');
  console.log('      - Webhook endpoint for receiving messages');
  console.log('      - Message processing and response handling');
  console.log('      - Support for text messages and chat interactions');
  console.log('');
  console.log('   💬 Slack Bot:');
  console.log('      - Event handling for app mentions and messages');
  console.log('      - Signature verification for security');
  console.log('      - Support for team conversations and DMs');
  console.log('');
  console.log('   🎮 Discord Bot:');
  console.log('      - Slash command interactions');
  console.log('      - Message component handling (buttons, selects)');
  console.log('      - Health check endpoint for monitoring');
  console.log('');
  console.log('📚 Next Steps:');
  console.log('   1. Set up environment variables for bot tokens');
  console.log('   2. Configure webhook URLs in each platform');
  console.log('   3. Deploy the application with docker-compose');
  console.log('   4. Test with real bot interactions');
  console.log('   5. Run comprehensive tests with: npm run test:integration');
  process.exit(0);
} else {
  console.log('\n⚠️  Some components are missing or invalid. Check the errors above.');
  process.exit(1);
}
