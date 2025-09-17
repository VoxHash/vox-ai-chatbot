# 🚀 Vox AI Chatbot Setup Guide

## Quick Setup (5 minutes)

### 1. Prerequisites
- Node.js 18+ installed
- Docker & Docker Compose installed
- Git installed

### 2. Clone and Install
```bash
git clone https://github.com/voxhash/vox-ai-chatbot.git
cd vox-ai-chatbot
cd backend && npm install
cd ../frontend && npm install
```

### 3. Environment Configuration
```bash
# Copy the environment template
cp .env.example .env

# Edit with your settings
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

# Bot Tokens (get from respective platforms)
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
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend  
cd frontend && npm start

# Terminal 3: Discord Bot
cd backend && npm run start:discord

# Terminal 4: Telegram Bot
cd backend && npm run start:telegram

# Terminal 5: WhatsApp Bot
cd backend && npm run start:whatsapp
```

## 🤖 Bot Setup

### Discord Bot Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create New Application → Bot
3. Copy Bot Token to `.env`
4. Enable Intents:
   - ✅ Guilds
   - ✅ Guild Messages  
   - ✅ Direct Messages
   - ✅ Message Content Intent
   - ✅ Guild Message Reactions
   - ✅ Guild Members
5. Invite bot to server with required permissions

### Telegram Bot Setup
1. Message [@BotFather](https://t.me/botfather)
2. Send `/newbot`
3. Follow instructions to create bot
4. Copy token to `.env`
5. Start bot: `npm run start:telegram`

### WhatsApp Bot Setup
1. No token needed!
2. Start bot: `npm run start:whatsapp`
3. Scan QR code with WhatsApp mobile app
4. Bot is ready to use

## 🧪 Testing

```bash
# Test all integrations
cd backend
npm run test:integration

# Test specific platform
node scripts/test-location-detection.js
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

---

**Need help?** Check the [main README](README.md) or open an issue on GitHub!
