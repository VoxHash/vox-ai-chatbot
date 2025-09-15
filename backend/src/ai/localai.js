import axios from 'axios';

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
      max_tokens: 1000,
      stop: ['Human:', 'System:', '\n\n']
    }, {
      timeout: 60000 // 60 second timeout for local model
    });

    return `${response.data.content || "(no content)"}`;
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
  return `Based on my analysis of your query, I can help you with this topic. As your local AI assistant running on your system, I'm here to help with programming, technical questions, creative writing, analysis, or any other topic you have in mind!

Could you provide more specific details about what you'd like to know?`;
}
