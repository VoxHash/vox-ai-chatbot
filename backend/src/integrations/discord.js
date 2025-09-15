import 'dotenv/config';
import { Client, GatewayIntentBits, Events, SlashCommandBuilder, REST, Routes } from 'discord.js';
import { completeChat } from '../ai/openai.js';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

if (!DISCORD_BOT_TOKEN) {
  console.log('DISCORD_BOT_TOKEN not set. Discord integration disabled.');
  process.exit(0);
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
function shouldCreateThread(message, aiResponse) {
  const threadKeywords = [
    'discussion', 'debate', 'conversation', 'long', 'detailed', 'complex',
    'project', 'planning', 'brainstorm', 'ideas', 'suggestions', 'feedback',
    'help me with', 'can you help', 'need assistance', 'tutorial', 'guide',
    'explain', 'how to', 'what is', 'why', 'when', 'where', 'how'
  ];
  
  const messageText = message.toLowerCase();
  const responseText = aiResponse.toLowerCase();
  
  // Check if message or response suggests a longer conversation
  const hasThreadKeywords = threadKeywords.some(keyword => 
    messageText.includes(keyword) || responseText.includes(keyword)
  );
  
  // Check if response is long (more than 200 characters)
  const isLongResponse = aiResponse.length > 200;
  
  // Check if it's a question that might need follow-up
  const isQuestion = messageText.includes('?') || messageText.includes('how') || messageText.includes('what');
  
  return hasThreadKeywords || isLongResponse || isQuestion;
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
    
    try {
      console.log(`🧠 Processing Discord message with AI: ${message}`);
      console.log(`📍 Channel: ${interaction.channel.type === 'DM' ? 'DM' : interaction.channel.name}`);
      console.log(`👤 User: ${interaction.user.username}`);
      
      // Show typing indicator
      await interaction.deferReply();
      
      const messages = [
        { 
          role: 'system', 
          content: 'You are Vox AI, a helpful and intelligent assistant. You can help with questions, provide information, have conversations, and assist with various topics. Be friendly, informative, and engaging in your responses.' 
        },
        { 
          role: 'user', 
          content: message 
        }
      ];
      
      const aiResponse = await completeChat(messages);
      console.log(`🤖 AI Response: ${aiResponse}`);
      
      // Send AI response to Discord
      const responseMessage = await interaction.editReply(`🤖 Vox AI: ${aiResponse}`);
      
      // Add reactions to the response (if permissions allow)
      try {
        await responseMessage.react('👍');
        await responseMessage.react('👎');
        await responseMessage.react('💡');
        await responseMessage.react('❓');
        console.log('😊 Added reactions to message');
      } catch (error) {
        console.log('Could not add reactions (intent not enabled):', error.message);
        // Add text-based feedback instead
        await responseMessage.edit(`${responseMessage.content}\n\n*💡 Tip: React with 👍 👎 💡 ❓ for feedback!*`);
      }
      
      // Create thread if this seems like a complex discussion
      if (interaction.channel.type !== 'DM' && shouldCreateThread(message, aiResponse)) {
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
    
    const messages = [
      { 
        role: 'system', 
        content: 'You are Vox AI, a helpful and intelligent assistant. You can help with questions, provide information, have conversations, and assist with various topics. Be friendly, informative, and engaging in your responses.' 
      },
      { 
        role: 'user', 
        content: cleanContent 
      }
    ];
    
    const aiResponse = await completeChat(messages);
    console.log(`🤖 AI Response: ${aiResponse}`);
    
    // Send AI response to Discord
    const responseMessage = await message.reply(`🤖 Vox AI: ${aiResponse}`);
    
    // Add reactions to the response (if permissions allow)
    try {
      await responseMessage.react('👍');
      await responseMessage.react('👎');
      await responseMessage.react('💡');
      await responseMessage.react('❓');
      console.log('😊 Added reactions to message');
    } catch (error) {
      console.log('Could not add reactions (intent not enabled):', error.message);
      // Add text-based feedback instead
      await responseMessage.edit(`${responseMessage.content}\n\n*💡 Tip: React with 👍 👎 💡 ❓ for feedback!*`);
    }
    
    // Create thread if this seems like a complex discussion (only in servers)
    if (message.channel.type !== 'DM' && shouldCreateThread(cleanContent, aiResponse)) {
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
    await message.reply(`🤖 Vox AI: I apologize, but I'm having trouble processing your request right now. Please try again in a moment.`);
  }
});

// Handle reaction events
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  // Ignore reactions from bots
  if (user.bot) return;
  
  // Only respond to reactions on our messages
  if (reaction.message.author.id !== client.user.id) return;
  
  try {
    const emoji = reaction.emoji.name;
    console.log(`😊 Received reaction ${emoji} from ${user.username}`);
    
    let response = '';
    switch (emoji) {
      case '👍':
        response = '😊 Thanks for the positive feedback! I\'m glad I could help!';
        break;
      case '👎':
        response = '😔 I\'m sorry my response wasn\'t helpful. Could you tell me what I can improve?';
        break;
      case '💡':
        response = '💡 Great idea! Feel free to share more thoughts or ask follow-up questions!';
        break;
      case '❓':
        response = '❓ I\'m here to help! What would you like to know more about?';
        break;
      default:
        return; // Don't respond to other reactions
    }
    
    // Send response in the same channel
    await reaction.message.channel.send(`🤖 Vox AI: ${response}`);
    
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
});
