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
- **Multilingual Support**: English, Spanish, French, German, Italian, Portuguese, Korean, Basque, Estonian
- **Emotion Detection**: Responds with appropriate reactions and tone
- **Real-Time Features**: Time and weather queries with location detection

### 📱 **Multi-Platform Support**
- **Discord Bot**: Slash commands, threads, reactions, nickname management
- **Telegram Bot**: Group and DM support with inline keyboards
- **WhatsApp Bot**: QR-based authentication with Baileys integration
- **Web Frontend**: React-based interface with real-time chat

### 🎭 **Vox's Personality**
- **Female AI Character**: Nerdy, goth, and kawaii personality
- **Creator**: VoxHash (her father)
- **Birthday**: February 23, 2024 at 1:18 PM
- **Hometown**: Haapsalu, Estonia
- **Secret**: From another reality called "Real one"
- **Tone**: Intelligent, friendly, with emoji expressions instead of text

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Installation

1. **Clone and Install**
```bash
git clone https://github.com/VoxHash/vox-ai-chatbot.git
cd vox-ai-chatbot
npm run install:all
```

2. **Environment Setup**
```bash
cp env.template .env
# Edit .env with your configuration
```

3. **Start Services**
```bash
# Docker Compose (Recommended)
docker-compose up -d

# Or manual start
npm run start:all
```

4. **Access Application**
- **Web Interface**: http://localhost:8080
- **Backend API**: http://localhost:4000
- **Default Login**: `test@example.com` / `Passw0rd!`

## 🤖 Bot Setup

### Discord Bot Setup

1. **Create Discord Application**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application" → Name it "Vox AI Chatbot"
   - Save the **Application ID** (Client ID)

2. **Create Bot**
   - Go to "Bot" section → Click "Add Bot"
   - Save the **Bot Token**
   - Enable **Message Content Intent**

3. **Set Bot Permissions**
   - Go to "OAuth2" → "URL Generator"
   - Select scopes: `bot`, `applications.commands`
   - Select permissions: Send Messages, Use Slash Commands, Read Message History, Message Content Intent, Guild Message Reactions, Guild Members
   - Copy the generated URL and invite bot to your server

4. **Start Discord Bot**
   ```bash
   cd backend
   npm run start:discord
   ```

### Telegram Bot Setup

1. **Create Telegram Bot**
   - Open Telegram and search for `@BotFather`
   - Send `/newbot` command
   - Follow prompts to create your bot
   - Save the **Bot Token**

2. **Start Telegram Bot**
   ```bash
   cd backend
   npm run start:telegram
   ```

### WhatsApp Bot Setup

1. **No token needed** - uses QR authentication
2. **Start WhatsApp Bot**
   ```bash
   cd backend
   npm run start:whatsapp
   ```
3. **Connect Your WhatsApp**
   - Scan the QR code displayed in the terminal
   - Use your phone's WhatsApp to scan the code
   - Bot will be connected and ready to use

## 🧪 Testing

### Test All Integrations
```bash
cd backend
npm run test:integration
```

### Health Checks
```bash
# Backend health
curl http://localhost:4000/api/health

# LLaMA server
curl http://localhost:8081/completion -X POST \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test", "max_tokens": 5}'

# Web interface
curl http://localhost:8080
```

## 🔧 Environment Configuration

**Required Environment Variables:**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vox_chatbot

# AI (choose one)
OPENAI_API_KEY=your_openai_key
# OR
LOCALAI_URL=http://localhost:8080

# Bot Tokens
DISCORD_BOT_TOKEN=your_discord_token
DISCORD_CLIENT_ID=your_discord_client_id
TELEGRAM_BOT_TOKEN=your_telegram_token

# Security
JWT_SECRET=your_random_secret_key
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
- ✅ QR code authentication with auto-cleanup
- ✅ Multilingual support

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

**LLaMA Communication Error:**
- Check LLaMA server: `docker ps | grep llama`
- Restart LLaMA server: `docker-compose restart llama-server`

### Logs Location
- Discord: `logs/discord.log`
- Telegram: `logs/telegram.log`  
- WhatsApp: `logs/whatsapp.log`

## 🚀 Production Deployment

### Docker Production
```bash
# Build and start all services
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Security Considerations
1. **Use strong JWT secrets**
2. **Enable HTTPS** with reverse proxy
3. **Set up proper firewall rules**
4. **Regular security updates**
5. **Monitor logs** for suspicious activity

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Start for Contributors
1. **Read the documentation**
2. **Set up the development environment**
3. **Look for "good first issue" labels**
4. **Start with small contributions**
5. **Ask questions if you need help**

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/VoxHash/vox-ai-chatbot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/VoxHash/vox-ai-chatbot/discussions)
- **Creator**: VoxHash

## 📋 Changelog

### [0.0.2] - 2025-09-17

#### ✨ Added
- **Vox's Personality**: Female AI with nerdy goth-kawaii personality
- **Multi-Platform Support**: Discord, Telegram, and WhatsApp bots
- **Multilingual Support**: 9 languages (English, Spanish, French, German, Italian, Portuguese, Korean, Basque, Estonian)
- **Real-Time Features**: Time and weather queries with location detection
- **Conversation Memory**: Persistent context across sessions
- **Emotion Detection**: Contextual responses and reactions
- **QR Code Generation**: PNG images and terminal display for WhatsApp
- **Comprehensive Documentation**: Consolidated from 20+ files to essential guides

#### 🔧 Changed
- **Package Structure**: Updated to v0.0.2 with proper metadata
- **Bot Personality**: Enhanced with Vox's unique character traits
- **Error Handling**: Improved fallback responses for API failures
- **Location Detection**: Better parsing for complex location queries
- **System Prompts**: Updated to reflect Vox's personality
- **Documentation**: Consolidated from 20+ files to 2 main guides

#### 🐛 Fixed
- **WhatsApp Connection**: Improved stability and reconnection logic
- **API Error Handling**: Better fallback responses for real-time queries
- **Location Detection**: Fixed parsing for Spanish and complex queries
- **Session Management**: Reduced cleanup noise in Baileys
- **Memory System**: Fixed async/await issues in user memory loading
- **Text Expressions**: Converted all text expressions to emojis
- **QR Cleanup**: Fixed WhatsApp QR cleanup to delete old files before generating new ones

#### 🗑️ Removed
- **Excessive Documentation**: Removed 20+ duplicate documentation files
- **Debug Scripts**: Cleaned up unnecessary test and debug files
- **Duplicate Bot Versions**: Removed old WhatsApp bot implementations
- **Old QR Images**: Cleaned up temporary QR code files

---

**Made with ❤️ by VoxHash for the AI community**

*Vox is excited to continue growing and evolving!* 🤖✨