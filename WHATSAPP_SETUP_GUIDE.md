# WhatsApp Bot Setup Guide

This guide will help you set up the Vox AI WhatsApp bot integration.

## Prerequisites

- Node.js installed
- WhatsApp account
- QR code scanner (your phone)

## Setup Steps

### 1. Environment Variables

Add the following to your `.env` file:

```bash
# WhatsApp Bot Configuration
WHATSAPP_SESSION_NAME=vox-ai-session
```

### 2. Install Dependencies

The WhatsApp integration requires `whatsapp-web.js` which has been added to the package.json. Run:

```bash
cd backend
npm install
```

### 3. Start the WhatsApp Bot

```bash
npm run start:whatsapp
```

### 4. Connect Your WhatsApp

1. When you start the bot, it will display a QR code in the terminal
2. Open WhatsApp on your phone
3. Go to Settings > Linked Devices > Link a Device
4. Scan the QR code displayed in the terminal
5. The bot will be connected and ready to use

## Features

The WhatsApp bot includes all the same features as Discord and Telegram:

### 🧠 **Memory System**
- Remembers conversation history for better context
- Stores last 10 messages per user
- Provides personalized responses

### 😊 **Emotion Detection**
- Detects emotions in user messages (happy, sad, angry, confused, etc.)
- Sends appropriate emoji reactions
- Responds with empathy and understanding

### 👋 **Welcome Messages**
- Sends personalized welcome messages to new group members
- Introduces the bot and its capabilities

### 🔄 **Reaction System**
- Sends reaction options after each response
- Users can react with Like, Dislike, Idea, or Question
- Provides personalized feedback based on reactions

### 📱 **Group Support**
- Works in both private chats and groups
- Responds when mentioned (@VoxAssistantBot)
- Responds to replies to bot messages
- Detects group mentions and processes accordingly

### 🛡️ **Rate Limiting**
- Prevents duplicate processing of messages
- Ensures smooth operation even with multiple users

## Usage

### Private Chats
- Send any message to the bot
- The bot will respond with AI-generated content
- Use reaction buttons to provide feedback

### Group Chats
- Mention the bot: `@VoxAssistantBot your question`
- Reply to bot messages
- The bot will respond in the group

### Commands
- No specific commands needed - just send natural messages
- Ask questions, request information, or have conversations

## Troubleshooting

### QR Code Issues
- Make sure your phone and computer are on the same network
- Try refreshing the QR code by restarting the bot
- Ensure WhatsApp is updated on your phone

### Connection Issues
- Check your internet connection
- Restart the bot if it disconnects
- Clear the session data if needed (delete the session folder)

### Bot Not Responding
- Check if the bot is mentioned in groups
- Ensure the message is not from the bot itself
- Check the console for error messages

## Security Notes

- The bot uses your WhatsApp account, so be careful with permissions
- Session data is stored locally and should be kept secure
- Don't share your session data with others

## Support

If you encounter any issues:
1. Check the console output for error messages
2. Ensure all dependencies are installed
3. Verify your environment variables are set correctly
4. Check the GitHub repository for updates

## Next Steps

Once the bot is running:
1. Test it in a private chat
2. Add it to a group and test group functionality
3. Try asking various questions to test the AI responses
4. Test the emotion detection and reaction features

The WhatsApp bot is now ready to use with all the advanced features of the Discord and Telegram integrations!
