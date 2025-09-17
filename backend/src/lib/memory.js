import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  isR2Configured, 
  uploadMemoryToR2, 
  downloadMemoryFromR2, 
  syncMemoryToR2,
  getMemoryWithR2Fallback 
} from './cloudflare-r2.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Memory storage directory
const MEMORY_DIR = path.join(__dirname, '../../memory');
const MAX_MEMORY_SIZE = 50; // Keep last 50 messages per user

// Ensure memory directory exists
if (!fs.existsSync(MEMORY_DIR)) {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

/**
 * Get memory file path for a user
 * @param {string} userId - User identifier
 * @param {string} platform - Platform (discord, telegram, whatsapp, web)
 * @returns {string} File path
 */
function getMemoryFilePath(userId, platform = 'web') {
  const sanitizedUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(MEMORY_DIR, `${platform}_${sanitizedUserId}_${date}.json`);
}

/**
 * Load user memory from file with R2 fallback
 * @param {string} userId - User identifier
 * @param {string} platform - Platform
 * @returns {Promise<Array>} Conversation history
 */
export async function loadUserMemory(userId, platform = 'web') {
  try {
    // Try R2 first if configured
    if (isR2Configured()) {
      const r2Memory = await getMemoryWithR2Fallback(userId, platform);
      if (r2Memory.length > 0) {
        return r2Memory.slice(-MAX_MEMORY_SIZE);
      }
    }
    
    // Fallback to local file
    const filePath = getMemoryFilePath(userId, platform);
    
    if (!fs.existsSync(filePath)) {
      return [];
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    const memory = JSON.parse(data);
    
    // Return last MAX_MEMORY_SIZE messages
    return memory.slice(-MAX_MEMORY_SIZE);
  } catch (error) {
    console.error('Error loading user memory:', error);
    return [];
  }
}

/**
 * Save user memory to file with R2 sync
 * @param {string} userId - User identifier
 * @param {string} platform - Platform
 * @param {Array} messages - Conversation messages
 */
export async function saveUserMemory(userId, platform = 'web', messages) {
  try {
    const filePath = getMemoryFilePath(userId, platform);
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Keep only last MAX_MEMORY_SIZE messages
    const trimmedMessages = messages.slice(-MAX_MEMORY_SIZE);
    
    // Save locally
    fs.writeFileSync(filePath, JSON.stringify(trimmedMessages, null, 2));
    
    // Sync to R2 if configured
    if (isR2Configured()) {
      await syncMemoryToR2(userId, platform, trimmedMessages);
    }
  } catch (error) {
    console.error('Error saving user memory:', error);
  }
}

/**
 * Add message to user memory
 * @param {string} userId - User identifier
 * @param {string} platform - Platform
 * @param {string} role - Message role (user, assistant, system)
 * @param {string} content - Message content
 * @param {Object} metadata - Additional metadata
 */
export async function addToUserMemory(userId, platform = 'web', role, content, metadata = {}) {
  try {
    const existingMemory = await loadUserMemory(userId, platform);
    
    const newMessage = {
      role,
      content,
      timestamp: new Date().toISOString(),
      platform,
      ...metadata
    };
    
    existingMemory.push(newMessage);
    await saveUserMemory(userId, platform, existingMemory);
    
    return existingMemory;
  } catch (error) {
    console.error('Error adding to user memory:', error);
    return [];
  }
}

/**
 * Get conversation summary for context
 * @param {string} userId - User identifier
 * @param {string} platform - Platform
 * @param {number} maxMessages - Maximum messages to include
 * @returns {Promise<string>} Conversation summary
 */
export async function getConversationSummary(userId, platform = 'web', maxMessages = 10) {
  try {
    const memory = await loadUserMemory(userId, platform);
    const recentMessages = memory.slice(-maxMessages);
    
    if (recentMessages.length === 0) {
      return 'No previous conversation';
    }
    
    return recentMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
  } catch (error) {
    console.error('Error getting conversation summary:', error);
    return 'No previous conversation';
  }
}

/**
 * Detect language from conversation history
 * @param {string} userId - User identifier
 * @param {string} platform - Platform
 * @param {string} currentMessage - Current message
 * @returns {Promise<string>} Detected language code
 */
export async function detectLanguage(userId, platform = 'web', currentMessage = '') {
  try {
    // Import the simple language detection
    const { detectLanguageSimple } = await import('./language-detection-simple.js');
    return detectLanguageSimple(currentMessage);
  } catch (error) {
    console.error('Error detecting language:', error);
    return 'en';
  }
}

/**
 * Check if user has been greeted before
 * @param {string} userId - User identifier
 * @param {string} platform - Platform
 * @returns {Promise<boolean>} True if user has been greeted
 */
export async function hasUserBeenGreeted(userId, platform = 'web') {
  try {
    const memory = await loadUserMemory(userId, platform);
    
    // Check if there are any previous messages
    return memory.length > 0;
  } catch (error) {
    console.error('Error checking if user has been greeted:', error);
    return false;
  }
}

/**
 * Get user's preferred language
 * @param {string} userId - User identifier
 * @param {string} platform - Platform
 * @returns {Promise<string>} Language code
 */
export async function getUserPreferredLanguage(userId, platform = 'web') {
  try {
    const memory = await loadUserMemory(userId, platform);
    
    if (memory.length === 0) {
      return 'en'; // Default to English for new users
    }
    
    // Analyze all messages to determine preferred language
    const allMessages = memory.map(msg => msg.content).join(' ').toLowerCase();
    return await detectLanguage(userId, platform, allMessages);
  } catch (error) {
    console.error('Error getting user preferred language:', error);
    return 'en';
  }
}

/**
 * Clean up old memory files (older than 30 days)
 */
export function cleanupOldMemories() {
  try {
    const files = fs.readdirSync(MEMORY_DIR);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const filePath = path.join(MEMORY_DIR, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < thirtyDaysAgo) {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up old memory file: ${file}`);
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning up old memories:', error);
  }
}

// Clean up old memories on startup
cleanupOldMemories();
