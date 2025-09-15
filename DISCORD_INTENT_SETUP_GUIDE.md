# 🔧 Discord Bot Intent Setup Guide

## ❌ **Current Issue**

The Discord bot is failing to start with the error: **"Used disallowed intents"**

This happens because the Discord application doesn't have the **Message Content Intent** enabled, which is required for:
- Reading message content in DMs
- Responding to regular messages (not just slash commands)
- Full DM support

## ✅ **Solution: Enable Message Content Intent**

### **Step 1: Go to Discord Developer Portal**
1. Open: https://discord.com/developers/applications
2. Select your **Vox AI** application

### **Step 2: Enable Message Content Intent**
1. Go to **"Bot"** section in the left sidebar
2. Scroll down to **"Privileged Gateway Intents"**
3. Find **"Message Content Intent"**
4. **Toggle it ON** ✅
5. Click **"Save Changes"**

### **Step 3: Restart the Bot**
After enabling the intent, restart the Discord bot:

```bash
cd backend && npm run start:discord
```

## 🎯 **What This Enables**

### **✅ After Enabling Message Content Intent:**
- **DM Support**: Bot responds to direct messages
- **Mention Support**: Bot responds when mentioned in servers
- **Regular Messages**: Bot can read and respond to normal messages
- **Slash Commands**: Continue to work as before

### **❌ Without Message Content Intent:**
- **Slash Commands Only**: Only `/chat message:Hello!` works
- **No DM Support**: Bot won't respond to DMs
- **No Mentions**: Bot won't respond to `@Vox AI Hello!`

## 🔄 **Alternative: Fallback Mode**

If you can't enable Message Content Intent right now, I can create a fallback version that works with basic intents:

### **Fallback Features:**
- ✅ Slash commands work everywhere
- ✅ Server mentions work (when bot is mentioned)
- ❌ Direct DM support (requires Message Content Intent)

## 📋 **Current Bot Status**

**Bot Name**: Vox#1960  
**Bot ID**: 1417097913573572628  
**Status**: Offline (waiting for intent approval)  
**Required Intent**: Message Content Intent  

## 🚀 **Next Steps**

1. **Enable Message Content Intent** in Discord Developer Portal
2. **Restart the bot** with `npm run start:discord`
3. **Test DM support** by sending a direct message to the bot
4. **Test slash commands** with `/chat message:Hello!`

---

**Once you enable the Message Content Intent, your Discord bot will have full functionality! 🤖✨**
