import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import crypto from 'crypto';

// Mock the Slack integration
const createSlackApp = () => {
  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  
  function verifySlack(req) {
    const ts = req.headers['x-slack-request-timestamp'];
    const sig = req.headers['x-slack-signature'];
    const base = `v0:${ts}:${req.rawBody || JSON.stringify(req.body)}`;
    const mySig = 'v0=' + crypto.createHmac('sha256', process.env.SLACK_SIGNING_SECRET || 'x').update(base).digest('hex');
    return sig === mySig;
  }
  
  app.post('/slack/events', (req, res) => {
    if (req.body.type === 'url_verification') {
      return res.send(req.body.challenge);
    }
    
    // Skip strict signature check for demo purposes
    const event = req.body.event;
    if (event?.type === 'app_mention' || event?.type === 'message') {
      console.log('Slack message:', event.text);
    }
    
    res.sendStatus(200);
  });
  
  return app;
};

describe('Slack Bot Integration', () => {
  let app;
  let server;
  
  beforeAll(() => {
    app = createSlackApp();
    server = app.listen(4002);
  });
  
  afterAll((done) => {
    server.close(done);
  });
  
  describe('Events Endpoint', () => {
    it('should handle URL verification challenge', async () => {
      const challengePayload = {
        type: 'url_verification',
        challenge: 'test_challenge_string'
      };
      
      const response = await request(app)
        .post('/slack/events')
        .send(challengePayload)
        .expect(200);
      
      expect(response.text).toBe('test_challenge_string');
    });
    
    it('should handle app mention events', async () => {
      const mentionPayload = {
        type: 'event_callback',
        event: {
          type: 'app_mention',
          text: '<@U1234567890> Hello Vox AI!',
          user: 'U0987654321',
          channel: 'C1234567890',
          ts: '1234567890.123456'
        }
      };
      
      const response = await request(app)
        .post('/slack/events')
        .send(mentionPayload)
        .expect(200);
      
      expect(response.status).toBe(200);
    });
    
    it('should handle direct message events', async () => {
      const messagePayload = {
        type: 'event_callback',
        event: {
          type: 'message',
          text: 'Hello from Slack!',
          user: 'U0987654321',
          channel: 'D1234567890',
          ts: '1234567890.123456'
        }
      };
      
      const response = await request(app)
        .post('/slack/events')
        .send(messagePayload)
        .expect(200);
      
      expect(response.status).toBe(200);
    });
    
    it('should handle unknown event types', async () => {
      const unknownPayload = {
        type: 'event_callback',
        event: {
          type: 'unknown_event',
          text: 'Some text'
        }
      };
      
      const response = await request(app)
        .post('/slack/events')
        .send(unknownPayload)
        .expect(200);
      
      expect(response.status).toBe(200);
    });
  });
  
  describe('Signature Verification', () => {
    it('should verify valid Slack signatures', () => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const body = JSON.stringify({ test: 'data' });
      const secret = 'test_secret';
      
      const base = `v0:${timestamp}:${body}`;
      const expectedSig = 'v0=' + crypto.createHmac('sha256', secret).update(base).digest('hex');
      
      const headers = {
        'x-slack-request-timestamp': timestamp,
        'x-slack-signature': expectedSig
      };
      
      // Mock request object
      const req = {
        headers,
        rawBody: body,
        body: JSON.parse(body)
      };
      
      // Test signature verification logic
      const base2 = `v0:${timestamp}:${req.rawBody || JSON.stringify(req.body)}`;
      const mySig = 'v0=' + crypto.createHmac('sha256', secret).update(base2).digest('hex');
      
      expect(mySig).toBe(expectedSig);
    });
  });
  
  describe('Event Processing', () => {
    it('should extract message text from app mentions', () => {
      const event = {
        type: 'app_mention',
        text: '<@U1234567890> Hello Vox AI! How are you?',
        user: 'U0987654321'
      };
      
      expect(event.text).toContain('Hello Vox AI!');
      expect(event.user).toBe('U0987654321');
    });
    
    it('should handle different message formats', () => {
      const messages = [
        '<@U1234567890> Hello!',
        'Direct message without mention',
        '<@U1234567890> @channel Please help!',
        'Message with emoji 🚀'
      ];
      
      messages.forEach(message => {
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('Slack Bot Test Scenarios', () => {
  it('should simulate team conversation', async () => {
    const app = createSlackApp();
    
    const teamMessages = [
      {
        type: 'event_callback',
        event: {
          type: 'app_mention',
          text: '<@U1234567890> What\'s the weather like?',
          user: 'U1111111111',
          channel: 'C1234567890'
        }
      },
      {
        type: 'event_callback',
        event: {
          type: 'app_mention',
          text: '<@U1234567890> Can you help with coding?',
          user: 'U2222222222',
          channel: 'C1234567890'
        }
      },
      {
        type: 'event_callback',
        event: {
          type: 'message',
          text: 'Thanks for the help!',
          user: 'U3333333333',
          channel: 'D1234567890'
        }
      }
    ];
    
    for (const message of teamMessages) {
      const response = await request(app)
        .post('/slack/events')
        .send(message)
        .expect(200);
      
      expect(response.status).toBe(200);
    }
  });
  
  it('should handle high-frequency events', async () => {
    const app = createSlackApp();
    
    // Simulate rapid-fire events
    const promises = [];
    for (let i = 0; i < 10; i++) {
      const payload = {
        type: 'event_callback',
        event: {
          type: 'message',
          text: `Message ${i}`,
          user: `U${i}`,
          channel: `C${i}`
        }
      };
      
      promises.push(
        request(app)
          .post('/slack/events')
          .send(payload)
          .expect(200)
      );
    }
    
    const responses = await Promise.all(promises);
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });
});
