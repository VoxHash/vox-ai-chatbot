# Vox AI Chatbot - Testing Guide

This document provides comprehensive information about testing the Vox AI Chatbot's multi-platform integrations.

## 🧪 Test Overview

The Vox AI Chatbot includes comprehensive tests for all three platform integrations:
- **Telegram Bot** - Webhook handling and message processing
- **Slack Bot** - Event handling and signature verification  
- **Discord Bot** - Interaction handling and slash commands
- **Cross-Platform** - Multi-platform message flow and concurrent handling

## 📁 Test Structure

```
backend/src/tests/
├── integrations/
│   ├── telegram.test.js      # Telegram bot tests
│   ├── slack.test.js         # Slack bot tests
│   ├── discord.test.js       # Discord bot tests
│   └── integration.test.js   # Cross-platform tests
└── jwt.test.js              # JWT authentication tests

scripts/
└── test-bots.js             # Test runner script
```

## 🚀 Running Tests

### Prerequisites

1. Install dependencies:
```bash
cd backend
npm install
```

2. Set up environment variables (create `.env` file):
```bash
# Database
DATABASE_URL=postgresql://appuser:applongpass@localhost:5433/chatbot
REDIS_URL=redis://localhost:6380

# JWT Secrets
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Bot Tokens (optional for testing)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
SLACK_BOT_TOKEN=your-slack-bot-token
SLACK_SIGNING_SECRET=your-slack-signing-secret
DISCORD_BOT_TOKEN=your-discord-bot-token
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
DISCORD_PUBLIC_KEY=your-discord-public-key
```

### Running All Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Running Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific platform tests
npm run test:integration -- telegram.test.js
npm run test:integration -- slack.test.js
npm run test:integration -- discord.test.js
npm run test:integration -- integration.test.js
```

### Using the Test Runner Script

```bash
# Run all bot integration tests
node scripts/test-bots.js

# Run specific test
node scripts/test-bots.js telegram
node scripts/test-bots.js slack
node scripts/test-bots.js discord
node scripts/test-bots.js integration
```

## 🔍 Test Categories

### 1. Telegram Bot Tests (`telegram.test.js`)

**Webhook Endpoint Tests:**
- ✅ Handle incoming messages
- ✅ Handle messages without text
- ✅ Handle empty payloads
- ✅ Extract chat ID from messages

**Message Processing Tests:**
- ✅ Process different message types
- ✅ Handle environment configuration
- ✅ Simulate conversation flows
- ✅ Handle multiple chat sessions

**Test Scenarios:**
- Regular text messages
- Messages with emojis and special characters
- Empty messages
- Long messages
- Multiple concurrent chat sessions

### 2. Slack Bot Tests (`slack.test.js`)

**Events Endpoint Tests:**
- ✅ Handle URL verification challenges
- ✅ Process app mention events
- ✅ Process direct message events
- ✅ Handle unknown event types

**Signature Verification Tests:**
- ✅ Verify valid Slack signatures
- ✅ Handle signature verification logic
- ✅ Process different message formats

**Test Scenarios:**
- Team conversations with mentions
- Direct messages
- High-frequency events
- Signature verification edge cases

### 3. Discord Bot Tests (`discord.test.js`)

**Interactions Endpoint Tests:**
- ✅ Handle PING interactions (PONG response)
- ✅ Process slash commands
- ✅ Handle message component interactions
- ✅ Process unknown interaction types

**Health Check Tests:**
- ✅ Return health status
- ✅ Check configuration status

**Test Scenarios:**
- Slash command interactions
- Button and component interactions
- Server-wide interactions
- Rapid interaction handling

### 4. Cross-Platform Integration Tests (`integration.test.js`)

**Multi-Platform Tests:**
- ✅ Handle messages from all platforms simultaneously
- ✅ Process high-volume concurrent messages
- ✅ Test platform-specific features
- ✅ Handle error scenarios gracefully

**Performance Tests:**
- ✅ Rapid message bursts
- ✅ Concurrent processing
- ✅ Error handling under load

## 📊 Test Coverage

The test suite provides comprehensive coverage for:

- **Message Processing**: All message types and formats
- **Error Handling**: Malformed requests and edge cases
- **Performance**: High-volume and concurrent scenarios
- **Security**: Signature verification and authentication
- **Integration**: Cross-platform message flow

## 🐛 Debugging Tests

### Common Issues

1. **Port Conflicts**: Tests use ports 4001-4003, ensure they're available
2. **Environment Variables**: Make sure all required env vars are set
3. **Dependencies**: Run `npm install` in the backend directory

### Debug Mode

```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test with debug info
npm run test:integration -- telegram.test.js --verbose
```

### Test Logs

Tests include console.log statements for debugging:
- Message processing logs
- API call simulations
- Error details
- Performance metrics

## 🔧 Customizing Tests

### Adding New Test Cases

1. Create test file in `backend/src/tests/integrations/`
2. Follow existing patterns for setup/teardown
3. Add to test runner script if needed
4. Update this documentation

### Mock Data

Tests use mock data for:
- Bot tokens and API keys
- Message payloads
- User information
- Channel/chat IDs

### Environment Variables

Tests work with or without real bot tokens:
- With tokens: Full integration testing
- Without tokens: Mock testing only

## 📈 Continuous Integration

The test suite is designed for CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Bot Integration Tests
  run: |
    cd backend
    npm install
    npm run test:integration
```

## 🎯 Test Results

Expected test results:
- ✅ All tests should pass
- ✅ No memory leaks
- ✅ Fast execution (< 30 seconds)
- ✅ High coverage (> 90%)

## 📝 Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Add integration tests for new platforms
4. Update this documentation

## 🆘 Support

For test-related issues:
1. Check the test logs
2. Verify environment setup
3. Review test documentation
4. Check GitHub issues

---

**Happy Testing! 🚀**
