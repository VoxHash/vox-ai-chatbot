# 🤖 Vox AI Chatbot v0.0.2

> **Meet Vox** - A female nerdy AI assistant with goth tendencies and kawaii appearance, created by VoxHash. She's your intelligent companion across Discord, Telegram, and WhatsApp platforms.

[![Version](https://img.shields.io/badge/version-0.0.2-blue.svg)](https://github.com/voxhash/vox-ai-chatbot)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://docker.com/)

## ✨ Features

### 🧠 **Intelligent AI**
- **Multi-Model Support**: OpenAI GPT, LocalAI, and custom GGUF models
- **Conversation Memory**: Persistent context across sessions
- **Multilingual Support**: English, Spanish, French, German, Italian, Portuguese
- **Emotion Detection**: Responds with appropriate reactions and tone

### 🌍 **Real-Time Features**
- **Time Queries**: Get current time for any location worldwide
- **Weather Information**: Real-time weather data for any city
- **Location Detection**: Smart parsing of location names in multiple languages

### 📱 **Multi-Platform Support**
- **Discord Bot**: Full slash commands, threads, reactions, and nickname management
- **Telegram Bot**: Group and DM support with inline keyboards
- **WhatsApp Bot**: QR-based authentication with Baileys integration

### 🎭 **Vox's Personality**
- **Female AI Character**: Nerdy, goth, and kawaii personality
- **Creator**: VoxHash (her father)
- **Birthday**: February 23, 2024 at 1:18 PM
- **Tone**: Intelligent, friendly, with a touch of dark humor
- **Responses**: Contextual and emotionally aware

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/VoxHash/vox-ai-chatbot.git
cd vox-ai-chatbot
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Environment setup**
```bash
cp env.template .env
# Edit .env with your configuration
```

4. **Start services**
```bash
# Docker Compose (Recommended)
docker-compose up -d

# Or manual start
npm run start:all
```

5. **Access the application**
- **Web Interface**: http://localhost:8080
- **Backend API**: http://localhost:4000
- **Default Login**: `test@example.com` / `Passw0rd!`

## 📚 Documentation

- **[Complete Setup Guide](SETUP.md)** - Detailed installation and configuration
- **[Development Roadmap](ROADMAP.md)** - Future features and development phases
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to Vox
- **[Changelog](CHANGELOG.md)** - Version history and updates

## 🤖 Bot Setup

### Discord Bot
1. Create application at [Discord Developer Portal](https://discord.com/developers/applications)
2. Enable required intents and permissions
3. Add bot token to `.env`
4. Start: `npm run start:discord`

### Telegram Bot
1. Create bot with [@BotFather](https://t.me/botfather)
2. Add bot token to `.env`
3. Start: `npm run start:telegram`

### WhatsApp Bot
1. No token needed - uses QR authentication
2. Start: `npm run start:whatsapp`
3. Scan QR code with WhatsApp mobile app

## 📱 Usage Examples

### Discord
```
/chat Hello Vox!
/help
```

### Telegram
```
@vox What time is it in Tokyo?
@vox What's the weather in Madrid?
```

### WhatsApp
```
What time is it in New York?
¿Qué hora es en Barcelona?
What's the weather in London?
```

## 🎯 Bot Features

### Discord Bot Features
- ✅ Slash commands (`/chat message:`)
- ✅ DM and server channel support
- ✅ Thread creation with user confirmation
- ✅ Emotion-based reactions
- ✅ Personalized responses to reactions
- ✅ Nickname changing assistance
- ✅ Welcome messages for new members
- ✅ Conversation memory
- ✅ Multilingual support

### Telegram Bot Features
- ✅ Direct message support
- ✅ Group message support (with mentions)
- ✅ Emotion-based reactions
- ✅ Personalized responses to reactions
- ✅ Welcome messages for new members
- ✅ Conversation memory
- ✅ Inline keyboard reactions
- ✅ Multilingual support

### WhatsApp Bot Features
- ✅ Direct message support
- ✅ Group message support (with mentions)
- ✅ Emotion-based reactions
- ✅ Personalized responses to reactions
- ✅ Welcome messages for new members
- ✅ Conversation memory
- ✅ QR code authentication
- ✅ Multilingual support

## 🧪 Testing

### Test All Integrations
```bash
cd backend
npm run test:integration
```

### Test Specific Features
```bash
# Test location detection
node scripts/test-location-detection.js

# Test fallback responses
node scripts/test-fallback-responses.js

# Test multilingual support
node scripts/test-multilingual.js
```

## 🔧 Troubleshooting

### Common Issues

**Bot not responding:**
- Check if bot token is correct
- Verify intents are enabled (Discord)
- Check logs: `tail -f logs/discord.log`

**WhatsApp QR not working:**
- Delete auth files: `rm -rf backend/auth_info_*`
- Restart bot: `npm run start:whatsapp`

**Database connection failed:**
- Start PostgreSQL: `docker-compose up -d postgres`
- Check DATABASE_URL in `.env`

**AI responses not working:**
- Verify OPENAI_API_KEY or LOCALAI_URL
- Check model name in configuration

### Logs Location
- Discord: `logs/discord.log`
- Telegram: `logs/telegram.log`  
- WhatsApp: `logs/whatsapp.log`

## 🎯 Next Steps

1. **Customize Vox's personality** in `backend/src/lib/language.js`
2. **Add custom commands** in respective bot files
3. **Deploy to production** using Docker
4. **Monitor logs** for any issues
5. **Join the community** and contribute!

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/VoxHash/vox-ai-chatbot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/VoxHash/vox-ai-chatbot/discussions)
- **Setup Guide**: [SETUP.md](SETUP.md) for detailed instructions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by VoxHash for the AI community**

*Vox is ready to help you get started!* *giggles cutely* 🤖✨