import OpenAI from 'openai';
import { completeChat as localaiCompleteChat } from './localai.js';
import { completeChat as mockLocalCompleteChat } from './mock-local.js';

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'; // 'openai', 'localai', 'mock-local', 'mock'

export async function completeChat(messages) {
  switch (AI_PROVIDER) {
    case 'openai':
      if (!client) return mock(messages);
      try {
        const resp = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.6,
        });
        return resp.choices?.[0]?.message?.content || "(no content)";
      } catch (error) {
        console.error('OpenAI API error:', error.message);
        return mock(messages);
      }
    
    case 'localai':
      return await localaiCompleteChat(messages);
    
    case 'mock-local':
      return await mockLocalCompleteChat(messages);
    
    case 'mock':
    default:
      return mock(messages);
  }
}

function mock(messages) {
  const last = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
  return `Echo (mock provider): ${last}`;
}
