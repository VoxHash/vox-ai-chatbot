# 🤖 OpenAI API Integration Guide

This guide will walk you through integrating OpenAI's API with your AI chatbot to enable real AI responses instead of mock responses.

## 📋 Prerequisites

- OpenAI API account and API key
- Docker and Docker Compose running
- Basic understanding of environment variables

## 🚀 Step-by-Step Integration

### Step 1: Get Your OpenAI API Key

1. **Create an OpenAI Account**
   - Go to [https://platform.openai.com](https://platform.openai.com)
   - Sign up or log in to your account

2. **Generate API Key**
   - Navigate to [API Keys section](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Copy the generated key (starts with `sk-`)
   - **Important**: Save this key securely - you won't be able to see it again

3. **Add Billing Information**
   - Go to [Billing section](https://platform.openai.com/settings/organization/billing/overview)
   - Add a payment method
   - Add some credits ($5-10 is enough for testing)

### Step 2: Configure Environment Variables

1. **Update your `.env` file**
   ```bash
   # Open the .env file in your project root
   nano .env
   ```

2. **Add your OpenAI API key**
   ```bash
   # Replace 'your-openai-api-key-here' with your actual API key
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Verify the configuration**
   ```bash
   # Check if the API key is set correctly
   grep OPENAI_API_KEY .env
   ```

### Step 3: Update Backend Configuration

The backend is already configured to use OpenAI when the API key is provided. Let's verify the configuration:

1. **Check the OpenAI integration file**
   ```bash
   cat backend/src/ai/openai.js
   ```

2. **The file should look like this:**
   ```javascript
   import OpenAI from 'openai';

   const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

   export async function completeChat(messages) {
     if (!client) return mock(messages);
     
     const resp = await client.chat.completions.create({
       model: "gpt-4o-mini",
       messages,
       temperature: 0.6,
     });
     return resp.choices?.[0]?.message?.content || "(no content)";
   }

   function mock(messages) {
     const last = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
     return `Echo (mock provider): ${last}`;
   }
   ```

### Step 4: Restart Services

1. **Restart the backend to pick up the new API key**
   ```bash
   sudo docker-compose restart backend
   ```

2. **Check if the backend is using OpenAI**
   ```bash
   # Check backend logs
   sudo docker-compose logs backend --tail=10
   ```

### Step 5: Test the Integration

1. **Access the application**
   - Go to http://localhost:8080
   - Login with: `test@example.com` / `Passw0rd!`

2. **Test AI responses**
   - Send a message like "Hello, how are you?"
   - You should now get a real AI response instead of the mock echo

3. **Verify in logs**
   ```bash
   # Check if OpenAI API calls are being made
   sudo docker-compose logs backend | grep -i openai
   ```

## 🔧 Advanced Configuration

### Customizing the AI Model

You can change the AI model by modifying `backend/src/ai/openai.js`:

```javascript
export async function completeChat(messages) {
  if (!client) return mock(messages);
  
  const resp = await client.chat.completions.create({
    model: "gpt-4", // Change to gpt-4, gpt-3.5-turbo, etc.
    messages,
    temperature: 0.7, // Adjust creativity (0.0 to 2.0)
    max_tokens: 1000, // Limit response length
  });
  return resp.choices?.[0]?.message?.content || "(no content)";
}
```

### Available Models

- **gpt-4o-mini**: Fast and cost-effective (recommended)
- **gpt-4o**: Most capable model
- **gpt-4**: High-quality responses
- **gpt-3.5-turbo**: Fast and affordable

### System Prompt Customization

Modify the system prompt in `backend/src/routes/chat.js`:

```javascript
const messages = [
  { 
    role: 'system', 
    content: 'You are a helpful AI assistant with a cyberpunk personality. Respond in a futuristic, tech-savvy manner.' 
  }, 
  ...historyQ.rows.map(r => ({ 
    role: r.sender === 'user' ? 'user' : 'assistant', 
    content: r.content 
  }))
];
```

## 🛠️ Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Verify your API key is correct
   - Check if you have billing set up
   - Ensure the key starts with `sk-`

2. **"Rate limit exceeded" error**
   - You've hit your usage limit
   - Add more credits to your OpenAI account
   - Consider using a different model

3. **"Model not found" error**
   - The model name might be incorrect
   - Check available models in your OpenAI dashboard

4. **Backend not picking up the API key**
   - Restart the backend: `sudo docker-compose restart backend`
   - Check if the .env file is in the correct location
   - Verify the environment variable name

### Debug Commands

```bash
# Check if API key is loaded
sudo docker-compose exec backend printenv | grep OPENAI

# Test API key directly
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# Check backend logs for errors
sudo docker-compose logs backend --tail=50
```

## 💰 Cost Management

### Understanding Costs

- **gpt-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **gpt-4o**: ~$2.50 per 1M input tokens, ~$10.00 per 1M output tokens
- **gpt-3.5-turbo**: ~$0.50 per 1M input tokens, ~$1.50 per 1M output tokens

### Setting Usage Limits

1. Go to [Usage Limits](https://platform.openai.com/settings/organization/billing/limits)
2. Set monthly spending limits
3. Monitor usage in the [Usage Dashboard](https://platform.openai.com/usage)

## 🔒 Security Best Practices

1. **Never commit API keys to version control**
   - Add `.env` to `.gitignore`
   - Use environment variables in production

2. **Rotate API keys regularly**
   - Generate new keys periodically
   - Revoke old keys when no longer needed

3. **Monitor usage**
   - Set up alerts for unusual usage
   - Review API logs regularly

## 🚀 Production Deployment

For production deployment, set the environment variable in your hosting platform:

### Docker Compose
```yaml
environment:
  OPENAI_API_KEY: ${OPENAI_API_KEY}
```

### Environment Variables
```bash
export OPENAI_API_KEY=sk-your-actual-api-key-here
```

### Kubernetes
```yaml
env:
- name: OPENAI_API_KEY
  valueFrom:
    secretKeyRef:
      name: openai-secret
      key: api-key
```

## ✅ Verification Checklist

- [ ] OpenAI API key obtained and added to `.env`
- [ ] Backend restarted with new configuration
- [ ] AI responses working in the chat interface
- [ ] No errors in backend logs
- [ ] Billing set up on OpenAI account
- [ ] Usage limits configured (optional)

## 🎉 You're Done!

Your AI chatbot now has real AI capabilities powered by OpenAI! Users will get intelligent, contextual responses instead of mock echoes.

## 📚 Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Pricing](https://openai.com/pricing)
- [OpenAI Models](https://platform.openai.com/docs/models)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/production-best-practices)
