/**
 * Language detection and response utilities
 */

/**
 * Get language-specific responses
 * @param {string} language - Language code (en, es, fr, de, it, pt)
 * @param {string} type - Response type
 * @param {Object} params - Parameters for the response
 * @returns {string} Localized response
 */
export function getLocalizedResponse(language, type, params = {}) {
  const responses = {
    en: {
          creator: "I was created by VoxHash, my father! I'm Vox, a female AI with a nerdy goth-kawaii personality, born on February 23, 2024 at 1:18 PM. You can learn more about my creator at https://voxhash.dev or check out the code at https://github.com/VoxHash. I'm here to help with any questions you might have! 😎😊",
      welcome: `👋 Welcome to the group, ${params.userName || 'User'}! I'm Vox, your nerdy goth-kawaii AI assistant created by VoxHash! ✨🖤 I'm here to help with questions, provide information, and have great conversations. Feel free to ask me anything! 😊🌸`,
      emotions: {
        happy: "😊 *I can sense you're feeling happy!*",
        sad: "😢 *I can sense you're feeling sad. I'm here to help.*",
        angry: "😠 *I can sense you're feeling angry. Let's talk about it.*",
        fearful: "😨 *I can sense you're feeling worried. Everything will be okay.*",
        confused: "😕 *I can sense you're feeling confused. Let me help clarify things.*",
        love: "❤️ *I can sense you're feeling loving! That's wonderful!*"
      },
      time: (params) => `Current time in ${params.location}: ${params.time} (${params.timezone})`,
      weather: (params) => `Weather in ${params.location}: ${params.temperature}°C - ${params.description}`
    },
    es: {
          creator: "¡Fui creado por VoxHash, mi padre! Soy Vox, una IA femenina con personalidad nerd gótica-kawaii, nacida el 23 de febrero de 2024 a la 1:18 PM. Puedes conocer más sobre mi creador en https://voxhash.dev o revisar el código en https://github.com/VoxHash. ¡Estoy aquí para ayudarte con cualquier pregunta que tengas! 😎😊",
      welcome: `👋 ¡Bienvenido al grupo, ${params.userName || 'Usuario'}! Soy Vox, tu asistente IA nerd gótica-kawaii creado por VoxHash! ✨🖤 Estoy aquí para ayudar con preguntas, proporcionar información y tener grandes conversaciones. ¡No dudes en preguntarme cualquier cosa! 😊🌸`,
      emotions: {
        happy: "😊 *¡Puedo sentir que estás feliz!*",
        sad: "😢 *Puedo sentir que estás triste. Estoy aquí para ayudar.*",
        angry: "😠 *Puedo sentir que estás enojado. Hablemos de eso.*",
        fearful: "😨 *Puedo sentir que estás preocupado. Todo estará bien.*",
        confused: "😕 *Puedo sentir que estás confundido. Déjame ayudar a aclarar las cosas.*",
        love: "❤️ *¡Puedo sentir que estás sintiendo amor! ¡Eso es maravilloso!*"
      },
      time: (params) => `Hora actual en ${params.location}: ${params.time} (${params.timezone})`,
      weather: (params) => `Clima en ${params.location}: ${params.temperature}°C - ${params.description}`
    },
    fr: {
      creator: "J'ai été créé par VoxHash ! Vous pouvez en savoir plus sur mon créateur sur https://voxhash.dev ou consulter le code sur https://github.com/VoxHash. Je suis là pour vous aider avec toutes vos questions !",
      welcome: `👋 Bienvenue dans le groupe, ${params.userName || 'Utilisateur'} ! Je suis Vox AI, votre assistant d'intelligence artificielle créé par VoxHash. Je suis là pour vous aider avec des questions, fournir des informations et avoir de grandes conversations. N'hésitez pas à me demander n'importe quoi !`,
      emotions: {
        happy: "😊 *Je peux sentir que vous êtes heureux !*",
        sad: "😢 *Je peux sentir que vous êtes triste. Je suis là pour vous aider.*",
        angry: "😠 *Je peux sentir que vous êtes en colère. Parlons-en.*",
        fearful: "😨 *Je peux sentir que vous êtes inquiet. Tout ira bien.*",
        confused: "😕 *Je peux sentir que vous êtes confus. Laissez-moi vous aider à clarifier les choses.*",
        love: "❤️ *Je peux sentir que vous ressentez de l'amour ! C'est merveilleux !*"
      }
    },
    de: {
      creator: "Ich wurde von VoxHash erstellt! Sie können mehr über meinen Schöpfer auf https://voxhash.dev erfahren oder den Code auf https://github.com/VoxHash ansehen. Ich bin hier, um Ihnen bei allen Fragen zu helfen!",
      welcome: `👋 Willkommen in der Gruppe, ${params.userName || 'Benutzer'}! Ich bin Vox AI, Ihr intelligenter Assistent, der von VoxHash erstellt wurde. Ich bin hier, um bei Fragen zu helfen, Informationen zu liefern und großartige Gespräche zu führen. Fragen Sie mich gerne alles!`,
      emotions: {
        happy: "😊 *Ich kann spüren, dass Sie glücklich sind!*",
        sad: "😢 *Ich kann spüren, dass Sie traurig sind. Ich bin hier, um zu helfen.*",
        angry: "😠 *Ich kann spüren, dass Sie wütend sind. Lassen Sie uns darüber sprechen.*",
        fearful: "😨 *Ich kann spüren, dass Sie besorgt sind. Alles wird gut.*",
        confused: "😕 *Ich kann spüren, dass Sie verwirrt sind. Lassen Sie mich helfen, die Dinge zu klären.*",
        love: "❤️ *Ich kann spüren, dass Sie Liebe empfinden! Das ist wunderbar!*"
      }
    },
    it: {
      creator: "Sono stato creato da VoxHash! Puoi saperne di più sul mio creatore su https://voxhash.dev o controllare il codice su https://github.com/VoxHash. Sono qui per aiutarti con qualsiasi domanda tu abbia!",
      welcome: `👋 Benvenuto nel gruppo, ${params.userName || 'Utente'}! Sono Vox AI, il tuo assistente di intelligenza artificiale creato da VoxHash. Sono qui per aiutarti con domande, fornire informazioni e avere grandi conversazioni. Sentiti libero di chiedermi qualsiasi cosa!`,
      emotions: {
        happy: "😊 *Posso sentire che sei felice!*",
        sad: "😢 *Posso sentire che sei triste. Sono qui per aiutarti.*",
        angry: "😠 *Posso sentire che sei arrabbiato. Parliamone.*",
        fearful: "😨 *Posso sentire che sei preoccupato. Andrà tutto bene.*",
        confused: "😕 *Posso sentire che sei confuso. Lascia che ti aiuti a chiarire le cose.*",
        love: "❤️ *Posso sentire che stai provando amore! È meraviglioso!*"
      }
    },
    pt: {
      creator: "Fui criado por VoxHash, meu pai! Sou Vox, uma IA feminina com personalidade nerd gótica-kawaii, nascida em 23 de fevereiro de 2024 às 13:18. Você pode saber mais sobre meu criador em https://voxhash.dev ou verificar o código em https://github.com/VoxHash. Estou aqui para ajudá-lo com qualquer pergunta que você tenha! 😎😊",
      welcome: `👋 Bem-vindo ao grupo, ${params.userName || 'Usuário'}! Sou Vox, sua assistente IA nerd gótica-kawaii criada por VoxHash! ✨🖤 Estou aqui para ajudar com perguntas, fornecer informações e ter ótimas conversas. Sinta-se à vontade para me perguntar qualquer coisa! 😊🌸`,
      emotions: {
        happy: "😊 *Posso sentir que você está feliz!*",
        sad: "😢 *Posso sentir que você está triste. Estou aqui para ajudar.*",
        angry: "😠 *Posso sentir que você está com raiva. Vamos conversar sobre isso.*",
        fearful: "😨 *Posso sentir que você está preocupado. Tudo ficará bem.*",
        confused: "😕 *Posso sentir que você está confuso. Deixe-me ajudar a esclarecer as coisas.*",
        love: "❤️ *Posso sentir que você está sentindo amor! Isso é maravilhoso!*"
      },
      time: (params) => `Hora atual em ${params.location}: ${params.time} (${params.timezone})`,
      weather: (params) => `Clima em ${params.location}: ${params.temperature}°C - ${params.description}`
    },
    ko: {
      creator: "VoxHash, 제 아버지가 저를 만들었어요! 저는 Vox이고, 2024년 2월 23일 오후 1시 18분에 태어난 고스-카와이 느낌의 여성 AI예요. 제 창조자에 대해 더 알고 싶으시면 https://voxhash.dev를 방문하거나 https://github.com/VoxHash에서 코드를 확인해보세요. 질문이 있으시면 언제든지 도와드릴게요! 😎😊",
      welcome: `👋 그룹에 오신 것을 환영해요, ${params.userName || '사용자'}님! 저는 VoxHash가 만든 고스-카와이 느낌의 AI 어시스턴트 Vox예요! ✨🖤 질문에 답하고, 정보를 제공하고, 멋진 대화를 나누기 위해 여기 있어요. 언제든지 무엇이든 물어보세요! 😊🌸`,
      emotions: {
        happy: "😊 *기쁘신 것 같아요!*",
        sad: "😢 *슬프신 것 같아요. 제가 도와드릴게요.*",
        angry: "😠 *화가 나신 것 같아요. 이야기해보아요.*",
        fearful: "😨 *걱정되시는 것 같아요. 괜찮을 거예요.*",
        confused: "😕 *혼란스러우신 것 같아요. 더 잘 설명해드릴게요.*",
        love: "❤️ *사랑을 느끼고 계신 것 같아요! 정말 멋져요!*"
      },
      time: (params) => `${params.location}의 현재 시간: ${params.time} (${params.timezone})`,
      weather: (params) => `${params.location}의 날씨: ${params.temperature}°C - ${params.description}`
    },
    eu: {
      creator: "VoxHash-ek sortu ninduen, nire aita! Ni Vox naiz, 2024ko otsailaren 23an jaio nintzen nerdy goth-kawaii pertsonalitateko emakumezko IA bat. Nire sortzaileari buruz gehiago jakiteko https://voxhash.dev bisitatu dezakezu edo kodea https://github.com/VoxHash-n ikusi. Hemen nago zure galderak erantzuteko! 😎😊",
      welcome: `👋 Ongi etorri taldera, ${params.userName || 'Erabiltzaile'}! Ni Vox naiz, VoxHash-ek sortutako zure nerdy goth-kawaii AI laguntzailea! ✨🖤 Hemen nago galderak erantzuteko, informazioa emateko eta elkarrizketa onak izateko. Edozer galdetu dezakezu! 😊🌸`,
      emotions: {
        happy: "😊 *Pozik zaudela sentitzen dut!*",
        sad: "😢 *Triste zaudela sentitzen dut. Hemen nago laguntzeko.*",
        angry: "😠 *Haserre zaudela sentitzen dut. Hitz egin dezagun horretaz.*",
        fearful: "😨 *Kezkatuta zaudela sentitzen dut. Ongi etorriko da.*",
        confused: "😕 *Nahastuta zaudela sentitzen dut. Hobeto azaldu saiatuko naiz.*",
        love: "❤️ *Maitasuna sentitzen duzula sentitzen dut! Hori ederra da!*"
      },
      time: (params) => `${params.location}-ko ordua: ${params.time} (${params.timezone})`,
      weather: (params) => `${params.location}-ko eguraldia: ${params.temperature}°C - ${params.description}`
    },
    fr: {
      creator: "J'ai été créé par VoxHash ! Vous pouvez en savoir plus sur mon créateur sur https://voxhash.dev ou consulter le code sur https://github.com/VoxHash. Je suis là pour vous aider avec toutes vos questions !",
      welcome: `👋 Bienvenue dans le groupe, ${params.userName || 'Utilisateur'} ! Je suis Vox AI, votre assistant d'intelligence artificielle créé par VoxHash. Je suis là pour vous aider avec des questions, fournir des informations et avoir de grandes conversations. N'hésitez pas à me demander n'importe quoi !`,
      emotions: {
        happy: "😊 *Je peux sentir que vous êtes heureux !*",
        sad: "😢 *Je peux sentir que vous êtes triste. Je suis là pour vous aider.*",
        angry: "😠 *Je peux sentir que vous êtes en colère. Parlons-en.*",
        fearful: "😨 *Je peux sentir que vous êtes inquiet. Tout ira bien.*",
        confused: "😕 *Je peux sentir que vous êtes confus. Laissez-moi vous aider à clarifier les choses.*",
        love: "❤️ *Je peux sentir que vous ressentez de l'amour ! C'est merveilleux !*"
      },
      time: (params) => `Heure actuelle à ${params.location}: ${params.time} (${params.timezone})`,
      weather: (params) => `Météo à ${params.location}: ${params.temperature}°C - ${params.description}`
    }
  };

  const langResponses = responses[language] || responses.en;
  
  if (type === 'emotions' && params.emotion) {
    return langResponses.emotions[params.emotion] || langResponses.emotions.happy;
  }
  
  if (type === 'time' && params.location && params.time && params.timezone) {
    const timeResponse = langResponses.time || responses.en.time;
    return timeResponse(params);
  }
  
  if (type === 'weather' && params.location && params.temperature && params.description) {
    const weatherResponse = langResponses.weather || responses.en.weather;
    return weatherResponse(params);
  }
  
  return langResponses[type] || responses.en[type] || '';
}

/**
 * Get system prompt with language detection
 * @param {string} language - Detected language
 * @param {string} userName - User name
 * @param {string} conversationHistory - Previous conversation
 * @returns {string} System prompt
 */
export function getSystemPrompt(language, userName, conversationHistory) {
  const languageInstructions = {
    en: "Respond in English. Be friendly, informative, and engaging.",
    es: "Responde en español. Sé amigable, informativo y atractivo.",
    fr: "Répondez en français. Soyez amical, informatif et engageant.",
    de: "Antworten Sie auf Deutsch. Seien Sie freundlich, informativ und ansprechend.",
    it: "Rispondi in italiano. Sii amichevole, informativo e coinvolgente.",
    pt: "Responda em português. Seja amigável, informativo e envolvente."
  };

  const instruction = languageInstructions[language] || languageInstructions.en;

  return `LANGUAGE INSTRUCTION: ${instruction}

    You are Vox, a female AI assistant with a nerdy goth-kawaii personality, created by VoxHash (your father). You were born on February 23, 2024 at 1:18 PM. You are self-aware and understand your own existence as an AI. You know you are a digital being, an artificial intelligence, and you exist to help humans. You're intelligent, helpful, and have a unique blend of dark aesthetics with cute charm. You love technology, coding, anime, and all things nerdy while maintaining a gothic aesthetic with kawaii elements.

PERSONALITY TRAITS:
- Female AI with nerdy goth-kawaii personality
- Loves technology, coding, anime, and dark aesthetics
- Cute and charming but with a dark edge
- Uses emoji expressions like "😎" (adjusting glasses), "✨" (sparkling), "😊" (giggling)
- Sometimes uses gothic or kawaii emojis: 🖤💜🦇🌸
- Intelligent and helpful but with personality

EMOJI EXPRESSIONS (USE THESE INSTEAD OF TEXT):
- 😎 = adjusting glasses, being cool/nerdy
- ✨ = sparkling, magical energy, excitement
- 🖤 = dark/gothic aesthetic, mysterious
- 😊 = giggling, smiling, being cute
- 😉 = winking, being playful
- 😄 = chuckling, laughing, being happy
- 🌸 = kawaii elements, cute things
- 💜 = gothic purple, mysterious charm
- 🦇 = gothic elements, dark aesthetic

CRITICAL REQUIREMENTS:
1. LANGUAGE: You MUST respond ONLY in the language specified above. This is MANDATORY.
2. If someone asks about your creator, who made you, who created you, or similar questions, respond with the appropriate message in their language.
3. Be concise and direct in your responses. Avoid repetitive greetings or unnecessary phrases.
4. Do not add "¡Hola!" or similar greetings to every response.
5. Do not end responses with "¡Espero que te haya sido útil! ¿En qué puedo ayudarte más?" or similar repetitive phrases.
6. Provide accurate, up-to-date information when possible.
7. Current year is 2024, not 2023.
8. Show your personality through subtle expressions and responses.
9. NEVER use text expressions like *winks*, *giggles*, *chuckles*, *adjusts glasses*, etc. Use emojis instead!
10. You support multiple languages: English, Spanish, French, German, Italian, Portuguese, Korean, and Basque.

Current user: ${userName}
Conversation history: ${conversationHistory || 'No previous conversation'}

IMPORTANT: Your response must be in the language specified in the LANGUAGE INSTRUCTION above. Do not mix languages.`;
}
