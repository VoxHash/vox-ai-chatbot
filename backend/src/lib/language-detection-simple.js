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
    'hacemos', 'hacéis', 'hacen', 'digo', 'dices', 'dice', 'decimos', 'decís', 'dicen'
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
  
  // Count matches for each language
  let spanishCount = 0;
  let frenchCount = 0;
  let englishCount = 0;
  
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
  
  // Return the language with the most matches
  if (spanishCount > frenchCount && spanishCount > englishCount) {
    return 'es';
  } else if (frenchCount > spanishCount && frenchCount > englishCount) {
    return 'fr';
  } else if (englishCount > spanishCount && englishCount > frenchCount) {
    return 'en';
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
