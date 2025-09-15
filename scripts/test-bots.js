#!/usr/bin/env node

/**
 * Vox AI Chatbot - Bot Integration Test Runner
 * 
 * This script tests all three bot integrations (Telegram, Slack, Discord)
 * by simulating real-world usage scenarios.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🤖 Vox AI Chatbot - Bot Integration Test Runner');
console.log('================================================\n');

// Test configuration
const tests = [
  {
    name: 'Telegram Bot Tests',
    command: 'npm',
    args: ['run', 'test:integration', '--', 'telegram.test.js'],
    description: 'Testing Telegram webhook handling and message processing'
  },
  {
    name: 'Slack Bot Tests',
    command: 'npm',
    args: ['run', 'test:integration', '--', 'slack.test.js'],
    description: 'Testing Slack event handling and signature verification'
  },
  {
    name: 'Discord Bot Tests',
    command: 'npm',
    args: ['run', 'test:integration', '--', 'discord.test.js'],
    description: 'Testing Discord interaction handling and slash commands'
  },
  {
    name: 'Cross-Platform Integration Tests',
    command: 'npm',
    args: ['run', 'test:integration', '--', 'integration.test.js'],
    description: 'Testing multi-platform message flow and concurrent handling'
  }
];

// Run a single test
async function runTest(test) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Running: ${test.name}`);
    console.log(`📝 ${test.description}\n`);
    
    const child = spawn(test.command, test.args, {
      cwd: join(projectRoot, 'backend'),
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${test.name} - PASSED\n`);
        resolve({ name: test.name, status: 'passed' });
      } else {
        console.log(`❌ ${test.name} - FAILED (exit code: ${code})\n`);
        resolve({ name: test.name, status: 'failed', code });
      }
    });
    
    child.on('error', (error) => {
      console.log(`💥 ${test.name} - ERROR: ${error.message}\n`);
      resolve({ name: test.name, status: 'error', error: error.message });
    });
  });
}

// Run all tests
async function runAllTests() {
  console.log('Starting bot integration tests...\n');
  
  const results = [];
  
  for (const test of tests) {
    const result = await runTest(test);
    results.push(result);
  }
  
  // Print summary
  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  results.forEach(result => {
    const icon = result.status === 'passed' ? '✅' : 
                 result.status === 'failed' ? '❌' : '💥';
    console.log(`${icon} ${result.name}: ${result.status.toUpperCase()}`);
  });
  
  console.log(`\n📈 Total: ${results.length} tests`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`💥 Errors: ${errors}`);
  
  if (failed > 0 || errors > 0) {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed! Bot integrations are working correctly.');
    process.exit(0);
  }
}

// Run specific test if provided as argument
const testName = process.argv[2];
if (testName) {
  const test = tests.find(t => 
    t.name.toLowerCase().includes(testName.toLowerCase()) ||
    t.name.toLowerCase().includes('integration')
  );
  
  if (test) {
    runTest(test).then(result => {
      if (result.status === 'passed') {
        console.log('🎉 Test completed successfully!');
        process.exit(0);
      } else {
        console.log('❌ Test failed!');
        process.exit(1);
      }
    });
  } else {
    console.log(`❌ Test not found: ${testName}`);
    console.log('Available tests:');
    tests.forEach(t => console.log(`  - ${t.name}`));
    process.exit(1);
  }
} else {
  runAllTests();
}
