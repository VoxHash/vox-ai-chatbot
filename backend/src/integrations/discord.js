import 'dotenv/config';
import { Client, GatewayIntentBits, Events, SlashCommandBuilder, REST, Routes } from 'discord.js';
import { completeChat } from '../ai/openai.js';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

if (!DISCORD_BOT_TOKEN) {
  console.log('DISCORD_BOT_TOKEN not set. Discord integration disabled.');
  process.exit(0);
}

// Create Discord client with basic intents (MessageContent requires special approval)
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages
  ]
});

// Bot ready event
client.once(Events.ClientReady, readyClient => {
  console.log(`🤖 Discord bot ready! Logged in as ${readyClient.user.tag}`);
  console.log(`🆔 Bot ID: ${readyClient.user.id}`);
  console.log(`📱 Bot is online and ready to chat in DMs and servers!`);
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
      await interaction.editReply(`🤖 Vox AI: ${aiResponse}`);
      
    } catch (error) {
      console.error('AI processing error:', error);
      
      // Fallback response if AI fails
      await interaction.editReply(`🤖 Vox AI: I apologize, but I'm having trouble processing your request right now. Please try again in a moment.`);
    }
  }
});

// Handle direct messages (only when bot is mentioned - requires MessageContent intent for full DM support)
client.on(Events.MessageCreate, async message => {
  // Ignore messages from bots (including ourselves)
  if (message.author.bot) return;
  
  // Only respond if bot is mentioned (works without MessageContent intent)
  const isMentioned = message.mentions.has(client.user);
  
  if (!isMentioned) return;
  
  try {
    console.log(`📱 Received mention from ${message.author.username}: ${message.content}`);
    console.log(`📍 Channel: ${message.channel.type === 'DM' ? 'DM' : message.channel.name}`);
    
    // Show typing indicator
    await message.channel.sendTyping();
    
    // Remove the mention from the message content
    const cleanContent = message.content.replace(/<@!?\d+>/g, '').trim();
    
    const messages = [
      { 
        role: 'system', 
        content: 'You are Vox AI, a helpful and intelligent assistant. You can help with questions, provide information, have conversations, and assist with various topics. Be friendly, informative, and engaging in your responses.' 
      },
      { 
        role: 'user', 
        content: cleanContent || 'Hello!' 
      }
    ];
    
    const aiResponse = await completeChat(messages);
    console.log(`🤖 AI Response: ${aiResponse}`);
    
    // Send AI response to Discord
    await message.reply(`🤖 Vox AI: ${aiResponse}`);
    
  } catch (error) {
    console.error('AI processing error:', error);
    
    // Fallback response if AI fails
    await message.reply(`🤖 Vox AI: I apologize, but I'm having trouble processing your request right now. Please try again in a moment.`);
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
