import { jest } from '@jest/globals';

// Mock whatsapp-web.js
jest.mock('whatsapp-web.js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    initialize: jest.fn(),
    destroy: jest.fn()
  })),
  LocalAuth: jest.fn(),
  MessageMedia: jest.fn()
}));

// Mock the AI module
jest.mock('../../../ai/openai.js', () => ({
  completeChat: jest.fn().mockResolvedValue('Mock AI response')
}));

describe('WhatsApp Integration', () => {
  let mockClient;
  let mockCompleteChat;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the Client constructor
    const { Client } = require('whatsapp-web.js');
    mockClient = {
      on: jest.fn(),
      initialize: jest.fn(),
      destroy: jest.fn()
    };
    Client.mockImplementation(() => mockClient);
    
    // Mock the AI function
    const { completeChat } = require('../../../ai/openai.js');
    mockCompleteChat = completeChat;
  });

  test('should initialize WhatsApp client with correct configuration', () => {
    const { Client, LocalAuth } = require('whatsapp-web.js');
    
    // Import the module to trigger initialization
    require('../../integrations/whatsapp.js');
    
    expect(Client).toHaveBeenCalledWith({
      authStrategy: expect.any(LocalAuth),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });
  });

  test('should set up event handlers', () => {
    require('../../integrations/whatsapp.js');
    
    // Check that event handlers are registered
    expect(mockClient.on).toHaveBeenCalledWith('qr', expect.any(Function));
    expect(mockClient.on).toHaveBeenCalledWith('ready', expect.any(Function));
    expect(mockClient.on).toHaveBeenCalledWith('message', expect.any(Function));
    expect(mockClient.on).toHaveBeenCalledWith('message_create', expect.any(Function));
    expect(mockClient.on).toHaveBeenCalledWith('group_join', expect.any(Function));
    expect(mockClient.on).toHaveBeenCalledWith('auth_failure', expect.any(Function));
    expect(mockClient.on).toHaveBeenCalledWith('disconnected', expect.any(Function));
  });

  test('should call initialize on startup', () => {
    require('../../integrations/whatsapp.js');
    
    expect(mockClient.initialize).toHaveBeenCalled();
  });

  test('should handle graceful shutdown', () => {
    const mockProcess = {
      on: jest.fn()
    };
    
    // Mock process
    const originalProcess = global.process;
    global.process = mockProcess;
    
    require('../../integrations/whatsapp.js');
    
    // Simulate SIGINT
    const sigintHandler = mockProcess.on.mock.calls.find(call => call[0] === 'SIGINT')[1];
    sigintHandler();
    
    expect(mockClient.destroy).toHaveBeenCalled();
    
    // Restore original process
    global.process = originalProcess;
  });
});

describe('WhatsApp Helper Functions', () => {
  // Test emotion detection
  test('should detect happy emotion', () => {
    const { detectEmotion } = require('../../integrations/whatsapp.js');
    expect(detectEmotion('I am so happy! 😊')).toBe('happy');
    expect(detectEmotion('This is great! :)')).toBe('happy');
  });

  test('should detect sad emotion', () => {
    const { detectEmotion } = require('../../integrations/whatsapp.js');
    expect(detectEmotion('I am so sad 😢')).toBe('sad');
    expect(detectEmotion('This makes me cry :((')).toBe('sad');
  });

  test('should detect confused emotion', () => {
    const { detectEmotion } = require('../../integrations/whatsapp.js');
    expect(detectEmotion('What is this?')).toBe('confused');
    expect(detectEmotion('I am confused 😕')).toBe('confused');
  });

  test('should return neutral for unknown emotions', () => {
    const { detectEmotion } = require('../../integrations/whatsapp.js');
    expect(detectEmotion('Hello world')).toBe('neutral');
  });

  // Test emoji mapping
  test('should return correct emoji for emotions', () => {
    const { getEmojiForEmotion } = require('../../integrations/whatsapp.js');
    expect(getEmojiForEmotion('happy')).toBe('😊');
    expect(getEmojiForEmotion('sad')).toBe('😢');
    expect(getEmojiForEmotion('angry')).toBe('😠');
    expect(getEmojiForEmotion('confused')).toBe('😕');
    expect(getEmojiForEmotion('unknown')).toBe('😐');
  });
});
