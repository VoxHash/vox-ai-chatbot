# 🚀 Vox AI Chatbot - Complete Setup Guide

> **Welcome to Vox!** Your nerdy goth-kawaii AI assistant created by VoxHash! *adjusts dark glasses with excitement*

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Bot Setup](#-bot-setup)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Production Deployment](#-production-deployment)

## 🚀 Quick Start (5 minutes)

### 1. Clone and Install
```bash
git clone https://github.com/VoxHash/vox-ai-chatbot.git
cd vox-ai-chatbot
npm run install:all
```

### 2. Environment Setup
```bash
cp env.template .env
# Edit .env with your configuration
```

### 3. Start Services
```bash
# Docker Compose (Recommended)
docker-compose up -d

# Or manual start
npm run start:all
```

### 4. Access Application
- **Web Interface**: http://localhost:8080
- **Backend API**: http://localhost:4000
- **Default Login**: `test@example.com` / `Passw0rd!`

## 📋 Prerequisites

- **Node.js 18+**
- **Docker & Docker Compose**
- **Git**
- **PostgreSQL** (or use Docker)
- **Redis** (optional, for caching)

## 🔧 Installation

### Environment Configuration

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

### AI Model Configuration

**Option 1: Local LLaMA (Recommended)**
```bash
# Start LLaMA server
docker-compose up -d llama-server

# Available models:
# - vox_legacy.gguf (4GB) - Fast, good for most tasks
# - vox_brain.gguf (12.6GB) - More capable, slower
```

**Option 2: OpenAI API**
```env
OPENAI_API_KEY=your_openai_api_key
AI_PROVIDER=openai
```

**Option 3: Mock Mode (Testing)**
```env
AI_PROVIDER=mock
```

## 🤖 Bot Setup

### Discord Bot Setup

1. **Create Discord Application**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application" → Name it "Vox AI Chatbot"
   - Save the **Application ID** (Client ID)

2. **Create Bot**
   - Go to "Bot" section → Click "Add Bot"
   - Save the **Bot Token**
   - Copy the **Public Key** from "General Information"

3. **Set Bot Permissions**
   - Go to "OAuth2" → "URL Generator"
   - Select scopes: `bot`, `applications.commands`
   - Select permissions:
     - ✅ Send Messages
     - ✅ Use Slash Commands
     - ✅ Read Message History
     - ✅ Message Content Intent
     - ✅ Guild Message Reactions
     - ✅ Guild Members
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

2. **Configure for Groups (Optional)**
   - Add bot to your group
   - Make bot an admin with all permissions

3. **Start Telegram Bot**
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

### Test Specific Features
```bash
# Test location detection
node scripts/test-location-detection.js

# Test fallback responses
node scripts/test-fallback-responses.js

# Test multilingual support
node scripts/test-multilingual.js
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

## 🚀 Production Deployment

### Environment Configuration
```env
# Production .env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db:5432/chatbot
REDIS_URL=redis://redis:6379/0
JWT_ACCESS_SECRET=your-super-secure-secret
JWT_REFRESH_SECRET=your-super-secure-refresh-secret
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-key
```

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

## 🎯 Next Steps

1. **Customize Vox's personality** in `backend/src/lib/language.js`
2. **Add custom commands** in respective bot files
3. **Deploy to production** using Docker
4. **Monitor logs** for any issues
5. **Join the community** and contribute!

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/VoxHash/vox-ai-chatbot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/VoxHash/vox-ai-chatbot/discussions)
- **Documentation**: Check the main README.md
- **Creator**: VoxHash

---

**Vox is ready to help you get started!* *giggles cutely* 🤖✨

*Built with ❤️ by [VoxHash](https://github.com/voxhash)*
