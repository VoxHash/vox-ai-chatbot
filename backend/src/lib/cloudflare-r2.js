import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';

// CloudFlare R2 configuration
const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'vox-ai-memory';

// Initialize S3 client for CloudFlare R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Check if CloudFlare R2 is configured
 * @returns {boolean} True if R2 is configured
 */
export function isR2Configured() {
  return !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);
}

/**
 * Upload memory file to CloudFlare R2
 * @param {string} userId - User identifier
 * @param {string} platform - Platform (discord, telegram, whatsapp, web)
 * @param {Array} messages - Conversation messages
 * @returns {Promise<boolean>} Success status
 */
export async function uploadMemoryToR2(userId, platform, messages) {
  if (!isR2Configured()) {
    console.log('CloudFlare R2 not configured, skipping upload');
    return false;
  }

  try {
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const key = `memory/${platform}_${sanitizedUserId}_${date}.json`;
    
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: JSON.stringify(messages, null, 2),
      ContentType: 'application/json',
    });

    await r2Client.send(command);
    console.log(`✅ Memory uploaded to R2: ${key}`);
    return true;
  } catch (error) {
    console.error('❌ Error uploading memory to R2:', error);
    return false;
  }
}

/**
 * Download memory file from CloudFlare R2
 * @param {string} userId - User identifier
 * @param {string} platform - Platform
 * @returns {Promise<Array>} Conversation messages
 */
export async function downloadMemoryFromR2(userId, platform) {
  if (!isR2Configured()) {
    console.log('CloudFlare R2 not configured, skipping download');
    return [];
  }

  try {
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const key = `memory/${platform}_${sanitizedUserId}_${date}.json`;
    
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    const response = await r2Client.send(command);
    const data = await response.Body.transformToString();
    const messages = JSON.parse(data);
    
    console.log(`✅ Memory downloaded from R2: ${key}`);
    return messages;
  } catch (error) {
    if (error.name === 'NoSuchKey') {
      console.log(`📝 No memory found in R2 for ${userId} on ${platform}`);
      return [];
    }
    console.error('❌ Error downloading memory from R2:', error);
    return [];
  }
}

/**
 * List all memory files for a user
 * @param {string} userId - User identifier
 * @param {string} platform - Platform
 * @returns {Promise<Array>} List of memory files
 */
export async function listUserMemories(userId, platform) {
  if (!isR2Configured()) {
    return [];
  }

  try {
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const prefix = `memory/${platform}_${sanitizedUserId}_`;
    
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: prefix,
    });

    const response = await r2Client.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error('❌ Error listing user memories from R2:', error);
    return [];
  }
}

/**
 * Delete old memory files from R2 (older than 30 days)
 * @param {string} userId - User identifier
 * @param {string} platform - Platform
 * @returns {Promise<number>} Number of files deleted
 */
export async function cleanupOldMemoriesFromR2(userId, platform) {
  if (!isR2Configured()) {
    return 0;
  }

  try {
    const files = await listUserMemories(userId, platform);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let deletedCount = 0;
    
    for (const file of files) {
      if (file.LastModified < thirtyDaysAgo) {
        const command = new DeleteObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: file.Key,
        });
        
        await r2Client.send(command);
        console.log(`🗑️ Deleted old memory file from R2: ${file.Key}`);
        deletedCount++;
      }
    }
    
    return deletedCount;
  } catch (error) {
    console.error('❌ Error cleaning up old memories from R2:', error);
    return 0;
  }
}

/**
 * Sync local memory to CloudFlare R2
 * @param {string} userId - User identifier
 * @param {string} platform - Platform
 * @param {Array} messages - Conversation messages
 * @returns {Promise<boolean>} Success status
 */
export async function syncMemoryToR2(userId, platform, messages) {
  if (!isR2Configured()) {
    return false;
  }

  try {
    // Upload to R2
    const success = await uploadMemoryToR2(userId, platform, messages);
    
    if (success) {
      console.log(`🔄 Memory synced to R2 for ${userId} on ${platform}`);
    }
    
    return success;
  } catch (error) {
    console.error('❌ Error syncing memory to R2:', error);
    return false;
  }
}

/**
 * Get memory from R2 with local fallback
 * @param {string} userId - User identifier
 * @param {string} platform - Platform
 * @returns {Promise<Array>} Conversation messages
 */
export async function getMemoryWithR2Fallback(userId, platform) {
  try {
    // Try to get from R2 first
    const r2Memory = await downloadMemoryFromR2(userId, platform);
    if (r2Memory.length > 0) {
      return r2Memory;
    }
    
    // Fallback to local memory
    const localMemoryPath = path.join(process.cwd(), 'memory', `${platform}_${userId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().split('T')[0]}.json`);
    
    if (fs.existsSync(localMemoryPath)) {
      const data = fs.readFileSync(localMemoryPath, 'utf8');
      const memory = JSON.parse(data);
      
      // Sync to R2 for future use
      await syncMemoryToR2(userId, platform, memory);
      
      return memory;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error getting memory with R2 fallback:', error);
    return [];
  }
}
