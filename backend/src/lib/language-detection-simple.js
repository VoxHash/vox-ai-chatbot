// Simple and precise language detection
export function detectLanguageSimple(message) {
  const lowerMessage = message.toLowerCase();
  
  // Spanish indicators - very specific patterns
  const spanishPatterns = [
    'cuenta', 'cuéntame', 'cuentame', 'broma', 'chiste', 'año', 'años', 'fue', 'fui',
    'estamos', 'estoy', 'estas', 'está', 'están', 'quien', 'qué', 'cómo', 'dónde', 'cuándo',
    'por qué', 'hola', 'gracias', 'por favor', 'buenos días', 'buenas tardes', 'buenas noches',
    'español', 'espanol', 'si', 'no', 'tienes', 'puedes', 'ayuda', 'ayudar', 'información',
    'informacion', 'cuantos', 'cuántos', 'cuantas', 'cuántas', 'cual', 'cuál', 'cuales', 'cuáles',
    'dime', 'enojado', 'traduceme', 'ultimo', 'mensaje', 'barron', 'trump', 'presidente',
    'sabes', 'identificas', 'hombre', 'mujer', 'quiero', 'definirte', 'tienes', 'tiene',
    'tienen', 'tengo', 'tenemos', 'puedes', 'puede', 'pueden', 'puedo', 'podemos', 'hacer',
    'hago', 'hace', 'hacen', 'hacemos', 'decir', 'digo', 'dice', 'dicen', 'decimos',
    'abraham', 'lincoln', 'estados', 'unidos', 'presidente', 'estadounidense', 'estadounidenses',
    'muy', 'muy enojado', 'muy feliz', 'muy triste', 'muy contento', 'muy cansado',
    'soy', 'eres', 'es', 'somos', 'sois', 'son', 'estoy', 'estás', 'está', 'estamos',
    'estáis', 'están', 'tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen',
    'puedo', 'puedes', 'puede', 'podemos', 'podéis', 'pueden', 'hago', 'haces', 'hace',
    'hacemos', 'hacéis', 'hacen', 'digo', 'dices', 'dice', 'decimos', 'decís', 'dicen',
    'cuento', 'cuentos', 'vampiros', 'vampiro', 'chico', 'chica', 'pequeño', 'pequeña',
    'historia', 'historias', 'relato', 'relatos', 'narrativa', 'narrativas'
  ];
  
  // French indicators - very specific patterns only
  const frenchPatterns = [
    'je suis', 'et toi', 'bonjour', 'merci', 's\'il vous plaît', 'bonne journée',
    'français', 'francais', 'comment', 'où', 'quand', 'pourquoi', 'oui', 'non',
    'aide', 'aider', 'information', 'combien', 'quoi', 'tu me', 'diras', 'mensonge',
    'vérité', 'verite', 'et une', 'et un', 'aujourd\'hui', 'aujourd', 'demain', 'hier',
    'maintenant', 'toujours', 'jamais', 'parfois', 'souvent', 'rarement', 'beaucoup',
    'très', 'trop', 'assez', 'peu', 'plus', 'moins', 'bien', 'mal', 'mieux', 'pire',
    'bon', 'bonne', 'mauvais', 'mauvaise', 'grand', 'grande', 'petit', 'petite',
    'nouveau', 'nouvelle', 'vieux', 'vieille', 'jeune', 'beau', 'belle', 'joli', 'jolie',
    'content', 'heureux', 'heureuse', 'triste', 'malheureux', 'malheureuse',
    'fatigué', 'fatiguée', 'malade', 'sain', 'saine', 'fort', 'forte', 'faible',
    'riche', 'pauvre', 'libre', 'occupé', 'occupée', 'prêt', 'prête', 'facile',
    'difficile', 'possible', 'impossible', 'nécessaire', 'important', 'importante',
    'intéressant', 'intéressante', 'amusant', 'amusante', 'ennuyeux', 'ennuyeuse',
    'dangereux', 'dangereuse', 'sûr', 'sûre', 'certain', 'certaine', 'vrai', 'vraie',
    'faux', 'fausse', 'ancien', 'ancienne', 'premier', 'première', 'dernier', 'dernière',
    'prochain', 'prochaine', 'autre', 'même', 'différent', 'différente', 'pareil', 'pareille',
    'semblable', 'comme', 'aussi', 'encore', 'déjà', 'bientôt', 'tard', 'tôt', 'alors',
    'donc', 'mais', 'parce que', 'lequel', 'laquelle', 'lesquels', 'lesquelles'
  ];
  
  // English indicators - very specific patterns
  const englishPatterns = [
    'who', 'what', 'how', 'where', 'when', 'why', 'hello', 'hi', 'thanks', 'thank you',
    'please', 'good morning', 'good afternoon', 'good evening', 'english', 'yes', 'no',
    'have', 'can', 'help', 'information', 'how many', 'how much', 'which', 'is it',
    'was my', 'i mean', 'translate', 'cold', 'alaska', 'previous', 'before', 'last question',
    'what was', 'my last', 'question', 'mean the', 'previous question', 'before that',
    'the previous', 'i mean the', 'was my last', 'am', 'is', 'are', 'was', 'were',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'may', 'might', 'must', 'can', 'cannot', 'couldn\'t', 'wouldn\'t', 'shouldn\'t',
    'won\'t', 'don\'t', 'doesn\'t', 'didn\'t', 'haven\'t', 'hasn\'t', 'hadn\'t',
    'i\'m', 'you\'re', 'he\'s', 'she\'s', 'it\'s', 'we\'re', 'they\'re', 'i\'ve',
    'you\'ve', 'he\'s', 'she\'s', 'it\'s', 'we\'ve', 'they\'ve', 'i\'ll', 'you\'ll',
    'he\'ll', 'she\'ll', 'it\'ll', 'we\'ll', 'they\'ll', 'i\'d', 'you\'d', 'he\'d',
    'she\'d', 'it\'d', 'we\'d', 'they\'d'
  ];
  
  // Korean indicators
  const koreanPatterns = [
    '안녕', '안녕하세요', '감사', '감사합니다', '고마워', '고마워요', '죄송', '죄송합니다',
    '미안', '미안해', '미안해요', '네', '아니요', '예', '아니', '도움', '도와주세요',
    '정보', '질문', '답변', '알려주세요', '말해주세요', '어떻게', '무엇', '언제', '어디서',
    '왜', '누구', '몇', '얼마', '어느', '어떤', '나는', '저는', '당신은', '그는', '그녀는',
    '우리는', '그들은', '있어요', '없어요', '해요', '하지', '할게요', '했어요', '하고',
    '하고있어요', '했었어요', '할거예요', '할수있어요', '못해요', '안해요', '하지않아요'
  ];
  
  // Basque indicators
  const basquePatterns = [
    'kaixo', 'agur', 'eskerrik', 'eskerrik asko', 'milesker', 'barkatu', 'sentitzen',
    'bai', 'ez', 'laguntza', 'lagundu', 'informazioa', 'galdera', 'erantzun',
    'esan', 'esan iezadazu', 'nola', 'zer', 'noiz', 'non', 'zergatik', 'nor',
    'zenbat', 'zein', 'ni', 'zu', 'bera', 'gu', 'haiek', 'dago', 'ez dago',
    'egiten', 'egiten dut', 'egiten du', 'egiten dugu', 'egiten dute', 'egin',
    'egiten ari', 'egiten zuen', 'egingo', 'egin daiteke', 'ezin', 'ez', 'ez du'
  ];
  
  // Count matches for each language
  let spanishCount = 0;
  let frenchCount = 0;
  let englishCount = 0;
  let koreanCount = 0;
  let basqueCount = 0;
  
  for (const pattern of spanishPatterns) {
    if (lowerMessage.includes(pattern)) {
      spanishCount++;
    }
  }
  
  for (const pattern of frenchPatterns) {
    if (lowerMessage.includes(pattern)) {
      frenchCount++;
    }
  }
  
  for (const pattern of englishPatterns) {
    if (lowerMessage.includes(pattern)) {
      englishCount++;
    }
  }
  
  for (const pattern of koreanPatterns) {
    if (lowerMessage.includes(pattern)) {
      koreanCount++;
    }
  }
  
  for (const pattern of basquePatterns) {
    if (lowerMessage.includes(pattern)) {
      basqueCount++;
    }
  }
  
  // Return the language with the most matches
  const counts = [
    { lang: 'es', count: spanishCount },
    { lang: 'fr', count: frenchCount },
    { lang: 'en', count: englishCount },
    { lang: 'ko', count: koreanCount },
    { lang: 'eu', count: basqueCount }
  ];
  
  const maxCount = Math.max(...counts.map(c => c.count));
  if (maxCount > 0) {
    return counts.find(c => c.count === maxCount).lang;
  }
  
  // If no clear winner, check for specific strong indicators
  if (lowerMessage.includes('je suis') || lowerMessage.includes('tu me') || lowerMessage.includes('mensonge')) {
    return 'fr';
  }
  
  if (lowerMessage.includes('cuenta') || lowerMessage.includes('broma') || lowerMessage.includes('año')) {
    return 'es';
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('what') || lowerMessage.includes('how')) {
    return 'en';
  }
  
  // Default to English
  return 'en';
}
