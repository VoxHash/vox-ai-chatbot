# 🚀 Quick Discord Bot Setup

## ⚠️ **Current Issue**
Your Discord bot is running but not responding because the Discord environment variables are not configured.

## 🔧 **Quick Fix Steps**

### 1. **Get Discord Bot Credentials**

1. **Go to Discord Developer Portal**: https://discord.com/developers/applications
2. **Create New Application** (or select existing):
   - Click "New Application"
   - Name: `Vox AI Chatbot`
   - Click "Create"

3. **Get Bot Token**:
   - Go to "Bot" tab
   - Click "Add Bot" if not already added
   - Click "Copy" under Token
   - **Save this token!**

4. **Get Application ID**:
   - Go to "General Information" tab
   - Copy the "Application ID"
   - **Save this ID!**

5. **Get Public Key**:
   - In "General Information" tab
   - Copy the "Public Key"
   - **Save this key!**

### 2. **Configure Environment Variables**

Add these lines to your `.env` file:

```env
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_application_id_here
DISCORD_PUBLIC_KEY=your_public_key_here
```

### 3. **Set Up Bot Permissions**

1. **Go to OAuth2 > URL Generator**:
   - Select scopes: `applications.commands` and `bot`
   - Select permissions: `Send Messages`, `Use Slash Commands`, `Read Message History`
   - Copy the generated URL

2. **Invite Bot to Server**:
   - Open the URL in your browser
   - Select your Discord server
   - Click "Authorize"

### 4. **Register Slash Commands**

Run this command to register the `/chat` command:

```bash
cd backend
node register-discord-commands.js
```

### 5. **Restart Discord Bot**

```bash
pkill -f "discord.js"
cd backend && npm run start:discord &
```

## 🧪 **Test Your Bot**

1. **In Discord**, type: `/chat message:Hello Vox AI!`
2. **You should get**: A response from the vox_legacy AI model
3. **If not working**: Check the console for error messages

## 🔍 **Troubleshooting**

### Bot Not Responding
- ✅ Check if `DISCORD_BOT_TOKEN` is set correctly
- ✅ Check if bot is invited to your server
- ✅ Check if slash commands are registered
- ✅ Check bot permissions in server

### Slash Commands Not Working
- ✅ Run the command registration script
- ✅ Wait a few minutes for commands to propagate
- ✅ Check if bot has `applications.commands` scope

### AI Not Responding
- ✅ Check if LLaMA server is running (`curl http://localhost:8081/health`)
- ✅ Check if `LLAMA_URL=http://localhost:8081` in `.env`

## 📋 **Current Status**

✅ **Telegram Bot**: Working perfectly with AI responses  
✅ **LLaMA Server**: Running and responding correctly  
✅ **Discord Bot**: Running but needs Discord credentials  
⏳ **Discord Setup**: Needs your Discord bot token and configuration  

## 🎯 **Next Steps**

1. **Get Discord credentials** from Discord Developer Portal
2. **Add them to `.env` file**
3. **Register slash commands**
4. **Test with `/chat` command**

Once configured, your Discord bot will respond with intelligent AI answers just like the Telegram bot! 🤖✨
