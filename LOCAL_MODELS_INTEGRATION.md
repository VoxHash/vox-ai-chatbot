# 🏠 Local Models Integration Guide

This guide will walk you through integrating local AI models with your chatbot, giving you complete control over the AI without relying on external APIs.

## 📋 Prerequisites

- Docker and Docker Compose
- At least 8GB RAM (16GB+ recommended)
- GPU with CUDA support (optional, for better performance)
- Basic understanding of Docker and environment variables

## 🚀 Step-by-Step Integration

### Step 1: Choose Your Local Model

#### Option A: Ollama (Recommended - Easy Setup)
- **Pros**: Easy to use, many models available, good performance
- **Cons**: Requires more RAM
- **Models**: Llama 2, CodeLlama, Mistral, etc.

#### Option B: Hugging Face Transformers
- **Pros**: Most flexible, many model options
- **Cons**: More complex setup
- **Models**: All Hugging Face models

#### Option C: Local OpenAI-Compatible Server
- **Pros**: Drop-in replacement for OpenAI API
- **Cons**: Limited model selection
- **Models**: GPT-4All, LocalAI, etc.

### Step 2: Setup Ollama (Recommended)

#### Install Ollama

1. **Download and install Ollama**
   ```bash
   # On Linux
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # On macOS
   brew install ollama
   
   # On Windows
   # Download from https://ollama.ai/download
   ```

2. **Start Ollama service**
   ```bash
   ollama serve
   ```

3. **Pull a model (in another terminal)**
   ```bash
   # For a smaller, faster model (4GB RAM)
   ollama pull llama3.2:3b
   
   # For a more capable model (8GB RAM)
   ollama pull llama3.2:8b
   
   # For the best model (16GB+ RAM)
   ollama pull llama3.2:70b
   ```

#### Alternative: Docker Ollama

1. **Add Ollama to docker-compose.yml**
   ```yaml
   services:
     # ... existing services ...
     
     ollama:
       image: ollama/ollama:latest
       ports:
         - "11434:11434"
       volumes:
         - ollama_data:/root/.ollama
       environment:
         - OLLAMA_HOST=0.0.0.0
       deploy:
         resources:
           reservations:
             devices:
               - driver: nvidia
                 count: 1
                 capabilities: [gpu]
   
   volumes:
     # ... existing volumes ...
     ollama_data: {}
   ```

2. **Start Ollama service**
   ```bash
   sudo docker-compose up -d ollama
   ```

3. **Pull a model**
   ```bash
   sudo docker-compose exec ollama ollama pull llama3.2:3b
   ```

### Step 3: Create Local AI Integration

1. **Create a new AI provider file**
   ```bash
   touch backend/src/ai/ollama.js
   ```

2. **Add Ollama integration code**
   ```javascript
   // backend/src/ai/ollama.js
   import axios from 'axios';

   const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
   const MODEL_NAME = process.env.OLLAMA_MODEL || 'llama3.2:3b';

   export async function completeChat(messages) {
     try {
       const response = await axios.post(`${OLLAMA_URL}/api/chat`, {
         model: MODEL_NAME,
         messages: messages,
         stream: false,
         options: {
           temperature: 0.7,
           top_p: 0.9,
         }
       });

       return response.data.message.content || "(no content)";
     } catch (error) {
       console.error('Ollama API error:', error.message);
       return mock(messages);
     }
   }

   function mock(messages) {
     const last = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
     return `Echo (mock provider): ${last}`;
   }
   ```

3. **Install axios if not already installed**
   ```bash
   cd backend
   npm install axios
   ```

### Step 4: Update Backend Configuration

1. **Modify the main AI file to support multiple providers**
   ```javascript
   // backend/src/ai/openai.js
   import OpenAI from 'openai';
   import { completeChat as ollamaCompleteChat } from './ollama.js';

   const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
   const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'; // 'openai', 'ollama', 'mock'

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
       
       case 'ollama':
         return await ollamaCompleteChat(messages);
       
       case 'mock':
       default:
         return mock(messages);
     }
   }

   function mock(messages) {
     const last = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
     return `Echo (mock provider): ${last}`;
   }
   ```

2. **Update environment variables**
   ```bash
   # Add to your .env file
   AI_PROVIDER=ollama
   OLLAMA_URL=http://ollama:11434
   OLLAMA_MODEL=llama3.2:3b
   ```

### Step 5: Update Docker Compose

1. **Add Ollama service to docker-compose.yml**
   ```yaml
   services:
     # ... existing services ...
     
     ollama:
       image: ollama/ollama:latest
       ports:
         - "11434:11434"
       volumes:
         - ollama_data:/root/.ollama
       environment:
         - OLLAMA_HOST=0.0.0.0
       deploy:
         resources:
           reservations:
             devices:
               - driver: nvidia
                 count: 1
                 capabilities: [gpu]
       networks:
         - default

   volumes:
     # ... existing volumes ...
     ollama_data: {}
   ```

2. **Update backend service dependencies**
   ```yaml
   backend:
     # ... existing config ...
     depends_on:
       db:
         condition: service_healthy
       redis:
         condition: service_started
       ollama:
         condition: service_started
   ```

### Step 6: Restart and Test

1. **Restart all services**
   ```bash
   sudo docker-compose down
   sudo docker-compose up --build -d
   ```

2. **Check if Ollama is running**
   ```bash
   curl http://localhost:11434/api/tags
   ```

3. **Test the integration**
   - Go to http://localhost:8080
   - Login and send a message
   - Check backend logs for Ollama API calls

## 🔧 Alternative: Hugging Face Integration

### Setup Hugging Face Transformers

1. **Create Hugging Face integration**
   ```javascript
   // backend/src/ai/huggingface.js
   import { pipeline } from '@xenova/transformers';

   let chatPipeline = null;

   export async function completeChat(messages) {
     try {
       if (!chatPipeline) {
         chatPipeline = await pipeline('text-generation', 'microsoft/DialoGPT-medium');
       }

       const conversation = messages.map(m => m.content).join('\n');
       const result = await chatPipeline(conversation, {
         max_length: 1000,
         temperature: 0.7,
         do_sample: true,
       });

       return result[0].generated_text || "(no content)";
     } catch (error) {
       console.error('Hugging Face error:', error.message);
       return mock(messages);
     }
   }

   function mock(messages) {
     const last = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
     return `Echo (mock provider): ${last}`;
   }
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install @xenova/transformers
   ```

## 🎛️ Model Configuration

### Environment Variables

```bash
# AI Provider Selection
AI_PROVIDER=ollama  # 'openai', 'ollama', 'huggingface', 'mock'

# Ollama Configuration
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2:3b

# Model Parameters
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=1000
AI_TOP_P=0.9
```

### Model Selection Guide

| Model | Size | RAM Required | Speed | Quality |
|-------|------|--------------|-------|---------|
| llama3.2:3b | 2GB | 4GB | Fast | Good |
| llama3.2:8b | 5GB | 8GB | Medium | Better |
| llama3.2:70b | 40GB | 64GB | Slow | Best |
| mistral:7b | 4GB | 8GB | Medium | Good |
| codellama:7b | 4GB | 8GB | Medium | Code-focused |

## 🛠️ Troubleshooting

### Common Issues

1. **"Connection refused" to Ollama**
   - Check if Ollama is running: `curl http://localhost:11434/api/tags`
   - Verify the OLLAMA_URL in your .env file
   - Check Docker network connectivity

2. **"Model not found" error**
   - Pull the model: `ollama pull llama3.2:3b`
   - Check available models: `ollama list`
   - Verify MODEL_NAME in environment

3. **Out of memory errors**
   - Use a smaller model
   - Increase Docker memory limits
   - Close other applications

4. **Slow responses**
   - Use a smaller model
   - Enable GPU acceleration
   - Reduce max_tokens parameter

### Debug Commands

```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Check available models
sudo docker-compose exec ollama ollama list

# Test model directly
curl -X POST http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.2:3b",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

# Check backend logs
sudo docker-compose logs backend --tail=50
```

## 🚀 Performance Optimization

### GPU Acceleration

1. **Install NVIDIA Docker runtime**
   ```bash
   # Install nvidia-docker2
   sudo apt-get update
   sudo apt-get install nvidia-docker2
   sudo systemctl restart docker
   ```

2. **Update docker-compose.yml for GPU**
   ```yaml
   ollama:
     image: ollama/ollama:latest
     deploy:
       resources:
         reservations:
           devices:
             - driver: nvidia
               count: 1
               capabilities: [gpu]
   ```

### Memory Optimization

1. **Set model parameters**
   ```javascript
   const response = await axios.post(`${OLLAMA_URL}/api/chat`, {
     model: MODEL_NAME,
     messages: messages,
     stream: false,
     options: {
       temperature: 0.7,
       top_p: 0.9,
       num_ctx: 2048,  // Reduce context window
       num_predict: 512, // Limit response length
     }
   });
   ```

2. **Use model quantization**
   ```bash
   # Pull quantized models (smaller, faster)
   ollama pull llama3.2:3b-q4_0
   ollama pull llama3.2:8b-q4_0
   ```

## 🔒 Security Considerations

1. **Local models are private**
   - No data sent to external services
   - Complete control over your data
   - No API costs or rate limits

2. **Model security**
   - Download models from trusted sources
   - Verify model checksums
   - Keep models updated

3. **Resource management**
   - Monitor memory usage
   - Set appropriate limits
   - Regular cleanup of old models

## ✅ Verification Checklist

- [ ] Ollama installed and running
- [ ] Model downloaded and available
- [ ] Environment variables configured
- [ ] Backend updated with local AI integration
- [ ] Docker services restarted
- [ ] AI responses working in chat interface
- [ ] No errors in backend logs
- [ ] Performance acceptable for your use case

## 🎉 You're Done!

Your AI chatbot now runs completely locally with no external dependencies! You have full control over the AI model and your data.

## 📚 Additional Resources

- [Ollama Documentation](https://ollama.ai/docs)
- [Hugging Face Transformers](https://huggingface.co/docs/transformers)
- [LocalAI](https://localai.io/)
- [GPT4All](https://gpt4all.io/)
- [Model Comparison](https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard)
