# 🤖 Vox AI Chatbot - Complete Setup & Usage Guide

A comprehensive guide for setting up and using the Vox AI Chatbot with Discord, Telegram, and WhatsApp integrations.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Bot Integrations Setup](#-bot-integrations-setup)
- [Web Interface Setup](#-web-interface-setup)
- [AI Model Configuration](#-ai-model-configuration)
- [Testing & Troubleshooting](#-testing--troubleshooting)
- [Production Deployment](#-production-deployment)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Git

### 1. Clone and Setup
```bash
git clone https://github.com/voxhash/vox-ai-chatbot
cd vox-ai-chatbot
cp .env.example .env
```

### 2. Start Core Services
```bash
# Start database and Redis
sudo docker-compose up -d db redis

# Start LLaMA AI server
sudo docker-compose up -d llama-server

# Start backend and frontend
sudo docker-compose up -d backend frontend nginx
```

### 3. Access the Application
- **Web Interface**: http://localhost:8080
- **Backend API**: http://localhost:4000
- **Login**: `test@example.com` / `Passw0rd!`

## 🤖 Bot Integrations Setup

### Discord Bot Setup

#### 1. Create Discord Application
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" → Name it "Vox AI Chatbot"
3. Save the **Application ID** (Client ID)

#### 2. Create Bot
1. Go to "Bot" section → Click "Add Bot"
2. Save the **Bot Token**
3. Copy the **Public Key** from "General Information"

#### 3. Set Bot Permissions
1. Go to "OAuth2" → "URL Generator"
2. Select scopes: `bot`, `applications.commands`
3. Select permissions:
   - `Send Messages`
   - `Use Slash Commands`
   - `Read Message History`
   - `Message Content Intent` (for DM support)
   - `Guild Message Reactions` (for reactions)
   - `Guild Members` (for welcome messages)
4. Copy the generated URL and invite bot to your server

#### 4. Configure Environment
Add to your `.env` file:
```bash
DISCORD_BOT_TOKEN=your-discord-bot-token
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_PUBLIC_KEY=your-discord-public-key
```

#### 5. Start Discord Bot
```bash
cd backend
npm run start:discord
```

### Telegram Bot Setup

#### 1. Create Telegram Bot
1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow prompts to create your bot
4. Save the **Bot Token**

#### 2. Configure for Groups (Optional)
1. Add bot to your group
2. Make bot an admin with all permissions
3. This enables the bot to read all group messages

#### 3. Configure Environment
Add to your `.env` file:
```bash
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
```

#### 4. Start Telegram Bot
```bash
cd backend
npm run start:telegram
```

### WhatsApp Bot Setup

#### 1. Install Dependencies
```bash
cd backend
npm install @whiskeysockets/baileys pino
```

#### 2. Configure Environment
Add to your `.env` file:
```bash
WHATSAPP_SESSION_NAME=vox-ai-session
```

#### 3. Start WhatsApp Bot
```bash
cd backend
npm run start:whatsapp
```

#### 4. Connect Your WhatsApp
1. Scan the QR code displayed in the terminal
2. Use your phone's WhatsApp to scan the code
3. The bot will be connected and ready to use

## 🌐 Web Interface Setup

### Local Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

### Network Access
To allow external access to the web interface:

1. **Backend Configuration** (already configured):
   - Backend listens on `0.0.0.0:4000`

2. **Frontend Configuration**:
   ```bash
   # Create frontend/.env
   echo "VITE_API_URL=http://YOUR_IP:4000" > frontend/.env
   ```

3. **Start with Network Access**:
   ```bash
   cd frontend
   npm run dev -- --host 0.0.0.0
   ```

4. **Configure Firewall** (if needed):
   ```bash
   sudo ufw allow 4000
   sudo ufw allow 5173
   ```

## 🧠 AI Model Configuration

### Option 1: Local LLaMA Model (Recommended)
The chatbot comes with local AI models for complete privacy:

```bash
# Start LLaMA server
sudo docker-compose up -d llama-server

# Check if running
curl http://localhost:8081/completion -X POST \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello", "max_tokens": 10}'
```

**Available Models:**
- `vox_legacy.gguf` (4GB) - Fast, good for most tasks
- `vox_brain.gguf` (12.6GB) - More capable, slower

### Option 2: OpenAI API
For production use with OpenAI's models:

1. Get API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add to `.env`:
   ```bash
   OPENAI_API_KEY=your-openai-api-key
   AI_PROVIDER=openai
   ```

### Option 3: Mock Mode (Default)
Works out of the box for testing:
```bash
AI_PROVIDER=mock
```

## 🧪 Testing & Troubleshooting

### Test All Integrations
```bash
# Run integration tests
cd backend
npm test

# Test individual bots
node scripts/test-bots.js
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

### Common Issues

#### Bot Not Responding
1. **Check if bots are running**:
   ```bash
   ps aux | grep -E "(discord|telegram|whatsapp)"
   ```

2. **Check bot logs** for error messages

3. **Verify tokens** are correct in `.env` file

#### LLaMA Communication Error
1. **Check LLaMA server**:
   ```bash
   sudo docker ps | grep llama
   ```

2. **Restart LLaMA server**:
   ```bash
   sudo docker-compose restart llama-server
   ```

3. **Check backend configuration**:
   - Ensure `LLAMA_URL=http://localhost:8081` in `.env`

#### WhatsApp Bot 401 Unauthorized Error
1. **Clear authentication data**:
   ```bash
   cd backend
   rm -rf auth_info_*
   npm run start:whatsapp
   ```

2. **Or use the reset script**:
   ```bash
   ./scripts/reset-whatsapp-auth.sh
   npm run start:whatsapp
   ```

3. **Scan the new QR code** within 60 seconds

#### Frontend Network Error
1. **Check backend is listening on all interfaces**:
   ```bash
   netstat -tlnp | grep :4000
   ```

2. **Update frontend .env**:
   ```bash
   echo "VITE_API_URL=http://YOUR_IP:4000" > frontend/.env
   ```

#### Database Connection Issues
1. **Check PostgreSQL container**:
   ```bash
   sudo docker-compose ps db
   ```

2. **Verify DATABASE_URL** in `.env`:
   ```bash
   DATABASE_URL=postgresql://appuser:applongpass@localhost:5433/chatbot
   ```

### Bot-Specific Testing

#### Discord Bot
- Use slash command: `/chat message:Hello!`
- Test in DMs and server channels
- Try reactions on bot messages

#### Telegram Bot
- Send messages in DMs
- Test in groups (mention the bot: `@YourBotName hello`)
- Try replying to bot messages

#### WhatsApp Bot
- Send messages in DMs
- Test in groups (mention the bot or reply to its messages)
- Try reactions on bot messages

## 🚀 Production Deployment

### Environment Configuration
```bash
# Production .env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db:5432/chatbot
REDIS_URL=redis://redis:6379/0
JWT_ACCESS_SECRET=your-super-secure-secret
JWT_REFRESH_SECRET=your-super-secure-refresh-secret
AI_PROVIDER=openai  # or localai
OPENAI_API_KEY=your-openai-key
```

### Docker Production
```bash
# Build and start all services
sudo docker-compose up --build -d

# Check status
sudo docker-compose ps

# View logs
sudo docker-compose logs -f
```

### Security Considerations
1. **Use strong JWT secrets**
2. **Enable HTTPS** with reverse proxy
3. **Set up proper firewall rules**
4. **Regular security updates**
5. **Monitor logs** for suspicious activity

## 📱 Bot Features

### Discord Bot Features
- ✅ Slash commands (`/chat message:`)
- ✅ DM and server channel support
- ✅ Thread creation with user confirmation
- ✅ Emotion-based reactions
- ✅ Personalized responses to reactions
- ✅ Nickname changing assistance
- ✅ Welcome messages for new members
- ✅ Conversation memory
- ✅ Multilingual support (Spanish, English, French, etc.)

### Telegram Bot Features
- ✅ Direct message support
- ✅ Group message support (with mentions)
- ✅ Emotion-based reactions
- ✅ Personalized responses to reactions
- ✅ Welcome messages for new members
- ✅ Conversation memory
- ✅ Inline keyboard reactions
- ✅ Multilingual support (Spanish, English, French, etc.)

### WhatsApp Bot Features
- ✅ Direct message support
- ✅ Group message support (with mentions)
- ✅ Emotion-based reactions
- ✅ Personalized responses to reactions
- ✅ Welcome messages for new members
- ✅ Conversation memory
- ✅ QR code authentication
- ✅ Multilingual support (Spanish, English, French, etc.)

## 🔧 Advanced Configuration

### Custom AI Models
To use your own GGUF models:

1. **Place model files** in `models/` directory
2. **Update docker-compose.yml**:
   ```yaml
   llama-server:
     environment:
       MODEL: /models/your-model.gguf
   ```
3. **Restart LLaMA server**:
   ```bash
   sudo docker-compose restart llama-server
   ```

### Bot Customization
Edit bot behavior in:
- `backend/src/integrations/discord.js`
- `backend/src/integrations/telegram.js`
- `backend/src/integrations/whatsapp_baileys.js`

### Database Management
```bash
# Access database
sudo docker-compose exec db psql -U appuser -d chatbot

# Backup database
sudo docker-compose exec db pg_dump -U appuser chatbot > backup.sql

# Restore database
sudo docker-compose exec -T db psql -U appuser chatbot < backup.sql
```

## 📞 Support

If you encounter issues:
1. Check the logs first
2. Verify all environment variables
3. Ensure all services are running
4. Check network connectivity
5. Review this guide step by step

For additional help:
- **GitHub Issues**: [Create an issue](https://github.com/voxhash/vox-ai-chatbot/issues)
- **Documentation**: Check the main README.md
- **Code Examples**: See `scripts/` directory

---

**Happy Chatting! 🤖💬**

*Built with ❤️ by [@VoxHash](https://github.com/voxhash)*
