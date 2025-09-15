# 🤖 Vox AI Chatbot - Discord & Telegram Setup Guide

This guide will walk you through setting up the Vox AI Chatbot for Discord and Telegram platforms.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ installed
- Discord Developer Account
- Telegram Bot Token
- Basic understanding of webhooks and API endpoints

## 🚀 Step-by-Step Setup

### Step 1: Environment Configuration

1. **Create Environment File**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file** with your configuration:
   ```bash
   # Database Configuration
   DATABASE_URL=postgresql://appuser:applongpass@localhost:5433/chatbot
   REDIS_URL=redis://localhost:6380

   # JWT Secrets (generate secure random strings)
   JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:8080,http://localhost:5173

   # Bot Tokens (REQUIRED for Discord and Telegram)
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here
   DISCORD_BOT_TOKEN=your-discord-bot-token-here
   DISCORD_CLIENT_ID=your-discord-client-id-here
   DISCORD_CLIENT_SECRET=your-discord-client-secret-here
   DISCORD_PUBLIC_KEY=your-discord-public-key-here

   # Optional: OpenAI API Key
   OPENAI_API_KEY=your-openai-api-key-here
   ```

### Step 2: Telegram Bot Setup

1. **Create a Telegram Bot**
   - Open Telegram and search for `@BotFather`
   - Send `/newbot` command
   - Follow the prompts to create your bot
   - Save the bot token you receive

2. **Configure Webhook (Optional)**
   - For production, set up webhook: `https://yourdomain.com/api/telegram/webhook`
   - For development, we'll use polling (no webhook needed)

3. **Add Bot Token to Environment**
   ```bash
   TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

### Step 3: Discord Bot Setup

1. **Create Discord Application**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application"
   - Give it a name (e.g., "Vox AI Chatbot")
   - Save the Application ID (Client ID)

2. **Create Bot**
   - Go to "Bot" section in your application
   - Click "Add Bot"
   - Save the bot token
   - Copy the Public Key from "General Information"

3. **Set Bot Permissions**
   - Go to "OAuth2" > "URL Generator"
   - Select scopes: `bot`, `applications.commands`
   - Select permissions: `Send Messages`, `Use Slash Commands`, `Read Message History`
   - Copy the generated URL and invite bot to your server

4. **Register Slash Commands**
   ```bash
   # Register the chat command
   curl -X POST "https://discord.com/api/v10/applications/YOUR_CLIENT_ID/commands" \
   -H "Authorization: Bot YOUR_BOT_TOKEN" \
   -H "Content-Type: application/json" \
   -d '{
     "name": "chat",
     "description": "Chat with Vox AI",
     "options": [
       {
         "type": 3,
         "name": "message",
         "description": "Your message to the AI",
         "required": true
       }
     ]
   }'
   ```

5. **Add Discord Credentials to Environment**
   ```bash
   DISCORD_BOT_TOKEN=your-discord-bot-token
   DISCORD_CLIENT_ID=your-discord-client-id
   DISCORD_CLIENT_SECRET=your-discord-client-secret
   DISCORD_PUBLIC_KEY=your-discord-public-key
   ```

### Step 4: Start the Services

1. **Start Database and Core Services**
   ```bash
   sudo docker-compose up -d db redis
   ```

2. **Start the Main Application**
   ```bash
   sudo docker-compose up -d backend frontend nginx
   ```

3. **Start Bot Integrations**
   ```bash
   # Start Telegram bot
   cd backend
   npm run start:telegram &

   # Start Discord bot
   npm run start:discord &
   ```

### Step 5: Verify Setup

1. **Check Service Status**
   ```bash
   sudo docker-compose ps
   ```

2. **Test Web Interface**
   - Open http://localhost:8080
   - Login with: `test@example.com` / `Passw0rd!`

3. **Test Bot Integrations**
   ```bash
   # Run integration tests
   node scripts/check-modules.js
   ```

## 🧪 Testing the Bots

### Telegram Testing

1. **Find Your Bot**
   - Search for your bot username in Telegram
   - Start a conversation

2. **Send Test Messages**
   - Send: "Hello, Vox AI!"
   - Send: "What can you help me with?"
   - Send: "Tell me a joke"

3. **Expected Response**
   - Bot should echo your message with "Echo: [your message]"

### Discord Testing

1. **Use Slash Commands**
   - In your Discord server, type: `/chat message:Hello Vox AI!`
   - Try: `/chat message:How are you?`
   - Try: `/chat message:What can you do?`

2. **Expected Response**
   - Bot should respond with: "🤖 Vox AI: [your message]"

## 🔧 Troubleshooting

### Common Issues

1. **Docker Permission Denied**
   ```bash
   # Add user to docker group
   sudo usermod -aG docker $USER
   # Log out and back in, then try again
   ```

2. **Bot Not Responding**
   - Check if bot token is correct
   - Verify environment variables are loaded
   - Check bot logs for errors

3. **Database Connection Issues**
   - Ensure PostgreSQL container is running
   - Check DATABASE_URL in .env file
   - Verify database credentials

4. **Port Conflicts**
   - Telegram bot uses port 4001
   - Discord bot uses port 4003
   - Main app uses port 4000
   - Web interface uses port 8080

### Debug Commands

```bash
# Check container logs
sudo docker-compose logs backend
sudo docker-compose logs telegram
sudo docker-compose logs discord

# Check bot processes
ps aux | grep -E "(telegram|discord|node)"

# Test API endpoints
curl http://localhost:4000/api/health
curl http://localhost:4001/health
curl http://localhost:4003/discord/health
```

## 📱 Bot Commands

### Telegram Commands
- Any text message will be processed
- Bot responds with echo of your message
- Supports emojis and special characters

### Discord Commands
- `/chat message:<your message>` - Chat with the AI
- Bot responds with AI-generated content
- Supports rich formatting and mentions

## 🚀 Production Deployment

For production deployment:

1. **Use Webhooks Instead of Polling**
2. **Set up SSL certificates**
3. **Configure proper environment variables**
4. **Set up monitoring and logging**
5. **Use a reverse proxy (nginx)**
6. **Implement rate limiting**

## 📞 Support

If you encounter issues:
1. Check the logs first
2. Verify all environment variables
3. Ensure all services are running
4. Check network connectivity
5. Review this guide step by step

---

**Happy Chatting! 🤖💬**
