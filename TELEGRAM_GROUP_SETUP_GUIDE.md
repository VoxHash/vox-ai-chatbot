# 🤖 Telegram Group Setup Guide

## ❌ **Current Issue**
The Telegram bot is not responding in groups because it doesn't have the proper permissions to read all group messages.

## ✅ **Solution: Proper Group Setup**

### **Step 1: Add Bot to Group as Admin**

1. **Open your Telegram group**
2. **Click on the group name** (at the top)
3. **Click "Edit"** (pencil icon)
4. **Click "Administrators"**
5. **Click "Add Admin"**
6. **Search for `@VoxAssistantBot`**
7. **Select the bot**
8. **Grant these permissions:**
   - ✅ **Delete messages**
   - ✅ **Ban users** 
   - ✅ **Add new admins**
   - ✅ **Pin messages**
   - ✅ **Manage chat**
   - ✅ **Invite users via link**
   - ✅ **Post messages**
   - ✅ **Edit messages**
   - ✅ **Delete messages**
   - ✅ **Ban users**
   - ✅ **Invite users via link**

### **Step 2: Alternative - Use Bot Commands**

If you can't make the bot an admin, the bot will only respond when:
- **Mentioned directly**: `@VoxAssistantBot hello`
- **Replied to its own messages**
- **Used in private messages**

### **Step 3: Test the Bot**

#### **In Groups (with admin permissions):**
```
Hello
What's 2+2?
Who made you?
```

#### **In Groups (without admin permissions):**
```
@VoxAssistantBot hello
@VoxAssistantBot what's 2+2?
@VoxAssistantBot who made you?
```

#### **In Private Messages:**
```
/start
Hello
What's 2+2?
Who made you?
```

## 🔧 **Bot Configuration**

The bot is configured with:
- **Username**: `@VoxAssistantBot`
- **Name**: `Vox`
- **Can join groups**: ✅ Yes
- **Can read all group messages**: ❌ No (requires admin permissions)

## 🚀 **Quick Test**

1. **Add bot to group as admin** (Step 1)
2. **Send any message** in the group
3. **Bot should respond immediately**

## 📱 **Features Available**

- ✅ **Direct Messages**: Full functionality
- ✅ **Group Messages**: When mentioned or with admin permissions
- ✅ **Creator Questions**: "Who made you?" responses
- ✅ **AI Responses**: Full AI integration
- ✅ **Reaction Buttons**: Like, Dislike, Idea, Question
- ✅ **Memory System**: Remembers conversation history
- ✅ **Discussion Topics**: Creates topics in groups
- ✅ **Welcome Messages**: Welcomes new members

## 🆘 **Troubleshooting**

### **Bot not responding in groups:**
1. Check if bot is added as admin
2. Try mentioning the bot: `@VoxAssistantBot hello`
3. Check bot permissions in group settings

### **Bot not responding at all:**
1. Check if bot is online: `curl http://localhost:4001/health`
2. Check bot token in `.env` file
3. Restart the bot: `pkill -f telegram.js && cd backend && node --env-file=../.env src/integrations/telegram.js &`

## 🎯 **Expected Behavior**

- **With Admin Permissions**: Responds to all messages in groups
- **Without Admin Permissions**: Only responds when mentioned
- **Private Messages**: Always responds to all messages

---

**The bot is ready and working! Just needs proper group permissions to respond to all messages. 🤖✨**
