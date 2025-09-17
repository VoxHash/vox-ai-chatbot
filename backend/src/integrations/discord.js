import 'dotenv/config';
import { Client, GatewayIntentBits, Events, SlashCommandBuilder, REST, Routes } from 'discord.js';
import { completeChat } from '../ai/openai.js';
import { 
  loadUserMemory, 
  addToUserMemory, 
  getConversationSummary, 
  detectLanguage, 
  hasUserBeenGreeted,
  getUserPreferredLanguage 
} from '../lib/memory.js';
import { getLocalizedResponse, getSystemPrompt } from '../lib/language.js';
import { getCurrentTime, getCurrentWeather, getLocationInfo, formatLocationInfo } from '../lib/realtime.js';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;

if (!DISCORD_BOT_TOKEN) {
  console.log('DISCORD_BOT_TOKEN not set. Discord integration disabled.');
  process.exit(0);
}

if (!DISCORD_CLIENT_ID) {
  console.log('DISCORD_CLIENT_ID not set. Discord integration disabled.');
  process.exit(0);
}

// Memory system for conversation context
const conversationMemory = new Map();

// Rate limiting to prevent duplicate processing
const processingUsers = new Set();
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
  if (lowerText.includes('😮') || lowerText.includes('wow') || lowerText.includes('amazing') || lowerText.includes('incredible') || lowerText.includes('excited')) {
    return 'excited';
  }
  if (lowerText.includes('😕') || lowerText.includes('confused') || lowerText.includes('huh') || lowerText.includes('what')) {
    return 'confused';
  }
  return 'neutral';
}

// Helper function to get emoji for emotion
function getStickerForEmotion(emotion) {
  const stickers = {
    'happy': '😊',
    'sad': '😢',
    'angry': '😡',
    'excited': '😮',
    'confused': '😕',
    'neutral': '👍'
  };
  return stickers[emotion] || '👍';
}

// Helper function to generate personalized thread title
function generateThreadTitle(message, aiResponse) {
  const messageText = message.toLowerCase();
  const responseText = aiResponse.toLowerCase();
  
  // Extract key topics from the message
  const topics = [];
  
  // Check for specific topics
  if (messageText.includes('programming') || messageText.includes('code') || messageText.includes('development') || messageText.includes('php') || messageText.includes('javascript') || messageText.includes('python')) {
    topics.push('Programming');
  }
  if (messageText.includes('ai') || messageText.includes('artificial intelligence')) {
    topics.push('AI');
  }
  if (messageText.includes('discord') || messageText.includes('bot')) {
    topics.push('Discord Bot');
  }
  if (messageText.includes('help') || messageText.includes('question')) {
    topics.push('Q&A');
  }
  if (messageText.includes('project') || messageText.includes('planning')) {
    topics.push('Project');
  }
  if (messageText.includes('tutorial') || messageText.includes('guide')) {
    topics.push('Tutorial');
  }
  if (messageText.includes('anime') || messageText.includes('manga')) {
    topics.push('Anime');
  }
  if (messageText.includes('food') || messageText.includes('cooking') || messageText.includes('recipe') || messageText.includes('pasta') || messageText.includes('sandwich')) {
    topics.push('Food');
  }
  if (messageText.includes('movie') || messageText.includes('film') || messageText.includes('cinema')) {
    topics.push('Movies');
  }
  if (messageText.includes('game') || messageText.includes('gaming') || messageText.includes('gta') || messageText.includes('video game')) {
    topics.push('Gaming');
  }
  if (messageText.includes('music') || messageText.includes('song') || messageText.includes('band')) {
    topics.push('Music');
  }
  if (messageText.includes('sport') || messageText.includes('football') || messageText.includes('basketball') || messageText.includes('soccer')) {
    topics.push('Sports');
  }
  if (messageText.includes('travel') || messageText.includes('vacation') || messageText.includes('trip')) {
    topics.push('Travel');
  }
  if (messageText.includes('book') || messageText.includes('reading') || messageText.includes('novel')) {
    topics.push('Books');
  }
  if (messageText.includes('science') || messageText.includes('technology') || messageText.includes('tech')) {
    topics.push('Science & Tech');
  }
  
  // If we found specific topics, use them
  if (topics.length > 0) {
    return topics.join(' & ') + ' Discussion';
  }
  
  // Extract first few meaningful words from the message as fallback
  const words = message.split(' ').filter(word => 
    word.length > 2 && 
    !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'make', 'create', 'discussion', 'thread'].includes(word.toLowerCase())
  ).slice(0, 3);
  
  if (words.length > 0) {
    const cleanWords = words.join(' ').replace(/[^\w\s]/g, '').trim();
    if (cleanWords.length > 0) {
      return cleanWords + ' Discussion';
    }
  }
  
  // Final fallback
  return 'General Discussion';
}

// Helper function to get user display name (nickname or username)
function getUserDisplayName(member) {
  if (member && member.nickname) {
    return member.nickname;
  }
  return member ? member.user.username : 'User';
}

// Helper function to generate welcome message
function generateWelcomeMessage(username) {
  const welcomeMessages = [
    `Welcome to the server, ${username}! 🎉 I'm Vox AI, your helpful assistant. Feel free to ask me anything!`,
    `Hey there, ${username}! 👋 Great to have you here! I'm Vox AI and I'm here to help with any questions you might have.`,
    `Welcome aboard, ${username}! 🚀 I'm Vox AI, your friendly neighborhood bot. Don't hesitate to reach out if you need assistance!`,
    `Hello ${username}! 😊 I'm Vox AI, and I'm excited to help you with whatever you need. Welcome to the community!`,
    `Hi ${username}! 🌟 Welcome to the server! I'm Vox AI, your personal assistant. Feel free to chat with me anytime!`
  ];
  
  return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
}

// Create Discord client with all necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers
  ]
});

// Bot ready event
client.once(Events.ClientReady, readyClient => {
  console.log(`🤖 Discord bot ready! Logged in as ${readyClient.user.tag}`);
  console.log(`🆔 Bot ID: ${readyClient.user.id}`);
  console.log(`📱 Bot is online and ready to chat in DMs and servers!`);
  console.log(`🧵 Thread support enabled for complex discussions!`);
  console.log(`😊 Reaction support enabled for user feedback!`);
  console.log(`👋 Welcome messages enabled for new members!`);
});

// Handle slash commands
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'chat') {
    const message = interaction.options.getString('message') || 'Hello!';
    const userId = interaction.user.id;
    
    // Check if interaction is already being processed
    if (interaction.replied || interaction.deferred) {
      console.log('⚠️ Interaction already processed, skipping...');
      return;
    }
    
    // Rate limiting - prevent duplicate processing
    if (processingUsers.has(userId)) {
      console.log('⚠️ User already being processed, skipping...');
      return;
    }
    
    processingUsers.add(userId);
    
    try {
      console.log(`🧠 Processing Discord message with AI: ${message}`);
      console.log(`📍 Channel: ${interaction.channel ? (interaction.channel.type === 'DM' ? 'DM' : interaction.channel.name) : 'Unknown'}`);
      console.log(`👤 User: ${interaction.user.username}`);
      
      // Detect language from current message and conversation history
      const detectedLanguage = await detectLanguage(userId, 'discord', message);
      console.log(`🌍 Detected language: ${detectedLanguage}`);
      
      // Add user message to persistent memory
      await addToUserMemory(userId, 'discord', 'user', message, { platform: 'discord' });
      
      // Defer reply first to prevent timeout
      await interaction.deferReply();
      
      // Check for time-related questions
      const lowerContent = message.toLowerCase();
      const isTimeQuestion = lowerContent.includes('what time') || lowerContent.includes('current time') || 
                            lowerContent.includes('hora actual') || lowerContent.includes('heure actuelle') ||
                            lowerContent.includes('aktuelle zeit') || lowerContent.includes('ora attuale') ||
                            lowerContent.includes('hora atual') || lowerContent.includes('time in') ||
                            lowerContent.includes('hora en') || lowerContent.includes('heure à') ||
                            lowerContent.includes('zeit in') || lowerContent.includes('ora a') ||
                            lowerContent.includes('hora em') || lowerContent.includes('quelle heure') ||
                            lowerContent.includes('que hora') || lowerContent.includes('welche uhrzeit') ||
                            lowerContent.includes('che ora') || lowerContent.includes('que horas');
      
      // Check for weather-related questions
      const isWeatherQuestion = lowerContent.includes('weather') || lowerContent.includes('temperature') || 
                               lowerContent.includes('clima') || lowerContent.includes('météo') ||
                               lowerContent.includes('wetter') || lowerContent.includes('tempo') ||
                               lowerContent.includes('temperatura') || lowerContent.includes('température') ||
                               lowerContent.includes('temperatur') || lowerContent.includes('temperatura') ||
                               lowerContent.includes('rain') || lowerContent.includes('lluvia') ||
                               lowerContent.includes('pluie') || lowerContent.includes('regen') ||
                               lowerContent.includes('pioggia') || lowerContent.includes('chuva') ||
                               lowerContent.includes('fecha') || lowerContent.includes('date') ||
                               lowerContent.includes('aujourd\'hui') || lowerContent.includes('heute') ||
                               lowerContent.includes('oggi') || lowerContent.includes('hoje');
      
      // Check for location-specific questions with more flexible patterns
      const locationPatterns = [
        // Pattern 1: "time/weather in [location]"
        /(?:time|weather|clima|météo|wetter|tempo|hora|heure|zeit|ora)\s+(?:in|en|à|a|em)\s+([^?.,!]+)/i,
        // Pattern 2: "what time is it in [location]"
        /(?:what time is it|hora actual|heure actuelle|aktuelle zeit|ora attuale|hora atual)\s+(?:in|en|à|a|em)\s+([^?.,!]+)/i,
        // Pattern 3: "weather in [location]"
        /(?:weather|clima|météo|wetter|tempo)\s+(?:in|en|à|a|em)\s+([^?.,!]+)/i,
        // Pattern 4: "current time in [location]"
        /(?:current time|hora actual|heure actuelle|aktuelle zeit|ora attuale|hora atual)\s+(?:in|en|à|a|em)\s+([^?.,!]+)/i
      ];
      
      let location = null;
      for (const pattern of locationPatterns) {
        const match = message.match(pattern);
        if (match) {
          location = match[1].trim();
          break;
        }
      }
      
      // Handle real-time queries
      if (isTimeQuestion || isWeatherQuestion) {
        console.log(`🌍 Real-time query detected: ${isTimeQuestion ? 'time' : 'weather'}${location ? ` for ${location}` : ' (no location specified)'}`);
        
        try {
          let response = '';
          
          if (isTimeQuestion && isWeatherQuestion) {
            // Both time and weather
            if (location) {
              const locationInfo = await getLocationInfo(location);
              response = formatLocationInfo(locationInfo, detectedLanguage);
            } else {
              // Server time and generic weather info
              const serverTime = new Date();
              const timeStr = serverTime.toLocaleString('en-US', {
                timeZone: 'UTC',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              });
              response = `🕐 ${getLocalizedResponse(detectedLanguage, 'time', { location: 'Server Time', time: timeStr, timezone: 'UTC' })}\n\n🌤️ ${getLocalizedResponse(detectedLanguage, 'weather', { location: 'Server Location', temperature: 'N/A', description: 'Weather data not available for server location' })}`;
            }
          } else if (isTimeQuestion) {
            // Time only
            if (location) {
              const timeInfo = await getCurrentTime(location);
              response = `🕐 ${getLocalizedResponse(detectedLanguage, 'time', { location: timeInfo.location, time: timeInfo.time, timezone: timeInfo.timezone })}`;
            } else {
              // Server time
              const serverTime = new Date();
              const timeStr = serverTime.toLocaleString('en-US', {
                timeZone: 'UTC',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              });
              response = `🕐 ${getLocalizedResponse(detectedLanguage, 'time', { location: 'Server Time', time: timeStr, timezone: 'UTC' })}`;
            }
          } else if (isWeatherQuestion) {
            // Weather only
            if (location) {
              const weatherInfo = await getCurrentWeather(location);
              response = `🌤️ ${getLocalizedResponse(detectedLanguage, 'weather', { location: weatherInfo.location, temperature: weatherInfo.temperature, description: weatherInfo.weather_description })}`;
            } else {
              // Generic weather response
              response = `🌤️ ${getLocalizedResponse(detectedLanguage, 'weather', { location: 'Server Location', temperature: 'N/A', description: 'Please specify a location for weather information' })}`;
            }
          }
          
          if (response) {
            await interaction.editReply(response);
            await addToUserMemory(userId, 'discord', 'assistant', response, { platform: 'discord' });
            return;
          }
        } catch (error) {
          console.error('Error handling real-time query:', error);
          // Continue to normal AI processing if real-time fails
        }
      }
      
      // Get conversation history from persistent memory
      const history = await loadUserMemory(userId, 'discord');
      const conversationSummary = await getConversationSummary(userId, 'discord', 10);
      
      // Get system prompt with proper language detection
      const systemPrompt = getSystemPrompt(detectedLanguage, interaction.user.username, conversationSummary);
      
      // Build messages with memory
      const messages = [
        { 
          role: 'system', 
          content: systemPrompt
        },
        ...history.slice(-10), // Use last 10 messages for context
        { role: 'user', content: message }
      ];
      
      const aiResponse = await completeChat(messages);
      console.log(`🤖 AI Response: ${aiResponse}`);
      
      // Add AI response to persistent memory
      await addToUserMemory(userId, 'discord', 'assistant', aiResponse, { platform: 'discord' });
      
      // Detect emotion in user's message and add reaction
      const emotion = detectEmotion(message);
      if (emotion && emotion !== 'neutral') {
        console.log(`😊 Detected emotion: ${emotion} in message: "${message}"`);
        const sticker = getStickerForEmotion(emotion);
        // Add reaction to the interaction
        try {
          await interaction.followUp({ content: `${sticker} *${emotion.charAt(0).toUpperCase() + emotion.slice(1)} detected!*`, ephemeral: true });
        } catch (error) {
          console.log('Could not add reaction:', error.message);
        }
      }
      
      // Check if user wants to create a thread
      const wantsThread = message.toLowerCase().includes('create thread') || 
                         message.toLowerCase().includes('make thread') ||
                         message.toLowerCase().includes('start thread') ||
                         message.toLowerCase().includes('thread about') ||
                         message.toLowerCase().includes('create discussion') ||
                         message.toLowerCase().includes('make discussion') ||
                         message.toLowerCase().includes('discussion');
      
      if (wantsThread && interaction.guild) {
        try {
          // Check if bot has permission to create threads
          const botMember = interaction.guild.members.cache.get(client.user.id);
          const hasPermission = interaction.channel.permissionsFor(botMember).has('CreatePublicThreads') || 
                               interaction.channel.permissionsFor(botMember).has('CreatePrivateThreads');
          
          if (!hasPermission) {
            console.log('Bot does not have permission to create threads');
            await interaction.editReply(`${aiResponse}\n\n⚠️ I don't have permission to create threads in this channel. Please ask an admin to give me the "Create Public Threads" and "Create Private Threads" permissions.`);
            return;
          }
          
          // Extract thread type (public/private)
          const isPrivate = message.toLowerCase().includes('private');
          const threadType = isPrivate ? 'private' : 'public';
          
          // Generate thread title
          const threadTitle = generateThreadTitle(message, aiResponse);
          
          console.log(`🧵 Attempting to create ${threadType} thread: ${threadTitle}`);
          
          // Create thread
          const thread = await interaction.channel.threads.create({
            name: threadTitle,
            type: isPrivate ? 12 : 11, // 12 = private thread, 11 = public thread
            reason: `Thread created by ${interaction.user.username} for: ${message}`,
            autoArchiveDuration: 60 // Auto-archive after 1 hour
          });
          
          console.log(`✅ Created ${threadType} thread: ${threadTitle}`);
          
          // Send AI response with thread info
          await interaction.editReply(`${aiResponse}\n\n🧵 **Created ${threadType} thread: ${threadTitle}**\nYou can continue the discussion there!`);
          
          // Send welcome message in thread
          try {
            await thread.send(`Welcome to the ${threadType} thread! Feel free to continue discussing "${message}" here. I'll be monitoring and can help with follow-up questions!`);
            console.log(`✅ Sent welcome message to thread: ${threadTitle}`);
          } catch (threadError) {
            console.error('Error sending message to thread:', threadError);
          }
          
        } catch (error) {
          console.error('Error creating thread:', error);
          await interaction.editReply(`${aiResponse}\n\n❌ Sorry, I couldn't create a thread. Error: ${error.message}`);
        }
      } else {
        // Send regular AI response
        await interaction.editReply(aiResponse);
      }
      
    } catch (error) {
      console.error('AI processing error:', error);
      
      // Fallback response if AI fails
      try {
        // Check if we already deferred the reply
        if (interaction.deferred) {
          await interaction.editReply(`I apologize, but I'm having trouble processing your request right now. Please try again in a moment.`);
        } else {
          await interaction.reply(`I apologize, but I'm having trouble processing your request right now. Please try again in a moment.`);
        }
      } catch (replyError) {
        console.error('Failed to send error reply:', replyError);
        // If all else fails, try followUp
        try {
          await interaction.followUp({ content: `I apologize, but I'm having trouble processing your request right now. Please try again in a moment.`, ephemeral: true });
        } catch (followUpError) {
          console.error('Failed to send followUp:', followUpError);
        }
      }
    } finally {
      // Remove user from processing set
      processingUsers.delete(userId);
    }
  }
});

// Handle direct messages and mentions
client.on(Events.MessageCreate, async message => {
  // Ignore messages from bots (including ourselves)
  if (message.author.bot) return;
  
  const isDM = message.channel.type === 'DM';
  const isMentioned = message.mentions.has(client.user);
  const isThread = message.channel.isThread();
  const userId = message.author.id;
  
  // Only process if it's a DM, mention, or thread
  if (!isDM && !isMentioned && !isThread) return;
  
  // Skip if this is a slash command (it will be handled by InteractionCreate)
  if (message.content.startsWith('/')) return;
  
  const messageText = message.content;
  let cleanText = messageText;
  
  // Remove mention if present
  if (isMentioned) {
    cleanText = messageText.replace(/<@!?(\d+)>/g, '').trim();
  }
  
  // Skip empty messages
  if (!cleanText) return;
  
  console.log(`📱 Processing message: "${cleanText}" from ${message.author.username}`);
  
  try {
    // Check if user is already being processed
    if (processingUsers.has(userId)) {
      console.log('⚠️ User already being processed, skipping...');
      return;
    }
    
    processingUsers.add(userId);
    
    // Detect language from current message and conversation history
    const detectedLanguage = await detectLanguage(userId, 'discord', cleanText);
    console.log(`🌍 Detected language: ${detectedLanguage}`);
    
    // Add user message to persistent memory
    await addToUserMemory(userId, 'discord', 'user', cleanText, { platform: 'discord' });
    
    // Get conversation history from persistent memory
    const history = await loadUserMemory(userId, 'discord');
    const conversationSummary = await getConversationSummary(userId, 'discord', 10);
    
    // Get user display name for personalization
    const displayName = message.member ? getUserDisplayName(message.member) : message.author.username;
    
    // Check for creator-related questions first (multilingual)
    const lowerContent = cleanText.toLowerCase();
    const isCreatorQuestion = lowerContent.includes('who made you') || lowerContent.includes('who created you') || 
                             lowerContent.includes('who built you') || lowerContent.includes('who developed you') || 
                             lowerContent.includes('who programmed you') || lowerContent.includes('quien te creo') ||
                             lowerContent.includes('quien te hizo') || lowerContent.includes('quien te programo') ||
                             lowerContent.includes('quien te desarrollo') || lowerContent.includes('quien te construyo') ||
                             lowerContent.includes('qui vous a créé') || lowerContent.includes('qui t\'a créé') ||
                             lowerContent.includes('wer hat dich erstellt') || lowerContent.includes('wer hat dich gemacht');

    if (isCreatorQuestion) {
      const creatorResponse = getLocalizedResponse(detectedLanguage, 'creator');
      console.log(`🤖 Creator question detected, responding directly: ${creatorResponse}`);
      await message.reply(creatorResponse);
      await addToUserMemory(userId, 'discord', 'assistant', creatorResponse, { platform: 'discord' });
      return;
    }
    
    // Show typing indicator
    await message.channel.sendTyping();
    
    // Get system prompt with proper language detection
    const systemPrompt = getSystemPrompt(detectedLanguage, displayName, conversationSummary);
    
    // Build messages with memory
    const messages = [
      { 
        role: 'system', 
        content: systemPrompt
      },
      ...history.slice(-10), // Use last 10 messages for context
      { role: 'user', content: cleanText }
    ];
    
    const aiResponse = await completeChat(messages);
    console.log(`🤖 AI Response: ${aiResponse}`);
    
    // Add AI response to persistent memory
    await addToUserMemory(userId, 'discord', 'assistant', aiResponse, { platform: 'discord' });
    
    // Detect emotion in user's message and add reaction
    const emotion = detectEmotion(cleanText);
    if (emotion && emotion !== 'neutral') {
      console.log(`😊 Detected emotion: ${emotion} in message: "${cleanText}"`);
      const sticker = getStickerForEmotion(emotion);
      try {
        await message.react(sticker);
      } catch (error) {
        console.log('Could not add reaction:', error.message);
      }
    }
    
    // Check if user wants to create a thread
    const wantsThread = cleanText.toLowerCase().includes('create thread') || 
                       cleanText.toLowerCase().includes('make thread') ||
                       cleanText.toLowerCase().includes('start thread') ||
                       cleanText.toLowerCase().includes('thread about') ||
                       cleanText.toLowerCase().includes('create discussion') ||
                       cleanText.toLowerCase().includes('make discussion') ||
                       cleanText.toLowerCase().includes('discussion');
    
    if (wantsThread && message.guild) {
      try {
        // Check if bot has permission to create threads
        const botMember = message.guild.members.cache.get(client.user.id);
        const hasPermission = message.channel.permissionsFor(botMember).has('CreatePublicThreads') || 
                             message.channel.permissionsFor(botMember).has('CreatePrivateThreads');
        
        if (!hasPermission) {
          console.log('Bot does not have permission to create threads');
          await message.reply(`${aiResponse}\n\n⚠️ I don't have permission to create threads in this channel. Please ask an admin to give me the "Create Public Threads" and "Create Private Threads" permissions.`);
          return;
        }
        
        // Extract thread type (public/private)
        const isPrivate = cleanText.toLowerCase().includes('private');
        const threadType = isPrivate ? 'private' : 'public';
        
        // Generate thread title
        const threadTitle = generateThreadTitle(cleanText, aiResponse);
        
        console.log(`🧵 Attempting to create ${threadType} thread: ${threadTitle}`);
        
        // Create thread
        const thread = await message.channel.threads.create({
          name: threadTitle,
          type: isPrivate ? 12 : 11, // 12 = private thread, 11 = public thread
          reason: `Thread created by ${message.author.username} for: ${cleanText}`,
          autoArchiveDuration: 60 // Auto-archive after 1 hour
        });
        
        console.log(`✅ Created ${threadType} thread: ${threadTitle}`);
        
        // Send AI response with thread info
        await message.reply(`${aiResponse}\n\n🧵 **Created ${threadType} thread: ${threadTitle}**\nYou can continue the discussion there!`);
        
        // Send welcome message in thread
        try {
          await thread.send(`Welcome to the ${threadType} thread! Feel free to continue discussing "${cleanText}" here. I'll be monitoring and can help with follow-up questions!`);
          console.log(`✅ Sent welcome message to thread: ${threadTitle}`);
        } catch (threadError) {
          console.error('Error sending message to thread:', threadError);
        }
        
      } catch (error) {
        console.error('Error creating thread:', error);
        await message.reply(`${aiResponse}\n\n❌ Sorry, I couldn't create a thread. Error: ${error.message}`);
      }
    } else {
      // Send regular AI response
      await message.reply(aiResponse);
    }
    
  } catch (error) {
    console.error('AI processing error:', error);
    // Fallback response if AI fails
    await message.reply(`I apologize, but I'm having trouble processing your request right now. Please try again in a moment.`);
  } finally {
    // Remove user from processing set
    processingUsers.delete(userId);
  }
});

// Handle reactions on bot messages
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  // Ignore reactions from bots
  if (user.bot) return;
  
  // Ignore partial reactions
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Error fetching reaction:', error);
      return;
    }
  }
  
  // Only handle reactions on bot messages
  if (reaction.message.author.id !== client.user.id) return;
  
  const emoji = reaction.emoji.name;
  const userId = user.id;
  
  // Get user's conversation history for personalized response
  const history = getConversationHistory(userId);
  const lastUserMessage = history.filter(msg => msg.role === 'user').slice(-1)[0]?.content || '';
  
  // Get user display name for personalization
  const displayName = reaction.message.guild ? 
    (reaction.message.guild.members.cache.get(userId)?.nickname || user.username) : 
    user.username;
  
  let response = '';
  switch (emoji) {
    case '👍':
      response = `😊 Thanks for the positive feedback, ${displayName}! I'm glad I could help! ${lastUserMessage ? `I hope my response about "${lastUserMessage.substring(0, 50)}..." was helpful!` : ''}`;
      break;
    case '👎':
      response = `😔 I see you didn't find that helpful, ${displayName}. Could you tell me what I can improve? I want to give you the best possible response!`;
      break;
    case '💡':
      response = `💡 Great idea, ${displayName}! I love your thinking! Feel free to share more thoughts or ask follow-up questions!`;
      break;
    case '❓':
      response = `❓ I'm here to help, ${displayName}! What would you like to know more about? I'm ready to dive deeper into any topic!`;
      break;
    default:
      response = `Thanks for your feedback, ${displayName}!`;
  }
  
  await reaction.message.reply(response);
});

// Handle new member joins
client.on(Events.GuildMemberAdd, async member => {
  try {
    // Find the general channel or first available text channel
    let welcomeChannel = member.guild.channels.cache.find(channel => 
      channel.name === 'general' && channel.type === 0
    );
    
    if (!welcomeChannel) {
      welcomeChannel = member.guild.channels.cache.find(channel => 
        channel.type === 0 && channel.permissionsFor(member.guild.members.me).has('SendMessages')
      );
    }
    
    if (welcomeChannel) {
      const welcomeMessage = generateWelcomeMessage(member.user.username);
      await welcomeChannel.send(welcomeMessage);
      console.log(`👋 Sent welcome message for ${member.user.username} in ${welcomeChannel.name}`);
    }
  } catch (error) {
    console.error('Error sending welcome message:', error);
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

console.log('🤖 Discord bot is ready and online!');
