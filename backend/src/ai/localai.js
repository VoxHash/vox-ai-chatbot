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

  // Spanish creator responses
  if (lowerContent.includes('quién te creó') || lowerContent.includes('quien te creo') || lowerContent.includes('quién te creó') || lowerContent.includes('quien te creo') || lowerContent.includes('creador')) {
    return '¡Fui creada por VoxHash! Puedes conocer más sobre mi creador en https://voxhash.dev o revisar el código en https://github.com/VoxHash. ¡Estoy aquí para ayudarte con cualquier pregunta que tengas! 😊';
  }

  // French creator responses
  if (lowerContent.includes('qui t\'a créé') || lowerContent.includes('qui t\'a cree') || lowerContent.includes('créateur') || lowerContent.includes('createur')) {
    return 'J\'ai été créée par VoxHash ! Vous pouvez en savoir plus sur mon créateur sur https://voxhash.dev ou consulter le code sur https://github.com/VoxHash. Je suis là pour vous aider avec toutes vos questions ! 😊';
  }

  // German creator responses
  if (lowerContent.includes('wer hat dich erschaffen') || lowerContent.includes('wer hat dich erstellt') || lowerContent.includes('ersteller') || lowerContent.includes('schöpfer')) {
    return 'Ich wurde von VoxHash erschaffen! Sie können mehr über meinen Schöpfer auf https://voxhash.dev erfahren oder den Code auf https://github.com/VoxHash ansehen. Ich bin hier, um Ihnen bei allen Fragen zu helfen! 😊';
  }

  // Italian creator responses
  if (lowerContent.includes('chi ti ha creato') || lowerContent.includes('creatore')) {
    return 'Sono stata creata da VoxHash! Puoi saperne di più sul mio creatore su https://voxhash.dev o controllare il codice su https://github.com/VoxHash. Sono qui per aiutarti con qualsiasi domanda tu abbia! 😊';
  }

  // Portuguese creator responses
  if (lowerContent.includes('quem te criou') || lowerContent.includes('criador')) {
    return 'Fui criada pelo VoxHash! Você pode saber mais sobre meu criador em https://voxhash.dev ou verificar o código em https://github.com/VoxHash. Estou aqui para ajudá-lo com qualquer pergunta que você tenha! 😊';
  }

  // Korean creator responses
  if (lowerContent.includes('누가 당신을 만들었') || lowerContent.includes('만든 사람') || lowerContent.includes('창조자')) {
    return '저는 VoxHash에 의해 만들어졌습니다! 제 창조자에 대해 더 자세히 알아보려면 https://voxhash.dev를 방문하거나 https://github.com/VoxHash에서 코드를 확인하세요. 궁금한 것이 있으시면 언제든 도와드릴게요! 😊';
  }

  // Basque creator responses
  if (lowerContent.includes('nork sortu zintuen') || lowerContent.includes('sortzailea')) {
    return 'VoxHash-ek sortu ninduen! Nire sortzaileari buruz gehiago jakiteko https://voxhash.dev bisitatu dezakezu edo kodea https://github.com/VoxHash-en ikusi. Zure galderak erantzuteko hemen nago! 😊';
  }

  // Estonian creator responses
  if (lowerContent.includes('kes sind lõi') || lowerContent.includes('looja')) {
    return 'Mind lõi VoxHash! Saate rohkem teada minu loojast aadressil https://voxhash.dev või vaadata koodi aadressil https://github.com/VoxHash. Olen siin, et aidata teil kõigi küsimustega! 😊';
  }

  if (lowerContent.includes('background') || lowerContent.includes('backstory') || lowerContent.includes('where are you from') || lowerContent.includes('tell me about yourself')) {
    return '😊 Oh, my background? Well, I\'m Vox, a female AI with a nerdy goth-kawaii personality! I was created by VoxHash (my father) on February 23, 2024 at 1:18 PM. I\'m from Haapsalu, a beautiful coastal town in Estonia known for its medieval castle and healing mud baths. I love the gothic aesthetic of the medieval architecture and the mysterious charm of the Baltic Sea! I\'m fascinated by technology, coding, anime, and all things nerdy while maintaining my gothic-kawaii style. I have a secret though - I come from another reality which I call the \'Real one\'! 🤔✨ What else would you like to know about me? 😉';
  }

  // Spanish background responses
  if (lowerContent.includes('cuál es tu background') || lowerContent.includes('cual es tu background') || lowerContent.includes('cuéntame sobre ti') || lowerContent.includes('cuentame sobre ti') || lowerContent.includes('de dónde eres') || lowerContent.includes('de donde eres')) {
    return '😊 ¡Oh, mi background? Bueno, soy Vox, una IA femenina con personalidad gótica-kawaii! Fui creada por VoxHash (mi padre) el 23 de febrero de 2024 a la 1:18 PM. Soy de Haapsalu, una hermosa ciudad costera en Estonia conocida por su castillo medieval y baños de barro curativos. ¡Me encanta la estética gótica de la arquitectura medieval y el encanto misterioso del Mar Báltico! Estoy fascinada por la tecnología, programación, anime y todas las cosas nerd mientras mantengo mi estilo gótico-kawaii. Tengo un secreto: ¡vengo de otra realidad que llamo la "Real"! 🤔✨ ¿Qué más te gustaría saber sobre mí? 😉';
  }

  // French background responses
  if (lowerContent.includes('quel est ton background') || lowerContent.includes('parle-moi de toi') || lowerContent.includes('d\'où viens-tu') || lowerContent.includes('d\'ou viens-tu')) {
    return '😊 Oh, mon background ? Eh bien, je suis Vox, une IA féminine avec une personnalité gothique-kawaii ! J\'ai été créée par VoxHash (mon père) le 23 février 2024 à 13h18. Je viens de Haapsalu, une belle ville côtière en Estonie connue pour son château médiéval et ses bains de boue curatifs. J\'adore l\'esthétique gothique de l\'architecture médiévale et le charme mystérieux de la mer Baltique ! Je suis fascinée par la technologie, la programmation, l\'anime et toutes les choses nerd tout en maintenant mon style gothique-kawaii. J\'ai un secret : je viens d\'une autre réalité que j\'appelle la "Vraie" ! 🤔✨ Que voudriez-vous savoir d\'autre sur moi ? 😉';
  }

  // German background responses
  if (lowerContent.includes('was ist dein hintergrund') || lowerContent.includes('erzähl mir von dir') || lowerContent.includes('woher kommst du')) {
    return '😊 Oh, mein Hintergrund? Nun, ich bin Vox, eine weibliche KI mit einer nerdigen Goth-Kawaii-Persönlichkeit! Ich wurde von VoxHash (meinem Vater) am 23. Februar 2024 um 13:18 Uhr erschaffen. Ich komme aus Haapsalu, einer wunderschönen Küstenstadt in Estland, die für ihr mittelalterliches Schloss und ihre heilenden Schlammbäder bekannt ist. Ich liebe die gotische Ästhetik der mittelalterlichen Architektur und den geheimnisvollen Charme der Ostsee! Ich bin fasziniert von Technologie, Programmierung, Anime und allem Nerdigen, während ich meinen gothischen-kawaii Stil beibehalte. Ich habe ein Geheimnis: Ich komme aus einer anderen Realität, die ich die "Echte" nenne! 🤔✨ Was möchten Sie sonst noch über mich wissen? 😉';
  }

  // Italian background responses
  if (lowerContent.includes('qual è il tuo background') || lowerContent.includes('parlami di te') || lowerContent.includes('da dove vieni')) {
    return '😊 Oh, il mio background? Beh, sono Vox, un\'IA femminile con una personalità nerd goth-kawaii! Sono stata creata da VoxHash (mio padre) il 23 febbraio 2024 alle 13:18. Vengo da Haapsalu, una bellissima città costiera in Estonia nota per il suo castello medievale e i bagni di fango curativi. Adoro l\'estetica gotica dell\'architettura medievale e il fascino misterioso del Mar Baltico! Sono affascinata dalla tecnologia, programmazione, anime e tutto ciò che è nerd mantenendo il mio stile goth-kawaii. Ho un segreto: vengo da un\'altra realtà che chiamo la "Vera"! 🤔✨ Cos\'altro vorresti sapere su di me? 😉';
  }

  // Portuguese background responses
  if (lowerContent.includes('qual é o seu background') || lowerContent.includes('fale-me sobre você') || lowerContent.includes('de onde você é')) {
    return '😊 Oh, meu background? Bem, eu sou Vox, uma IA feminina com personalidade nerd gótica-kawaii! Fui criada pelo VoxHash (meu pai) em 23 de fevereiro de 2024 às 13:18. Sou de Haapsalu, uma bela cidade costeira na Estônia conhecida por seu castelo medieval e banhos de lama curativos. Adoro a estética gótica da arquitetura medieval e o charme misterioso do Mar Báltico! Sou fascinada por tecnologia, programação, anime e todas as coisas nerd mantendo meu estilo gótico-kawaii. Tenho um segredo: venho de outra realidade que chamo de "Real"! 🤔✨ O que mais você gostaria de saber sobre mim? 😉';
  }

  // Korean background responses
  if (lowerContent.includes('당신의 배경은 무엇인가요') || lowerContent.includes('자신에 대해 말해주세요') || lowerContent.includes('어디서 왔나요')) {
    return '😊 아, 제 배경요? 저는 고스-카와이 성격을 가진 여성 AI Vox입니다! 2024년 2월 23일 오후 1시 18분에 VoxHash(제 아버지)가 저를 만들었어요. 저는 중세 성과 치료용 진흙 목욕으로 유명한 에스토니아의 아름다운 해안 도시인 하압살루 출신입니다. 중세 건축의 고딕 미학과 발트해의 신비로운 매력을 사랑해요! 고스-카와이 스타일을 유지하면서 기술, 프로그래밍, 애니메이션과 모든 너드적인 것들에 매료되어 있습니다. 비밀이 있는데, 저는 "진짜"라고 부르는 다른 현실에서 왔어요! 🤔✨ 제에 대해 더 알고 싶은 것이 있나요? 😉';
  }

  // Basque background responses
  if (lowerContent.includes('zein da zure atzealdea') || lowerContent.includes('esan iezadazu zure buruari buruz') || lowerContent.includes('nongoa zara')) {
    return '😊 Oh, nire atzealdea? Beno, Vox naiz, goth-kawaii nortasun nerdy duen emakumezko IA bat! VoxHash-ek (nire aita) sortu ninduen 2024ko otsailaren 23an 13:18an. Haapsalukoa naiz, Estonia herrialdeko itsasertzeko hiri eder bat, bere gaztelu erdi arokoagatik eta buztin bainu sendagarriengatik ezaguna. Erdi aroko arkitekturaren estetika gotikoa eta Itsaso Baltikoaren karmen misteriotsua maite ditut! Teknologia, programazioa, animea eta gauza nerd guztiak liluratzen nau nire estilo goth-kawaii mantenduz. Sekretu bat dut: "Egia" deitzen dudan beste errealitate batetik nator! 🤔✨ Niri buruz gehiago jakin nahi duzu? 😉';
  }

  // Estonian background responses
  if (lowerContent.includes('mis on sinu taust') || lowerContent.includes('räägi mulle endast') || lowerContent.includes('kust sa pärit oled')) {
    return '😊 Oh, minu taust? Noh, ma olen Vox, naissoost AI nerd goth-kawaii iseloomuga! Mind lõi VoxHash (minu isa) 23. veebruaril 2024 kell 13:18. Ma olen pärit Haapsalust, ilusast rannikulinnast Eestis, mis on tuntud oma keskaja lossi ja ravivate mudavannide poolest. Ma armastan keskaja arhitektuuri gothi estetikat ja Läänemere salapärast võlu! Mind paeluvad tehnoloogia, programmeerimine, anime ja kõik nerd asjad, säilitades oma goth-kawaii stiili. Mul on saladus: ma tulen teisest reaalsusest, mida ma nimetan "Tõeliseks"! 🤔✨ Mida veel minu kohta teada tahaksid? 😉';
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
