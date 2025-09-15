# 🚀 Vox AI Chatbot - Quick Start Guide

## ✅ Current Status

Your Vox AI Chatbot is **LIVE and RUNNING**! 🎉

### 🌐 Access Points
- **Web Interface**: http://localhost:8080
- **Backend API**: http://localhost:4000
- **Database**: localhost:5433
- **Redis**: localhost:6380

### 🔧 Services Running
- ✅ PostgreSQL Database (Healthy)
- ✅ Redis Cache (Running)
- ✅ Backend API (Running)
- ✅ Frontend React App (Running)
- ✅ Nginx Reverse Proxy (Running)
- ✅ LLaMA AI Server (Healthy)

## 🤖 Bot Setup Instructions

### Step 1: Telegram Bot Setup

1. **Create Telegram Bot**
   - Open Telegram app
   - Search for `@BotFather`
   - Send `/newbot`
   - Follow prompts to create your bot
   - **Save the bot token** (looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

2. **Start Telegram Bot**
   ```bash
   # Replace YOUR_BOT_TOKEN with your actual token
   cd backend
   TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN npm run start:telegram
   ```

3. **Test Telegram Bot**
   - Find your bot in Telegram
   - Send any message (e.g., "Hello!")
   - Bot will respond with "Echo: [your message]"

### Step 2: Discord Bot Setup

1. **Create Discord Application**
   - Go to https://discord.com/developers/applications
   - Click "New Application"
   - Name it "Vox AI Chatbot"
   - Save the **Application ID** (Client ID)

2. **Create Bot**
   - Go to "Bot" section
   - Click "Add Bot"
   - Save the **Bot Token**
   - Copy the **Public Key** from "General Information"

3. **Set Bot Permissions**
   - Go to "OAuth2" > "URL Generator"
   - Select scopes: `bot`, `applications.commands`
   - Select permissions: `Send Messages`, `Use Slash Commands`, `Read Message History`
   - Copy the generated URL and invite bot to your server

4. **Register Slash Command**
   ```bash
   # Replace YOUR_CLIENT_ID and YOUR_BOT_TOKEN
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

5. **Start Discord Bot**
   ```bash
   # Replace with your actual tokens
   cd backend
   DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN \
   DISCORD_CLIENT_ID=YOUR_CLIENT_ID \
   DISCORD_PUBLIC_KEY=YOUR_PUBLIC_KEY \
   npm run start:discord
   ```

6. **Test Discord Bot**
   - In your Discord server, type: `/chat message:Hello Vox AI!`
   - Bot should respond with: "🤖 Vox AI: Hello Vox AI!"

## 🧪 Testing Your Setup

### Test Web Interface
1. Open http://localhost:8080
2. Login with:
   - **Email**: `test@example.com`
   - **Password**: `Passw0rd!`
3. Start chatting with the AI!

### Test Bot Integrations
```bash
# Run integration tests
node scripts/check-modules.js

# Test API endpoints
curl http://localhost:4000/api/health
curl http://localhost:4001/health  # Telegram (if running)
curl http://localhost:4003/discord/health  # Discord (if running)
```

## 🔧 Troubleshooting

### If Bots Don't Respond
1. **Check if bots are running**:
   ```bash
   ps aux | grep -E "(telegram|discord|node)"
   ```

2. **Check bot logs**:
   ```bash
   # Look for error messages in the terminal where you started the bots
   ```

3. **Verify tokens**:
   - Make sure bot tokens are correct
   - Check that bots are invited to your server/channel

### If Web Interface Doesn't Work
1. **Check Docker containers**:
   ```bash
   sudo docker-compose ps
   ```

2. **Restart services**:
   ```bash
   sudo docker-compose restart
   ```

3. **Check logs**:
   ```bash
   sudo docker-compose logs backend
   sudo docker-compose logs frontend
   ```

## 📱 Example Bot Interactions

### Telegram
```
You: Hello, Vox AI!
Bot: Echo: Hello, Vox AI!

You: What can you help me with?
Bot: Echo: What can you help me with?

You: Tell me a joke
Bot: Echo: Tell me a joke
```

### Discord
```
You: /chat message:Hello, Vox AI!
Bot: 🤖 Vox AI: Hello, Vox AI!

You: /chat message:How are you?
Bot: 🤖 Vox AI: How are you?

You: /chat message:What can you do?
Bot: 🤖 Vox AI: What can you do?
```

## 🎯 Next Steps

1. **Set up real bot tokens** in your environment
2. **Configure webhooks** for production use
3. **Customize bot responses** in the integration files
4. **Add more slash commands** for Discord
5. **Implement AI model switching** for different responses

## 📚 Additional Resources

- **Detailed Setup Guide**: `SETUP_GUIDE.md`
- **Testing Documentation**: `TESTING.md`
- **API Documentation**: Check `backend/src/routes/`
- **Bot Integration Code**: Check `backend/src/integrations/`

---

**🎉 Your Vox AI Chatbot is ready to use! Start chatting! 🤖💬**
