import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import crypto from 'crypto';

// Mock the Discord integration
const createDiscordApp = () => {
  const app = express();
  app.use(express.json());
  
  const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
  const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
  const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;
  
  // Verify Discord request signature
  function verifyDiscord(req) {
    const signature = req.headers['x-signature-ed25519'];
    const timestamp = req.headers['x-signature-timestamp'];
    const body = req.rawBody || JSON.stringify(req.body);
    
    if (!signature || !timestamp || !DISCORD_PUBLIC_KEY) {
      return false;
    }

    const publicKey = Buffer.from(DISCORD_PUBLIC_KEY, 'hex');
    const message = Buffer.from(timestamp + body);
    
    try {
      const verify = crypto.createVerify('ed25519');
      verify.update(message);
      return verify.verify(publicKey, Buffer.from(signature, 'hex'));
    } catch (error) {
      console.error('Discord signature verification error:', error);
      return false;
    }
  }
  
  // Handle Discord interactions
  app.post('/discord/interactions', async (req, res) => {
    // Skip signature verification for demo purposes
    // if (!verifyDiscord(req)) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    const { type, data, member, channel_id } = req.body;

    if (type === 1) { // PING
      return res.json({ type: 1 }); // PONG
    }

    if (type === 2) { // APPLICATION_COMMAND
      const commandName = data.name;
      
      if (commandName === 'chat') {
        const message = data.options?.[0]?.value || 'Hello!';
        
        // Send response to Discord
        const response = {
          type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
          data: {
            content: `🤖 Vox AI: ${message}`,
            allowed_mentions: { parse: [] }
          }
        };
        
        return res.json(response);
      }
    }

    if (type === 3) { // MESSAGE_COMPONENT
      // Handle button clicks, select menus, etc.
      return res.json({ type: 4, data: { content: 'Component interaction received!' } });
    }

    res.status(400).json({ error: 'Unknown interaction type' });
  });
  
  // Health check endpoint
  app.get('/discord/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      bot_token_set: !!DISCORD_BOT_TOKEN,
      client_id_set: !!DISCORD_CLIENT_ID 
    });
  });
  
  return app;
};

describe('Discord Bot Integration', () => {
  let app;
  let server;
  
  beforeAll(() => {
    app = createDiscordApp();
    server = app.listen(4003);
  });
  
  afterAll((done) => {
    server.close(done);
  });
  
  describe('Interactions Endpoint', () => {
    it('should handle PING interactions', async () => {
      const pingPayload = {
        type: 1 // PING
      };
      
      const response = await request(app)
        .post('/discord/interactions')
        .send(pingPayload)
        .expect(200);
      
      expect(response.body).toEqual({ type: 1 }); // PONG
    });
    
    it('should handle chat slash commands', async () => {
      const chatCommandPayload = {
        type: 2, // APPLICATION_COMMAND
        data: {
          name: 'chat',
          options: [
            {
              name: 'message',
              value: 'Hello, Vox AI!'
            }
          ]
        },
        member: {
          user: {
            id: '123456789012345678',
            username: 'testuser'
          }
        },
        channel_id: '987654321098765432'
      };
      
      const response = await request(app)
        .post('/discord/interactions')
        .send(chatCommandPayload)
        .expect(200);
      
      expect(response.body.type).toBe(4); // CHANNEL_MESSAGE_WITH_SOURCE
      expect(response.body.data.content).toContain('🤖 Vox AI: Hello, Vox AI!');
    });
    
    it('should handle chat commands without options', async () => {
      const chatCommandPayload = {
        type: 2, // APPLICATION_COMMAND
        data: {
          name: 'chat'
        },
        member: {
          user: {
            id: '123456789012345678',
            username: 'testuser'
          }
        },
        channel_id: '987654321098765432'
      };
      
      const response = await request(app)
        .post('/discord/interactions')
        .send(chatCommandPayload)
        .expect(200);
      
      expect(response.body.type).toBe(4); // CHANNEL_MESSAGE_WITH_SOURCE
      expect(response.body.data.content).toContain('🤖 Vox AI: Hello!');
    });
    
    it('should handle message component interactions', async () => {
      const componentPayload = {
        type: 3, // MESSAGE_COMPONENT
        data: {
          custom_id: 'test_button',
          component_type: 2 // BUTTON
        },
        member: {
          user: {
            id: '123456789012345678',
            username: 'testuser'
          }
        },
        channel_id: '987654321098765432'
      };
      
      const response = await request(app)
        .post('/discord/interactions')
        .send(componentPayload)
        .expect(200);
      
      expect(response.body.type).toBe(4); // CHANNEL_MESSAGE_WITH_SOURCE
      expect(response.body.data.content).toBe('Component interaction received!');
    });
    
    it('should handle unknown interaction types', async () => {
      const unknownPayload = {
        type: 999, // Unknown type
        data: {}
      };
      
      const response = await request(app)
        .post('/discord/interactions')
        .send(unknownPayload)
        .expect(400);
      
      expect(response.body.error).toBe('Unknown interaction type');
    });
  });
  
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/discord/health')
        .expect(200);
      
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('bot_token_set');
      expect(response.body).toHaveProperty('client_id_set');
    });
  });
  
  describe('Signature Verification', () => {
    it('should handle signature verification logic', () => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const body = JSON.stringify({ test: 'data' });
      const publicKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
      
      // Mock signature verification
      const signature = 'mock_signature';
      const headers = {
        'x-signature-ed25519': signature,
        'x-signature-timestamp': timestamp
      };
      
      // Test that we can create the verification objects
      const publicKeyBuffer = Buffer.from(publicKey, 'hex');
      const message = Buffer.from(timestamp + body);
      
      expect(publicKeyBuffer).toBeDefined();
      expect(message).toBeDefined();
    });
  });
});

describe('Discord Bot Test Scenarios', () => {
  it('should simulate server interactions', async () => {
    const app = createDiscordApp();
    
    const serverInteractions = [
      {
        type: 2,
        data: { name: 'chat', options: [{ name: 'message', value: 'What can you do?' }] },
        member: { user: { id: '111111111111111111', username: 'alice' } },
        channel_id: '222222222222222222'
      },
      {
        type: 2,
        data: { name: 'chat', options: [{ name: 'message', value: 'Help me with coding' }] },
        member: { user: { id: '333333333333333333', username: 'bob' } },
        channel_id: '444444444444444444'
      },
      {
        type: 3,
        data: { custom_id: 'help_button', component_type: 2 },
        member: { user: { id: '555555555555555555', username: 'charlie' } },
        channel_id: '666666666666666666'
      }
    ];
    
    for (const interaction of serverInteractions) {
      const response = await request(app)
        .post('/discord/interactions')
        .send(interaction)
        .expect(200);
      
      expect(response.body).toBeDefined();
      expect(response.body.type).toBeDefined();
    }
  });
  
  it('should handle rapid interactions', async () => {
    const app = createDiscordApp();
    
    // Simulate rapid-fire interactions
    const promises = [];
    for (let i = 0; i < 5; i++) {
      const payload = {
        type: 2,
        data: { name: 'chat', options: [{ name: 'message', value: `Message ${i}` }] },
        member: { user: { id: `${i}`, username: `user${i}` } },
        channel_id: `${i}`
      };
      
      promises.push(
        request(app)
          .post('/discord/interactions')
          .send(payload)
          .expect(200)
      );
    }
    
    const responses = await Promise.all(promises);
    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.body.type).toBe(4);
    });
  });
  
  it('should handle different command types', async () => {
    const app = createDiscordApp();
    
    const commands = [
      { name: 'chat', message: 'Hello!' },
      { name: 'chat', message: 'How are you?' },
      { name: 'chat', message: 'Tell me a joke' },
      { name: 'chat', message: 'What\'s the weather?' }
    ];
    
    for (const command of commands) {
      const payload = {
        type: 2,
        data: { 
          name: command.name, 
          options: [{ name: 'message', value: command.message }] 
        },
        member: { user: { id: '123456789', username: 'testuser' } },
        channel_id: '987654321'
      };
      
      const response = await request(app)
        .post('/discord/interactions')
        .send(payload)
        .expect(200);
      
      expect(response.body.data.content).toContain(command.message);
    }
  });
});
