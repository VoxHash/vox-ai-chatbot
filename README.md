# 🤖 Vox AI Chatbot v0.0.2

> **Meet Vox** - A female nerdy AI assistant with goth tendencies and kawaii appearance, created by VoxHash. She's your intelligent companion across Discord, Telegram, and WhatsApp platforms.

[![Version](https://img.shields.io/badge/version-0.0.2-blue.svg)](https://github.com/voxhash/vox-ai-chatbot)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://docker.com/)

## ✨ Features

### 🧠 **Intelligent AI**
- **Multi-Model Support**: OpenAI GPT, LocalAI, and custom GGUF models
- **Conversation Memory**: Persistent context across sessions
- **Multilingual Support**: English, Spanish, French, German, Italian, Portuguese
- **Emotion Detection**: Responds with appropriate reactions and tone

### 🌍 **Real-Time Features**
- **Time Queries**: Get current time for any location worldwide
- **Weather Information**: Real-time weather data for any city
- **Location Detection**: Smart parsing of location names in multiple languages

### 📱 **Multi-Platform Support**
- **Discord Bot**: Full slash commands, threads, reactions, and nickname management
- **Telegram Bot**: Group and DM support with inline keyboards
- **WhatsApp Bot**: QR-based authentication with Baileys integration

### 🎭 **Vox's Personality**
- **Female AI Character**: Nerdy, goth, and kawaii personality
- **Creator**: VoxHash
- **Tone**: Intelligent, friendly, with a touch of dark humor
- **Responses**: Contextual and emotionally aware

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL database
- Redis (optional, for caching)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/voxhash/vox-ai-chatbot.git
cd vox-ai-chatbot
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Edit with your configuration
nano .env
```

4. **Database Setup**
```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Run database migrations
cd backend
npm run db:migrate
```

5. **Start the services**
```bash
# Start all services with Docker Compose
docker-compose up -d

# Or start individually
npm run start:backend
npm run start:frontend
```

## 🤖 Bot Setup

### Discord Bot
1. Create a Discord application at [Discord Developer Portal](https://discord.com/developers/applications)
2. Enable required intents: `Guilds`, `GuildMessages`, `DirectMessages`, `MessageContent`, `GuildMessageReactions`, `GuildMembers`
3. Add bot token to `.env` file
4. Start the bot: `npm run start:discord`

### Telegram Bot
1. Create a bot with [@BotFather](https://t.me/botfather)
2. Get bot token and add to `.env` file
3. Start the bot: `npm run start:telegram`

### WhatsApp Bot
1. No token needed - uses QR code authentication
2. Start the bot: `npm run start:whatsapp`
3. Scan QR code with WhatsApp mobile app
4. Bot will be ready for use

## 📖 Usage

### Discord Commands
- `/chat <message>` - Chat with Vox
- `/help` - Show available commands
- React to messages for personalized responses
- Vox can create and manage threads
- Nickname management for users

### Telegram Features
- Send messages to Vox in DMs or groups
- Use `@vox` to mention in groups
- Inline keyboard interactions
- Reaction-based responses

### WhatsApp Features
- Send messages directly to the bot
- Mention `@vox` in group chats
- Real-time queries for time and weather
- Multilingual support

## 🛠️ Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/vox_chatbot

# AI Models
OPENAI_API_KEY=your_openai_key
LOCALAI_URL=http://localhost:8080
MODEL_NAME=vox_legacy

# Bot Tokens
DISCORD_BOT_TOKEN=your_discord_token
TELEGRAM_BOT_TOKEN=your_telegram_token

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your_jwt_secret
BCRYPT_ROUNDS=12
```

### Model Configuration
- **OpenAI**: Set `OPENAI_API_KEY` and `MODEL_NAME`
- **LocalAI**: Set `LOCALAI_URL` and `MODEL_NAME`
- **GGUF Models**: Place `.gguf` files in `models/` directory

## 🏗️ Architecture

```
vox-ai-chatbot/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── ai/             # AI model integrations
│   │   ├── integrations/   # Bot integrations
│   │   ├── lib/            # Utility libraries
│   │   ├── routes/         # API routes
│   │   └── tests/          # Test files
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   └── package.json
├── models/                 # AI model files
├── scripts/               # Utility scripts
├── docker-compose.yml     # Docker configuration
└── README.md
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

## 📚 API Documentation

### Chat Endpoint
```http
POST /api/chat
Content-Type: application/json

{
  "message": "Hello Vox!",
  "platform": "discord",
  "userId": "user123"
}
```

### Real-time Queries
- **Time**: "What time is it in Tokyo?"
- **Weather**: "What's the weather in Madrid?"
- **Multilingual**: "¿Qué hora es en Barcelona?"

## 🔧 Development

### Adding New Platforms
1. Create integration file in `backend/src/integrations/`
2. Implement required methods: `sendMessage`, `handleMessage`
3. Add platform-specific configuration
4. Update environment variables

### Customizing Vox's Personality
Edit the system prompts in `backend/src/lib/language.js` to modify Vox's responses and personality traits.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/voxhash/vox-ai-chatbot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/voxhash/vox-ai-chatbot/discussions)
- **Creator**: VoxHash

## 🙏 Acknowledgments

- OpenAI for GPT models
- Discord.js for Discord integration
- Baileys for WhatsApp integration
- The open-source community

---

**Made with ❤️ by VoxHash for the AI community**

*Vox is always ready to help, whether you need information, want to chat, or just need someone to understand your nerdy references!* 🤖✨