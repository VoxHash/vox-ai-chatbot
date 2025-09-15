import 'dotenv/config';
import { Client, GatewayIntentBits, Events, SlashCommandBuilder, REST, Routes } from 'discord.js';
import { completeChat } from '../ai/openai.js';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

if (!DISCORD_BOT_TOKEN) {
  console.log('DISCORD_BOT_TOKEN not set. Discord integration disabled.');
  process.exit(0);
}

// Memory system for conversation context
const conversationMemory = new Map();
const MAX_MEMORY_SIZE = 10; // Keep last 10 messages per user

// Helper function to get conversation history
function getConversationHistory(userId) {
  return conversationMemory.get(userId) || [];
}

// Helper function to add message to memory
function addToMemory(userId, role, content) {
  if (!conversationMemory.has(userId)) {
    conversationMemory.set(userId, []);
  }
  
  const history = conversationMemory.get(userId);
  history.push({ role, content, timestamp: Date.now() });
  
  // Keep only last MAX_MEMORY_SIZE messages
  if (history.length > MAX_MEMORY_SIZE) {
    history.splice(0, history.length - MAX_MEMORY_SIZE);
  }
  
  conversationMemory.set(userId, history);
}

// Helper function to detect emotions in user messages
function detectEmotion(text) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('😊') || lowerText.includes(':)') || lowerText.includes('happy') || lowerText.includes('great') || lowerText.includes('awesome') || lowerText.includes('thanks') || lowerText.includes('thank you')) {
    return 'happy';
  }
  if (lowerText.includes('😢') || lowerText.includes(':(') || lowerText.includes('sad') || lowerText.includes('upset') || lowerText.includes('disappointed')) {
    return 'sad';
  }
  if (lowerText.includes('😡') || lowerText.includes('angry') || lowerText.includes('mad') || lowerText.includes('frustrated')) {
    return 'angry';
  }
  if (lowerText.includes('😮') || lowerText.includes('wow') || lowerText.includes('amazing') || lowerText.includes('incredible')) {
    return 'surprised';
  }
  if (lowerText.includes('🤔') || lowerText.includes('hmm') || lowerText.includes('confused') || lowerText.includes('?') || lowerText.includes('help')) {
    return 'confused';
  }
  if (lowerText.includes('❤️') || lowerText.includes('love') || lowerText.includes('heart')) {
    return 'love';
  }
  
  return 'neutral';
}

// Helper function to get appropriate sticker for emotion
function getStickerForEmotion(emotion) {
  const stickers = {
    'happy': '😊',
    'sad': '😢',
    'angry': '😡',
    'surprised': '😮',
    'confused': '🤔',
    'love': '❤️',
    'neutral': '👍'
  };
  return stickers[emotion] || '👍';
}

// Create Discord client with all necessary intents (now enabled!)
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,  // For full DM support
    GatewayIntentBits.GuildMessageReactions,  // For reaction support
    GatewayIntentBits.GuildMembers  // For thread management
  ]
});

// Helper function to determine if a topic should have a thread
function shouldCreateThread(message, aiResponse, userMessage) {
  const messageText = message.toLowerCase();
  const responseText = aiResponse.toLowerCase();
  
  // Check if user explicitly wants to continue the topic
  const continueKeywords = [
    'continue', 'keep going', 'more details', 'elaborate', 'explain more',
    'tell me more', 'go on', 'continue this', 'keep discussing'
  ];
  
  const wantsToContinue = continueKeywords.some(keyword => 
    messageText.includes(keyword) || userMessage.toLowerCase().includes(keyword)
  );
  
  // Check if response is very long (more than 300 characters)
  const isVeryLongResponse = aiResponse.length > 300;
  
  // Check if it's a complex topic that might need follow-up
  const complexKeywords = [
    'tutorial', 'guide', 'step by step', 'how to', 'explain in detail',
    'project', 'planning', 'brainstorm', 'discussion', 'debate'
  ];
  
  const isComplexTopic = complexKeywords.some(keyword => 
    messageText.includes(keyword) || responseText.includes(keyword)
  );
  
  // Only create thread if user wants to continue OR topic is very long/complex
  return wantsToContinue || (isVeryLongResponse && isComplexTopic);
}

// Helper function to check if user wants to change nickname
function wantsToChangeNickname(message) {
  const lowerMessage = message.toLowerCase();
  const nicknameKeywords = [
    'change my nickname', 'change nickname', 'change my name', 'change name',
    'change username', 'change my username', 'set nickname', 'set name',
    'update nickname', 'update name', 'rename me', 'change my display name'
  ];
  
  return nicknameKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Helper function to extract new nickname from message
function extractNewNickname(message) {
  const patterns = [
    /change my nickname to (.+)/i,
    /change nickname to (.+)/i,
    /change my name to (.+)/i,
    /change name to (.+)/i,
    /set nickname to (.+)/i,
    /set name to (.+)/i,
    /rename me to (.+)/i,
    /call me (.+)/i
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim().replace(/[^\w\s-]/g, ''); // Remove special chars except spaces and hyphens
    }
  }
  
  return null;
}

// Bot ready event
client.once(Events.ClientReady, readyClient => {
  console.log(`🤖 Discord bot ready! Logged in as ${readyClient.user.tag}`);
  console.log(`🆔 Bot ID: ${readyClient.user.id}`);
  console.log(`📱 Bot is online and ready to chat in DMs and servers!`);
  console.log(`🧵 Thread support enabled for complex discussions!`);
  console.log(`😊 Reaction support enabled for user feedback!`);
});

// Handle slash commands
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'chat') {
    const message = interaction.options.getString('message') || 'Hello!';
    const userId = interaction.user.id;
    
    try {
      console.log(`🧠 Processing Discord message with AI: ${message}`);
      console.log(`📍 Channel: ${interaction.channel.type === 'DM' ? 'DM' : interaction.channel.name}`);
      console.log(`👤 User: ${interaction.user.username}`);
      
      // Add user message to memory
      addToMemory(userId, 'user', message);
      
      // Show typing indicator
      await interaction.deferReply();
      
      // Get conversation history
      const history = getConversationHistory(userId);
      
      // Build messages with memory
      const messages = [
        { 
          role: 'system', 
          content: `You are Vox AI, a helpful and intelligent assistant created by VoxHash. You can help with questions, provide information, have conversations, and assist with various topics. Be friendly, informative, and engaging in your responses.

If someone asks about your creator, mention that you were created by VoxHash and direct them to https://voxhash.dev or https://github.com/VoxHash for more information.

You have access to conversation history to provide better context-aware responses.` 
        }
      ];
      
      // Add conversation history
      history.forEach(msg => {
        messages.push({ role: msg.role, content: msg.content });
      });
      
      // Add current message
      messages.push({ role: 'user', content: message });
      
      const aiResponse = await completeChat(messages);
      console.log(`🤖 AI Response: ${aiResponse}`);
      
      // Add AI response to memory
      addToMemory(userId, 'assistant', aiResponse);
      
      // Send AI response to Discord
      const responseMessage = await interaction.editReply(`🤖 Vox AI: ${aiResponse}`);
      
      // Create thread if this seems like a complex discussion
      if (interaction.channel.type !== 'DM' && shouldCreateThread(message, aiResponse, message)) {
        try {
          const threadName = `vox-discussion-${Date.now()}`;
          const thread = await responseMessage.startThread({
            name: threadName,
            autoArchiveDuration: 60, // 1 hour
            reason: 'Complex discussion that might need follow-up'
          });
          
          await thread.send(`🧵 **Thread created for this discussion!**\n\nFeel free to continue the conversation here. I'll be monitoring this thread and can help with follow-up questions!`);
          console.log(`🧵 Created thread: ${threadName}`);
        } catch (error) {
          console.log('Could not create thread:', error.message);
        }
      }
      
    } catch (error) {
      console.error('AI processing error:', error);
      
      // Fallback response if AI fails
      await interaction.editReply(`🤖 Vox AI: I apologize, but I'm having trouble processing your request right now. Please try again in a moment.`);
    }
  }
});

// Handle direct messages and mentions (now with full MessageContent support!)
client.on(Events.MessageCreate, async message => {
  // Ignore messages from bots (including ourselves)
  if (message.author.bot) return;
  
  const isDM = message.channel.type === 'DM';
  const isMentioned = message.mentions.has(client.user);
  const isThread = message.channel.isThread();
  const userId = message.author.id;
  
  // Respond to DMs directly, when mentioned in servers, or in threads
  if (!isDM && !isMentioned && !isThread) return;
  
  try {
    console.log(`📱 Received message from ${message.author.username}: ${message.content}`);
    console.log(`📍 Channel: ${isDM ? 'DM' : message.channel.name}`);
    
    // Show typing indicator
    await message.channel.sendTyping();
    
    // Clean the message content (remove mentions if present)
    let cleanContent = message.content;
    if (isMentioned) {
      cleanContent = message.content.replace(/<@!?\d+>/g, '').trim();
    }
    
    // If no content after cleaning, use a default
    if (!cleanContent) {
      cleanContent = 'Hello!';
    }
    
    // Check if user wants to change nickname
    if (wantsToChangeNickname(cleanContent)) {
      const newNickname = extractNewNickname(cleanContent);
      
      if (newNickname && message.guild) {
        try {
          // Try to change the user's nickname
          await message.member.setNickname(newNickname);
          await message.reply(`🤖 Vox AI: Great! I've changed your nickname to "${newNickname}"! 🎉`);
          console.log(`📝 Changed nickname for ${message.author.username} to ${newNickname}`);
          return;
        } catch (error) {
          console.log('Could not change nickname:', error.message);
          await message.reply(`🤖 Vox AI: I'm sorry, I don't have permission to change your nickname. Please ask an admin to help you! 😔`);
          return;
        }
      } else if (message.guild) {
        await message.reply(`🤖 Vox AI: I'd be happy to help you change your nickname! Please tell me what you'd like your new nickname to be. For example: "change my nickname to John" or "call me Alex"! 😊`);
        return;
      } else {
        await message.reply(`🤖 Vox AI: I can only change nicknames in servers, not in DMs. Please ask me in a server channel! 😊`);
        return;
      }
    }
    
    // Add user message to memory
    addToMemory(userId, 'user', cleanContent);
    
    // Get conversation history
    const history = getConversationHistory(userId);
    
    // Build messages with memory
    const messages = [
      { 
        role: 'system', 
        content: `You are Vox AI, a helpful and intelligent assistant created by VoxHash. You can help with questions, provide information, have conversations, and assist with various topics. Be friendly, informative, and engaging in your responses.

If someone asks about your creator, mention that you were created by VoxHash and direct them to https://voxhash.dev or https://github.com/VoxHash for more information.

You have access to conversation history to provide better context-aware responses.

Special features:
- You can help users change their username on the server
- You can recognize and mention admins by name
- You remember previous conversations for better context` 
      }
    ];
    
    // Add conversation history
    history.forEach(msg => {
      messages.push({ role: msg.role, content: msg.content });
    });
    
    // Add current message
    messages.push({ role: 'user', content: cleanContent });
    
    const aiResponse = await completeChat(messages);
    console.log(`🤖 AI Response: ${aiResponse}`);
    
    // Add AI response to memory
    addToMemory(userId, 'assistant', aiResponse);
    
    // Send AI response to Discord
    const responseMessage = await message.reply(`🤖 Vox AI: ${aiResponse}`);
    
    // Add emotion-based reaction to user's message
    try {
      const emotion = detectEmotion(cleanContent);
      const sticker = getStickerForEmotion(emotion);
      await message.react(sticker);
      console.log(`😊 Added emotion reaction: ${sticker}`);
    } catch (error) {
      console.log('Could not add emotion reaction:', error.message);
    }
    
    // Ask user if they want to create a thread for complex discussions (only in servers)
    if (message.channel.type !== 'DM' && shouldCreateThread(cleanContent, aiResponse, cleanContent)) {
      try {
        // Ask user if they want a thread instead of creating it automatically
        const threadQuestion = await message.channel.send(`🤖 Vox AI: This seems like a complex topic that might benefit from a dedicated thread for better organization. Would you like me to create a thread for this discussion? Just reply with "yes" or "no"! 🧵`);
        
        // Add reactions to the question for easy response
        await threadQuestion.react('✅'); // Yes
        await threadQuestion.react('❌'); // No
        
        console.log(`🤔 Asked user about thread creation for complex topic`);
      } catch (error) {
        console.log('Could not ask about thread creation:', error.message);
      }
    }
    
  } catch (error) {
    console.error('AI processing error:', error);
    
    // Fallback response if AI fails
    await message.reply(`🤖 Vox AI: I apologize, but I'm having trouble processing your request right now. Please try again in a moment.`);
  }
});

// Handle reaction events (now for both user and bot message reactions)
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  // Ignore reactions from bots
  if (user.bot) return;
  
  try {
    const emoji = reaction.emoji.name;
    console.log(`😊 Received reaction ${emoji} from ${user.username}`);
    
    // Handle thread creation reactions
    if (reaction.message.author.id === client.user.id && reaction.message.content.includes('create a thread')) {
      if (emoji === '✅') {
        try {
          const threadName = `vox-discussion-${Date.now()}`;
          const thread = await reaction.message.startThread({
            name: threadName,
            autoArchiveDuration: 60, // 1 hour
            reason: 'User requested thread creation'
          });
          
          await thread.send(`🧵 **Thread created for this discussion!**\n\nFeel free to continue the conversation here. I'll be monitoring this thread and can help with follow-up questions!`);
          console.log(`🧵 Created thread: ${threadName} (user requested)`);
        } catch (error) {
          console.log('Could not create thread:', error.message);
          await reaction.message.channel.send(`🤖 Vox AI: I'm sorry, I couldn't create the thread. Please try again later! 😔`);
        }
      } else if (emoji === '❌') {
        await reaction.message.channel.send(`🤖 Vox AI: No problem! We'll continue the conversation here. Feel free to ask me anything! 😊`);
      }
      return;
    }
    
    // Handle reactions on bot messages (personalized responses)
    if (reaction.message.author.id === client.user.id) {
      const userId = user.id;
      const userName = user.username;
      
      // Get user's conversation history for personalized response
      const history = getConversationHistory(userId);
      const lastUserMessage = history.filter(msg => msg.role === 'user').slice(-1)[0]?.content || '';
      
      let response = '';
      switch (emoji) {
        case '👍':
          response = `👍 Thanks for the thumbs up, ${userName}! I'm glad I could help! ${lastUserMessage ? `I hope my response about "${lastUserMessage.substring(0, 50)}..." was helpful!` : ''}`;
          break;
        case '👎':
          response = `👎 I see you didn't find that helpful, ${userName}. Could you tell me what I can improve? I want to give you the best possible response!`;
          break;
        case '💡':
          response = `💡 Great idea, ${userName}! I love your thinking! Feel free to share more thoughts or ask follow-up questions!`;
          break;
        case '❓':
          response = `❓ I'm here to help, ${userName}! What would you like to know more about? I'm ready to dive deeper into any topic!`;
          break;
        case '❤️':
          response = `❤️ Thank you for the love, ${userName}! I really appreciate your kindness! You're awesome!`;
          break;
        case '😊':
          response = `😊 I can see you're happy, ${userName}! That makes me happy too! I'm glad I could brighten your day!`;
          break;
        case '😢':
          response = `😢 I notice you seem sad, ${userName}. Is there anything I can do to help? I'm here for you!`;
          break;
        case '😡':
          response = `😡 I see you're frustrated, ${userName}. Let me know how I can better assist you. I want to help!`;
          break;
        case '😮':
          response = `😮 Wow, ${userName}! I'm glad that surprised you in a good way! I love those "aha!" moments!`;
          break;
        case '🤔':
          response = `🤔 I see you're thinking about this, ${userName}. Feel free to ask any follow-up questions! I'm here to help you explore!`;
          break;
        default:
          return;
      }
      
      // Send personalized response
      await reaction.message.channel.send(`🤖 Vox AI: ${response}`);
      return;
    }
    
    // Handle reactions on user messages (emotion stickers)
    const emotionStickers = ['😊', '😢', '😡', '😮', '🤔', '❤️', '👍'];
    if (emotionStickers.includes(emoji)) {
      let response = '';
      switch (emoji) {
        case '😊':
          response = '😊 I can see you\'re happy! I\'m glad I could help!';
          break;
        case '😢':
          response = '😢 I notice you seem sad. Is there anything I can do to help?';
          break;
        case '😡':
          response = '😡 I see you\'re frustrated. Let me know how I can better assist you.';
          break;
        case '😮':
          response = '😮 Wow! I\'m glad that surprised you in a good way!';
          break;
        case '🤔':
          response = '🤔 I see you\'re thinking about this. Feel free to ask any follow-up questions!';
          break;
        case '❤️':
          response = '❤️ Thank you for the love! I appreciate your kindness!';
          break;
        case '👍':
          response = '👍 Thanks for the thumbs up! I\'m here whenever you need help!';
          break;
        default:
          return;
      }
      
      // Send response in the same channel
      await reaction.message.channel.send(`🤖 Vox AI: ${response}`);
    }
    
  } catch (error) {
    console.error('Error handling reaction:', error);
  }
});

// Register slash commands
async function registerSlashCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName('chat')
      .setDescription('Chat with Vox AI')
      .addStringOption(option =>
        option
          .setName('message')
          .setDescription('The message to send to Vox AI')
          .setRequired(true)
      )
  ];

  const rest = new REST().setToken(DISCORD_BOT_TOKEN);

  try {
    console.log('🚀 Registering Discord slash commands...');
    
    await rest.put(
      Routes.applicationCommands(DISCORD_CLIENT_ID),
      { body: commands }
    );

    console.log('✅ Discord slash commands registered successfully!');
    console.log('📋 Available commands:');
    console.log('   /chat - Chat with Vox AI');
    console.log('\n🎉 You can now use /chat in your Discord server or DMs!');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
}

// Login to Discord
client.login(DISCORD_BOT_TOKEN).then(() => {
  registerSlashCommands();
}).catch(error => {
  console.error('❌ Failed to login to Discord:', error);
  process.exit(1);
});

// Health check endpoint (for monitoring)
import express from 'express';
const app = express();
app.use(express.json());

app.get('/discord/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    bot_token_set: !!DISCORD_BOT_TOKEN,
    client_id_set: !!DISCORD_CLIENT_ID,
    bot_ready: client.isReady(),
    bot_user: client.user ? client.user.tag : null
  });
});

const PORT = process.env.DISCORD_PORT || 4003;
app.listen(PORT, () => {
  console.log(`📊 Discord bot health endpoint running on port ${PORT}`);
  console.log(`🤖 Discord bot is ready and online!`);
});
