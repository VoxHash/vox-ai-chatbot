# 🚀 Live Preview Guide - Vox AI Chatbot

This guide will help you run a complete live preview of the Vox AI Chatbot with both Telegram and Discord integrations.

## 📋 Prerequisites

- Docker and docker-compose installed
- Node.js and npm installed
- Telegram bot token (for Telegram testing)
- Discord bot configuration (for Discord testing)

## 🐳 Step 1: Start the Core Services

1. **Start Docker services**:
   ```bash
   sudo docker-compose up --build -d
   ```

2. **Verify services are running**:
   ```bash
   # Check LLaMA server
   curl http://localhost:8081/health
   
   # Check database
   curl http://localhost:5433
   
   # Check Redis
   curl http://localhost:6380
   ```

## 🤖 Step 2: Set Up Telegram Bot

1. **Configure Telegram** (if not already done):
   ```bash
   # Edit .env file
   nano .env
   
   # Add your Telegram bot token
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   ```

2. **Start Telegram bot**:
   ```bash
   cd backend
   npm run start:telegram
   ```

3. **Test Telegram bot**:
   - Send a message to your Telegram bot
   - You should receive AI responses from the vox_legacy model

## 🎮 Step 3: Set Up Discord Bot

1. **Run Discord setup script**:
   ```bash
   ./scripts/setup-discord.sh
   ```

2. **Or manually configure Discord**:
   ```bash
   # Edit .env file
   nano .env
   
   # Add Discord configuration
   DISCORD_BOT_TOKEN=your_discord_bot_token_here
   DISCORD_CLIENT_ID=your_discord_client_id_here
   DISCORD_PUBLIC_KEY=your_discord_public_key_here
   ```

3. **Register Discord slash commands**:
   ```bash
   cd backend
   node register-discord-commands.js
   ```

4. **Start Discord bot**:
   ```bash
   npm run start:discord
   ```

5. **Test Discord bot**:
   - In your Discord server, type: `/chat message:Hello Vox AI!`
   - You should receive AI responses from the vox_legacy model

## 🌐 Step 4: Start the Web Interface

1. **Start the frontend** (optional):
   ```bash
   cd frontend
   npm run dev
   ```

2. **Access the web interface**:
   - Open http://localhost:5173 in your browser
   - Login with: `test@example.com` / `Passw0rd!`

## 🧪 Step 5: Test All Integrations

### Telegram Testing
- Send messages to your Telegram bot
- Test commands: `/start`, `/help`, `/status`
- Verify AI responses are intelligent and relevant

### Discord Testing
- Use slash command: `/chat message:Your question here`
- Test various types of questions
- Verify AI responses are intelligent and relevant

### Web Interface Testing
- Login to the web interface
- Send messages through the chat interface
- Verify real-time updates work

## 🔧 Troubleshooting

### LLaMA Server Issues
```bash
# Check if LLaMA server is running
docker ps | grep llama

# Check LLaMA logs
docker-compose logs llama-server

# Restart LLaMA server
docker-compose restart llama-server
```

### Bot Connection Issues
```bash
# Check bot processes
ps aux | grep -E "(telegram|discord)"

# Check bot logs
# Telegram: Look at the terminal where you started it
# Discord: Check the console output

# Restart bots
pkill -f "telegram.js"
pkill -f "discord.js"
cd backend
npm run start:telegram &
npm run start:discord &
```

### Environment Variables
```bash
# Check .env file
cat .env | grep -E "(TELEGRAM|DISCORD|LLAMA)"

# Verify all required variables are set
```

## 📊 Monitoring

### Check Service Status
```bash
# All services status
curl http://localhost:8081/health  # LLaMA
curl http://localhost:4000/health  # Backend
curl http://localhost:4001/health  # Telegram
curl http://localhost:4003/discord/health  # Discord
```

### View Logs
```bash
# Docker services logs
docker-compose logs -f

# Bot logs (in separate terminals)
cd backend && npm run start:telegram
cd backend && npm run start:discord
```

## 🎉 Success Indicators

You'll know everything is working when:

✅ **Telegram Bot**:
- Responds to messages with intelligent AI answers
- No "ENOTFOUND llama-server" errors
- Uses vox_legacy model responses

✅ **Discord Bot**:
- Responds to `/chat` commands with intelligent AI answers
- Slash commands are registered and working
- Uses vox_legacy model responses

✅ **Web Interface**:
- Login works with test credentials
- Chat interface responds with AI answers
- Real-time updates work

✅ **LLaMA Server**:
- Responds to health checks
- Processes AI requests correctly
- Uses vox_legacy.gguf model

## 🚀 Next Steps

Once everything is working:

1. **Customize the AI responses** by modifying the system prompts
2. **Add more bot integrations** (Slack, WhatsApp)
3. **Deploy to production** using your preferred hosting platform
4. **Monitor and optimize** the AI model performance

---

**Need Help?** Check the console output for detailed error messages and ensure all environment variables are correctly set.
