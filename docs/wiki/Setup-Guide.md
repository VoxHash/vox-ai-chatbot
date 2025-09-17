# 🚀 Vox AI Chatbot Setup Guide

Welcome to the Vox AI Chatbot setup guide! Let's get Vox up and running on your system. *adjusts dark glasses with excitement*

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** installed
- **Docker & Docker Compose** installed
- **Git** installed
- **PostgreSQL** database (or use Docker)
- **Redis** (optional, for caching)

## 🚀 Quick Setup (5 minutes)

### 1. Clone the Repository
```bash
git clone https://github.com/VoxHash/vox-ai-chatbot.git
cd vox-ai-chatbot
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm run install:all

# Or install individually
cd backend && npm install
cd ../frontend && npm install
```

### 3. Environment Configuration
```bash
# Copy the environment template
cp env.template .env

# Edit with your configuration
nano .env
```

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
TELEGRAM_BOT_TOKEN=your_telegram_token

# Security
JWT_SECRET=your_random_secret_key
```

### 4. Start Services
```bash
# Option 1: Docker Compose (Recommended)
docker-compose up -d

# Option 2: Manual start
npm run start:all
```

## 🤖 Bot Setup

### Discord Bot Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create New Application → Bot
3. Copy Bot Token to `.env`
4. Enable Required Intents:
   - ✅ Guilds
   - ✅ Guild Messages  
   - ✅ Direct Messages
   - ✅ Message Content Intent
   - ✅ Guild Message Reactions
   - ✅ Guild Members
5. Invite bot to server with required permissions
6. Start bot: `npm run start:discord`

### Telegram Bot Setup
1. Message [@BotFather](https://t.me/botfather)
2. Send `/newbot`
3. Follow instructions to create bot
4. Copy token to `.env`
5. Start bot: `npm run start:telegram`

### WhatsApp Bot Setup
1. No token needed - uses QR authentication
2. Start bot: `npm run start:whatsapp`
3. Scan QR code with WhatsApp mobile app
4. Bot is ready to use

## 🧪 Testing Your Setup

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

## 🎯 Next Steps

1. **Customize Vox's personality** in `backend/src/lib/language.js`
2. **Add custom commands** in respective bot files
3. **Deploy to production** using Docker
4. **Monitor logs** for any issues
5. **Join the community** and contribute!

## 🆘 Need Help?

- **Issues**: [GitHub Issues](https://github.com/VoxHash/vox-ai-chatbot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/VoxHash/vox-ai-chatbot/discussions)
- **Documentation**: Check other wiki pages
- **Creator**: VoxHash

---

**Vox is ready to help you get started!* *giggles cutely* 🤖✨
