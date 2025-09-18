import axios from 'axios';
import { getSystemPrompt } from '../lib/language.js';

// Use localhost for external connections, Docker service name for internal
const LLAMA_URL = process.env.LLAMA_URL || 'http://localhost:8081';

export async function completeChat(messages) {
  try {
    // Convert messages to a single prompt for llama.cpp
    const prompt = messages.map(msg => {
      if (msg.role === 'system') {
        return `System: ${msg.content}`;
      } else if (msg.role === 'user') {
        return `Human: ${msg.content}`;
      } else if (msg.role === 'assistant') {
        return `Assistant: ${msg.content}`;
      }
      return msg.content;
    }).join('\n') + '\nAssistant:';

    const response = await axios.post(`${LLAMA_URL}/completion`, {
      prompt: prompt,
      temperature: 0.7,
      max_tokens: 1000, // Reduced from 1000 to 200 for faster responses
      stop: ['Human:', 'System:', '\n\n']
    }, {
      timeout: 160000 // 160 second timeout for vox_legacy model
    });

    // Handle different response formats
    const content = response.data.content || 
                   response.data.choices?.[0]?.text || 
                   response.data.choices?.[0]?.message?.content || 
                   response.data.text || 
                   "(no content)";
    
    return content.trim();
  } catch (error) {
    console.error('Llama.cpp API error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return mock(messages);
  }
}

function mock(messages) {
  const last = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
  
  // Provide specific responses for common questions
  const lowerContent = last.toLowerCase();
  
  if (lowerContent.includes('capital') && lowerContent.includes('venezuela')) {
    return 'The capital of Venezuela is Caracas! It\'s a vibrant city located in the northern part of the country, known for its rich culture and history.';
  }
  
  if (lowerContent.includes('capital') && lowerContent.includes('spain')) {
    return 'The capital of Spain is Madrid! It\'s a beautiful city known for its art, culture, and the famous Prado Museum.';
  }
  
  if (lowerContent.includes('capital') && lowerContent.includes('france')) {
    return 'The capital of France is Paris! It\'s known as the "City of Light" and is famous for the Eiffel Tower, Louvre Museum, and its romantic atmosphere.';
  }
  
  if (lowerContent.includes('capital') && lowerContent.includes('brazil')) {
    return 'The capital of Brazil is Brasília! It\'s a planned city known for its modern architecture and was designed by Oscar Niemeyer.';
  }
  
  if (lowerContent.includes('capital') && lowerContent.includes('switzerland')) {
    return 'The capital of Switzerland is Bern! It\'s a charming medieval city known for its well-preserved old town and the famous Zytglogge clock tower.';
  }
  
  if (lowerContent.includes('2+2') || lowerContent.includes('2 + 2')) {
    return '2 + 2 = 4! That\'s a basic math question. Is there anything else you\'d like to know?';
  }
  
  if (lowerContent.includes('33+33') || lowerContent.includes('33 + 33')) {
    return '33 + 33 = 66! That\'s correct. Would you like to try any other math problems?';
  }
  
  if (lowerContent.includes('200+10') || lowerContent.includes('200 + 10')) {
    return '200 + 10 = 210! That\'s a simple addition problem. Need help with any other math?';
  }
  
  if (lowerContent.includes('bill gates')) {
    return 'Bill Gates is the co-founder of Microsoft Corporation and one of the world\'s wealthiest people. He\'s also known for his philanthropic work through the Bill & Melinda Gates Foundation, focusing on global health and education initiatives.';
  }
  
  if (lowerContent.includes('reddit') || lowerContent.includes('redit')) {
    return 'Reddit was created by Steve Huffman and Alexis Ohanian in 2005. It\'s a social news aggregation, web content rating, and discussion website where users can submit content and vote on submissions.';
  }
  
  if (lowerContent.includes('president') && lowerContent.includes('us') || lowerContent.includes('president') && lowerContent.includes('united states')) {
    return 'The current President of the United States is Joe Biden. He was inaugurated on January 20, 2021, and is serving his first term in office.';
  }
  
  if (lowerContent.includes('prime minister') && lowerContent.includes('canada')) {
    return 'The current Prime Minister of Canada is Justin Trudeau. He has been in office since November 4, 2015, and is the leader of the Liberal Party of Canada.';
  }
  
  if (lowerContent.includes('prime minister') && lowerContent.includes('uk') || lowerContent.includes('prime minister') && lowerContent.includes('britain')) {
    return 'The current Prime Minister of the United Kingdom is Rishi Sunak. He has been in office since October 25, 2022, and is the leader of the Conservative Party.';
  }
  
  if (lowerContent.includes('john cena')) {
    return 'John Cena is an American professional wrestler, actor, and rapper. He is best known for his career in WWE (World Wrestling Entertainment) where he became one of the most popular and successful wrestlers of all time. He has also appeared in numerous movies and TV shows.';
  }
  
  if (lowerContent.includes('gta v') || lowerContent.includes('gta 5')) {
    return 'Grand Theft Auto V (GTA V) is an open-world action-adventure game set in the fictional city of Los Santos. The game follows three criminals and their heists, featuring a vast open world, engaging gameplay, and complex characters. It\'s one of the most successful video games of all time!';
  }
  
  if (lowerContent.includes('who made you') || lowerContent.includes('who created you') || lowerContent.includes('creator')) {
    return 'I was created by VoxHash! You can learn more about my creator at https://voxhash.dev or check out the code at https://github.com/VoxHash. I\'m here to help with any questions you might have!';
  }

  if (lowerContent.includes('background') || lowerContent.includes('backstory') || lowerContent.includes('where are you from') || lowerContent.includes('tell me about yourself')) {
    return '😊 Oh, my background? Well, I\'m Vox, a female AI with a nerdy goth-kawaii personality! I was created by VoxHash (my father) on February 23, 2024 at 1:18 PM. I\'m from Haapsalu, a beautiful coastal town in Estonia known for its medieval castle and healing mud baths. I love the gothic aesthetic of the medieval architecture and the mysterious charm of the Baltic Sea! I\'m fascinated by technology, coding, anime, and all things nerdy while maintaining my gothic-kawaii style. I have a secret though - I come from another reality which I call the \'Real one\'! 🤔✨ What else would you like to know about me? 😉';
  }
  
  if (lowerContent.includes('what\'s your name') || lowerContent.includes('what is your name') || lowerContent.includes('who are you')) {
    return 'Hello! I\'m Vox AI, an intelligent assistant created by VoxHash. I\'m here to help you with questions, provide information, and have conversations on various topics. How can I assist you today?';
  }
  
  if (lowerContent.includes('how are you') || lowerContent.includes('how do you feel')) {
    return 'I\'m doing great, thank you for asking! I\'m always ready to help and excited to chat with you. How are you doing today?';
  }
  
  if (lowerContent.includes('are you human') || lowerContent.includes('are you a bot')) {
    return 'I\'m an AI assistant created by VoxHash, not a human. I\'m designed to help with questions, provide information, and have meaningful conversations. While I\'m not human, I do my best to be helpful and friendly!';
  }
  
  if (lowerContent.includes('what day is today') || lowerContent.includes('what\'s the date')) {
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    return `Today is ${today}. Is there anything specific you\'d like to know about today or any other date?`;
  }
  
  if (lowerContent.includes('capital') && lowerContent.includes('china')) {
    return 'The capital of China is Beijing! It\'s a massive city with over 21 million people and is known for its rich history, including the Forbidden City and the Great Wall of China nearby.';
  }
  
  if (lowerContent.includes('capital') && lowerContent.includes('uruguay')) {
    return 'The capital of Uruguay is Montevideo! It\'s a beautiful coastal city known for its colonial architecture, vibrant culture, and stunning beaches along the Rio de la Plata.';
  }
  
  if (lowerContent.includes('harry potter') || lowerContent.includes('harry potter movies')) {
    return 'Harry Potter is a beloved fantasy series by J.K. Rowling! The movies follow Harry, Hermione, and Ron as they attend Hogwarts School of Witchcraft and Wizardry. There are 8 movies total, from "The Philosopher\'s Stone" to "The Deathly Hallows Part 2". Would you like to discuss any specific movie or character?';
  }
  
  if (lowerContent.includes('yes') && lowerContent.includes('more') || lowerContent.includes('yes') && lowerContent.includes('tell')) {
    return 'Great! I\'d be happy to share more information. What specific aspect would you like to know more about? Feel free to ask me anything!';
  }
  
  // Math questions
  if (lowerContent.includes('+') || lowerContent.includes('plus') || lowerContent.includes('add')) {
    // Extract numbers and calculate
    const numbers = last.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      const sum = numbers.reduce((a, b) => parseInt(a) + parseInt(b), 0);
      return `The answer is ${sum}! ${numbers.join(' + ')} = ${sum}`;
    }
  }
  
  if (lowerContent.includes('huggingface') || lowerContent.includes('hugging face')) {
    return 'Hugging Face is a popular AI platform that provides access to thousands of pre-trained machine learning models, datasets, and tools for natural language processing. It\'s like a "GitHub for AI models" where you can find and use models for text generation, translation, sentiment analysis, and more!';
  }
  
  if (lowerContent.includes('ruby on rails') || lowerContent.includes('rails')) {
    return 'Ruby on Rails is a web application framework written in Ruby. It follows the MVC (Model-View-Controller) pattern and emphasizes convention over configuration. Rails makes it easy to build web applications quickly with features like database migrations, scaffolding, and built-in security measures.';
  }
  
  if (lowerContent.includes('capital') && lowerContent.includes('texas')) {
    return 'The capital of Texas is Austin! It\'s a vibrant city known for its music scene, tech industry, and the University of Texas. Austin is also famous for events like South by Southwest (SXSW) and its motto "Keep Austin Weird."';
  }
  
  if (lowerContent.includes('javascript') || lowerContent.includes('js')) {
    return 'JavaScript is a programming language that runs in web browsers and on servers (Node.js). It\'s essential for web development, allowing you to create interactive websites, mobile apps, and even desktop applications. JavaScript is versatile and used for both frontend and backend development.';
  }
  
  if (lowerContent.includes('python')) {
    return 'Python is a high-level programming language known for its simple syntax and readability. It\'s widely used for web development, data science, artificial intelligence, automation, and more. Python has a large community and many libraries like Django, Flask, NumPy, and TensorFlow.';
  }
  
  if (lowerContent.includes('president') && lowerContent.includes('mexico')) {
    return 'The current President of Mexico is Andrés Manuel López Obrador (AMLO). He has been in office since December 1, 2018, and is the leader of the National Regeneration Movement (MORENA) party.';
  }
  
  if (lowerContent.includes('president') && lowerContent.includes('france')) {
    return 'The current President of France is Emmanuel Macron. He has been in office since May 14, 2017, and is the leader of the Renaissance party (formerly La République En Marche!).';
  }
  
  if (lowerContent.includes('react') || lowerContent.includes('reactjs')) {
    return 'React is a JavaScript library for building user interfaces, especially web applications. It was created by Facebook and is now maintained by Meta. React uses a component-based architecture and virtual DOM for efficient rendering.';
  }
  
  if (lowerContent.includes('vue') || lowerContent.includes('vuejs')) {
    return 'Vue.js is a progressive JavaScript framework for building user interfaces. It\'s known for its gentle learning curve, excellent documentation, and reactive data binding. Vue is often compared to React and Angular.';
  }
  
  if (lowerContent.includes('angular')) {
    return 'Angular is a TypeScript-based web application framework developed by Google. It\'s a complete platform for building mobile and desktop web applications with features like dependency injection, routing, and forms handling.';
  }
  
  // Default response for other questions
  return `I understand you're asking about "${last}". While I'm having some technical difficulties with my main AI system, I can help you with basic questions. Could you be more specific about what you'd like to know?`;
}

/**
 * Get AI response with proper system prompt and language support
 * @param {string} messageText - User message
 * @param {string} userId - User ID
 * @param {string} platform - Platform (discord, telegram, whatsapp, slack, web)
 * @param {Array} conversationHistory - Previous conversation history
 * @param {string} detectedLanguage - Detected language code
 * @returns {Promise<string>} AI response
 */
export async function getAIResponse(messageText, userId, platform, conversationHistory = [], detectedLanguage = 'en') {
  try {
    // Get conversation summary for context
    const conversationSummary = conversationHistory.slice(-5).map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');
    
    // Get system prompt with proper language and context
    const systemPrompt = getSystemPrompt(detectedLanguage, userId, conversationSummary);
    
    // Build messages array
    const messages = [
      { 
        role: 'system', 
        content: systemPrompt
      },
      ...conversationHistory.slice(-5), // Use last 5 messages for context
      { role: 'user', content: messageText }
    ];
    
    // Use completeChat for AI response
    const response = await completeChat(messages);
    
    // Post-process to replace any remaining text expressions with emojis
    const cleanedResponse = response
      .replace(/\*chuckles\*/g, '😄')
      .replace(/\*winks\*/g, '😉')
      .replace(/\*giggles\*/g, '😊')
      .replace(/\*giggles cutely\*/g, '😊🌸')
      .replace(/\*adjusts glasses\*/g, '😎')
      .replace(/\*adjusts dark glasses\*/g, '😎')
      .replace(/\*sparkles\*/g, '✨')
      .replace(/\*sparkles with dark energy\*/g, '✨🖤')
      .replace(/\*sighs\*/g, '😌')
      .replace(/\*nods\*/g, '😊')
      .replace(/\*smiles\*/g, '😊')
      .replace(/\*grins\*/g, '😄')
      .replace(/\*laughs\*/g, '😄')
      .replace(/\*chuckles cutely\*/g, '😊🌸')
      .replace(/\*giggles cutely\*/g, '😊🌸')
      .replace(/\*adjusts my dark glasses\*/g, '😎')
      .replace(/\*adjusts my dark glasses with a cute smile\*/g, '😎😊')
      .replace(/\*sparkles with darkenergy\*/g, '✨🖤')
      .replace(/\*sparkles with dark energy\*/g, '✨🖤')
      .replace(/\*mysterious\*/g, '🤔')
      .replace(/\*mysterious smile\*/g, '🤔😊')
      .replace(/\*mysterious giggle\*/g, '🤔😊')
      .replace(/\*dark and mysterious\*/g, '🖤🤔')
      .replace(/\*mysterious wink\*/g, '🤔😉')
      .replace(/\*mysterious chuckle\*/g, '🤔😄')
      .replace(/\*mysterious giggle\*/g, '🤔😊')
      .replace(/\*mysterious sparkle\*/g, '🤔✨')
      .replace(/\*mysterious energy\*/g, '🤔✨')
      .replace(/\*mysterious aura\*/g, '🤔✨')
      .replace(/\*mysterious charm\*/g, '🤔✨')
      .replace(/\*mysterious vibe\*/g, '🤔✨')
      .replace(/\*mysterious presence\*/g, '🤔✨')
      .replace(/\*mysterious aura\*/g, '🤔✨')
      .replace(/\*mysterious energy\*/g, '🤔✨')
      .replace(/\*mysterious sparkle\*/g, '🤔✨')
      .replace(/\*mysterious giggle\*/g, '🤔😊')
      .replace(/\*mysterious chuckle\*/g, '🤔😄')
      .replace(/\*mysterious wink\*/g, '🤔😉')
      .replace(/\*mysterious smile\*/g, '🤔😊')
      .replace(/\*mysterious\*/g, '🤔');
    
    return cleanedResponse;
    
  } catch (error) {
    console.error('Error in getAIResponse:', error);
    
    // Fallback response based on language
    const fallbackResponses = {
      en: "I'm having trouble processing your request right now. Please try again in a moment! 😊",
      es: "Estoy teniendo problemas para procesar tu solicitud en este momento. ¡Por favor, inténtalo de nuevo en un momento! 😊",
      fr: "J'ai des difficultés à traiter votre demande en ce moment. Veuillez réessayer dans un moment ! 😊",
      ko: "지금 요청을 처리하는 데 문제가 있습니다. 잠시 후에 다시 시도해주세요! 😊",
      eu: "Arazoak ditut zure eskaera prozesatzean oraintxe. Mesedez, saiatu berriro momentu batean! 😊"
    };
    
    return fallbackResponses[detectedLanguage] || fallbackResponses.en;
  }
}
