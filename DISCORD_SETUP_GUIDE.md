# 🤖 Discord Bot Setup Guide

This guide will walk you through setting up the Vox AI Chatbot for Discord step-by-step.

## 📋 Prerequisites

- Discord account
- Discord server where you have administrator permissions
- Node.js and npm installed
- Docker and docker-compose installed

## 🚀 Step 1: Create a Discord Application

1. **Go to Discord Developer Portal**
   - Visit: https://discord.com/developers/applications
   - Click **"New Application"**
   - Enter name: `Vox AI Chatbot`
   - Click **"Create"**

2. **Get Application ID**
   - In the **General Information** tab
   - Copy the **Application ID** (you'll need this later)
   - Save it as `DISCORD_CLIENT_ID`

## 🔑 Step 2: Create Bot User

1. **Navigate to Bot Section**
   - In your application, go to **"Bot"** tab (left sidebar)
   - Click **"Add Bot"**
   - Click **"Yes, do it!"**

2. **Configure Bot Settings**
   - **Username**: `Vox AI Bot`
   - **Avatar**: Upload a custom avatar (optional)
   - **Token**: Click **"Copy"** to copy the bot token
   - Save it as `DISCORD_BOT_TOKEN`

3. **Bot Permissions**
   - Scroll down to **"Privileged Gateway Intents"**
   - Enable:
     - ✅ **Message Content Intent**
     - ✅ **Server Members Intent** (if needed)
     - ✅ **Presence Intent** (if needed)

## 🔐 Step 3: Generate Public Key

1. **Go to General Information**
   - In your application, go to **"General Information"** tab
   - Scroll down to **"Public Key"**
   - Click **"Copy"** to copy the public key
   - Save it as `DISCORD_PUBLIC_KEY`

## ⚙️ Step 4: Configure Environment Variables

1. **Open your `.env` file**
   ```bash
   nano .env
   ```

2. **Add Discord Configuration**
   ```env
   # Discord Bot Configuration
   DISCORD_BOT_TOKEN=your_bot_token_here
   DISCORD_CLIENT_ID=your_application_id_here
   DISCORD_PUBLIC_KEY=your_public_key_here
   ```

3. **Save and exit**
   - Press `Ctrl + X`
   - Press `Y` to confirm
   - Press `Enter` to save

## 🎯 Step 5: Set Up Slash Commands

1. **Go to OAuth2 > URL Generator**
   - In your Discord application, go to **"OAuth2"** tab
   - Click **"URL Generator"**

2. **Select Scopes**
   - ✅ **applications.commands**
   - ✅ **bot**

3. **Select Bot Permissions**
   - ✅ **Send Messages**
   - ✅ **Use Slash Commands**
   - ✅ **Read Message History**
   - ✅ **Add Reactions**

4. **Generate Invite URL**
   - Copy the generated URL at the bottom
   - Open it in your browser
   - Select your server
   - Click **"Authorize"**

## 🚀 Step 6: Register Slash Commands

The bot will automatically register the `/chat` command when it starts. The command structure is:

- **Command**: `/chat`
- **Description**: "Chat with Vox AI"
- **Options**: 
  - `message` (required): The message to send to the AI

## 🏃‍♂️ Step 7: Start the Discord Bot

1. **Start the LLaMA server** (if not already running):
   ```bash
   sudo docker-compose up --build -d
   ```

2. **Start the Discord bot**:
   ```bash
   cd backend
   npm run start:discord
   ```

3. **Verify the bot is running**:
   - You should see: `Discord bot webhook running on port 4003`
   - The bot should appear online in your Discord server

## 🧪 Step 8: Test the Bot

1. **In your Discord server**, type:
   ```
   /chat message:Hello Vox AI!
   ```

2. **Expected response**:
   ```
   🤖 Vox AI: [AI-generated response from vox_legacy model]
   ```

## 🔧 Troubleshooting

### Bot Not Responding
- Check if the bot is online in Discord
- Verify all environment variables are set correctly
- Check the console for error messages

### Slash Commands Not Working
- Make sure the bot has the `applications.commands` scope
- Try re-inviting the bot with the correct permissions
- Wait a few minutes for commands to register

### AI Not Responding
- Ensure the LLaMA server is running (`docker-compose up -d`)
- Check that `LLAMA_URL=http://localhost:8081` in `.env`
- Verify the vox_legacy model is loaded

### Permission Errors
- Make sure the bot has the necessary permissions in your server
- Check that you have administrator permissions in the server

## 📱 Available Commands

- `/chat <message>` - Chat with Vox AI
- The bot will respond with intelligent answers using the vox_legacy model

## 🎉 Success!

Once everything is working, you should be able to:
- ✅ Use `/chat` commands in Discord
- ✅ Get real AI responses from the vox_legacy model
- ✅ Have conversations with the AI through Discord

## 🔄 Next Steps

After Discord is working, you can also set up:
- **Telegram Bot** (already working!)
- **Slack Bot** (coming next)
- **WhatsApp Integration** (future feature)

---

**Need Help?** Check the console output for detailed error messages and ensure all environment variables are correctly set.
