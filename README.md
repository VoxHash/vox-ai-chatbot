# Vox AI Chatbot 🚀

A modern, full-stack AI chatbot application built with React, Express.js, and PostgreSQL. Real-time chat with AI integration, user authentication, and conversation management with a stunning cyberpunk interface. Powered by Vox 0.0.1, your local AI assistant.

[![GitHub stars](https://img.shields.io/github/stars/voxhash/vox-ai-chatbot?style=social)](https://github.com/voxhash/vox-ai-chatbot)
[![GitHub forks](https://img.shields.io/github/forks/voxhash/vox-ai-chatbot?style=social)](https://github.com/voxhash/vox-ai-chatbot/fork)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)

> **Built with modern web technologies**

## 🎯 Demo

![Vox AI Chatbot Demo](https://via.placeholder.com/800x400/1a1a1a/00ffff?text=Vox+AI+Chatbot+Cyberpunk+Interface)

> **Live Demo**: [Coming Soon] | **Video Demo**: [Watch on YouTube](https://youtube.com/@voxhash)

## ✨ Features

- **🤖 AI Chat Integration**: Real-time chat with OpenAI GPT models + Local AI (Vox 0.0.1)
- **💬 Real-time Messaging**: WebSocket-based instant messaging with typing indicators
- **🔐 User Authentication**: JWT-based auth with refresh tokens and role-based access
- **📚 Conversation History**: Persistent chat history with PostgreSQL
- **👥 Multi-user Support**: User management and conversation isolation
- **🎨 Cyberpunk UI**: Stunning neon interface with retro vibes
- **🐳 Docker Support**: Easy deployment with Docker Compose
- **⚡ Fast & Modern**: Built with the latest web technologies
- **🔌 Bot Integrations**: Telegram and Slack bot support
- **📊 Admin Dashboard**: Analytics and user management
- **🏠 Local AI**: Complete privacy with local model processing
- **🎯 Smart Responses**: Context-aware AI with code examples

## 🤖 Meet Vox - Your AI Assistant

**Vox 0.0.1** is your local AI assistant powered by advanced language models, providing:

- **🧠 Smart Responses**: Context-aware answers with code examples
- **🏠 Complete Privacy**: All processing happens locally on your machine
- **⚡ Real-time Processing**: Instant responses with realistic processing time
- **💻 Code Expertise**: PHP, JavaScript, Python, and more programming languages
- **🎨 Friendly Interface**: Stunning neon UI with retro vibes

### Example Interactions with Vox:

```
User: "Give me an example of PHP code"
Vox: [Provides complete PHP class example with explanations]

User: "What can you do?"
Vox: [Lists capabilities and programming languages supported]

User: "Hello, how are you?"
Vox: [Friendly greeting with local processing status]
```

## 🎯 Why This Project?

I built Vox AI Chatbot to demonstrate:

- **Full-Stack Development Skills**: Modern React frontend with Express.js backend
- **Real-time Communication**: WebSocket implementation with Socket.IO
- **Database Design**: Efficient data modeling with PostgreSQL
- **API Development**: RESTful API design with proper error handling
- **Authentication**: JWT-based security with refresh tokens
- **DevOps Practices**: Docker containerization and multi-service orchestration
- **UI/UX Design**: Responsive, modern interface with Tailwind CSS
- **Production Readiness**: Proper configuration, documentation, and deployment setup

This project showcases my ability to create **production-ready applications** that solve real-world problems with clean, maintainable code.

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client for API calls

### Backend
- **Express.js** - Node.js web framework
- **Socket.IO** - Real-time bidirectional communication
- **PostgreSQL** - Relational database
- **Redis** - Caching and session storage
- **OpenAI API** - AI chat completions
- **JWT** - Authentication and authorization

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **NGINX** - Reverse proxy and load balancing

## 📋 Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- Git

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/voxhash/vox-ai-chatbot
   cd vox-ai-chatbot
   ```

2. **Create environment file**
```bash
cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start all services**
   ```bash
   docker-compose up --build
   ```

4. **Access Vox AI Chatbot**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000
   - NGINX (production-like): http://localhost:8080
   - Database: localhost:5433

5. **Login with demo credentials**
   - Email: `test@example.com`
   - Password: `Passw0rd!`
   - AI Assistant: Vox 0.0.1 (Local)

6. **Enable AI responses (optional)**
   - **OpenAI API**: Add your API key to `.env` file
   - **Local Models**: Follow the [Local Models Guide](LOCAL_MODELS_INTEGRATION.md)
   - **Mock Mode**: Works out of the box (default)

### Option 2: Local Development

1. **Clone and setup**
   ```bash
   git clone https://github.com/voxhash/vox-ai-chatbot
   cd vox-ai-chatbot
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp ../.env.example ../.env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000

5. **Login with demo credentials**
   - Email: `test@example.com`
   - Password: `Passw0rd!`

## 📖 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh access token |

### Chat Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/conversations` | Get user conversations |
| POST | `/api/chat/message` | Send message |
| GET | `/api/chat/admin/metrics` | Get admin metrics |

### WebSocket Events

- `chat:send` - Send a message
- `chat:message` - Receive a message
- `chat:typing` - Typing indicators
- `join` - Join a conversation room

### Example API Usage

**Register User:**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Send Message:**
```bash
POST /api/chat/message
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "message": "Hello, how are you?",
  "conversationId": 1
}
```

## 🗄️ Database Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL, -- 'user' | 'assistant' | 'system'
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🐳 Docker Configuration

The project includes Docker configuration for easy deployment:

- **PostgreSQL**: Database service with health checks
- **Redis**: Caching and session storage
- **Backend**: Express.js API server with Socket.IO
- **Frontend**: React application with Vite
- **NGINX**: Reverse proxy for production-like setup

All services are configured with proper networking, volume mounts, and health checks.

## 🧪 Development

### Backend Development
```bash
cd backend
npm run dev          # Start development server
npm run start        # Start production server
npm run start:telegram  # Start Telegram bot
npm run start:slack     # Start Slack bot
npm test             # Run tests
```

### Frontend Development
```bash
cd frontend
npm run dev    # Start development server
npm run build  # Build for production
npm run preview # Preview production build
```

## 📁 Project Structure

```
ai-chatbot/
├── backend/
│   ├── src/
│   │   ├── ai/
│   │   │   └── openai.js          # AI integration
│   │   ├── integrations/
│   │   │   ├── slack.js           # Slack bot
│   │   │   └── telegram.js        # Telegram bot
│   │   ├── lib/
│   │   │   ├── db.js              # Database connection
│   │   │   └── redis.js           # Redis connection
│   │   ├── middleware/
│   │   │   └── auth.js            # Authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.js            # Auth routes
│   │   │   └── chat.js            # Chat routes
│   │   ├── sockets/
│   │   │   └── chat.js            # Socket.IO handlers
│   │   └── index.js               # Express server
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Main app component
│   │   ├── main.jsx               # App entry point
│   │   └── index.css              # Global styles
│   ├── index.html
│   ├── Dockerfile
│   └── package.json
├── nginx/
│   └── nginx.conf                 # NGINX configuration
├── scripts/
│   └── seed.sql                   # Database seed data
├── docker-compose.yml
└── README.md
```

## 🔧 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://appuser:applongpass@localhost:5433/chatbot
REDIS_URL=redis://localhost:6380/0
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
OPENAI_API_KEY=your-openai-api-key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8080
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
SLACK_BOT_TOKEN=your-slack-bot-token
SLACK_SIGNING_SECRET=your-slack-signing-secret
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:4000
```

## 🚀 Deployment

### Production with Docker

1. **Build and start services**
   ```bash
   docker-compose -f docker-compose.yml up --build -d
   ```

2. **Run database migrations**
   ```bash
   docker-compose exec db psql -U appuser -d chatbot -f /docker-entrypoint-initdb.d/seed.sql
   ```

### Manual Deployment

1. **Setup database** (PostgreSQL)
2. **Deploy backend** (Node.js/Express)
3. **Deploy frontend** (React/Vite)
4. **Configure environment variables**
5. **Setup NGINX** (optional)

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Database Connection Error (`ECONNREFUSED ::1:5433`)
**Problem**: The application can't connect to the database.
**Solution**: Ensure the `DATABASE_URL` in your `.env` file uses the correct Docker service name:
```bash
# For Docker Compose
DATABASE_URL=postgresql://appuser:applongpass@db:5432/chatbot

# For local development
DATABASE_URL=postgresql://appuser:applongpass@localhost:5433/chatbot
```

#### Redis Connection Error (`ECONNREFUSED 127.0.0.1:6380`)
**Problem**: The application can't connect to Redis.
**Solution**: Update the `REDIS_URL` in your `.env` file:
```bash
# For Docker Compose
REDIS_URL=redis://redis:6379/0

# For local development
REDIS_URL=redis://localhost:6380/0
```

#### Login Fails with "Invalid credentials"
**Problem**: The demo user login doesn't work.
**Solution**: The password hash in the database might be incorrect. Update it:
```bash
# Generate new password hash
docker-compose exec backend node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('Passw0rd!', 10));"

# Update database with new hash
docker-compose exec db psql -U appuser -d chatbot -c "UPDATE users SET password_hash = 'NEW_HASH_HERE' WHERE email = 'test@example.com';"
```

#### Frontend Not Accessible via NGINX
**Problem**: NGINX shows "host not allowed" error.
**Solution**: The Vite configuration needs to allow the frontend host. This is already fixed in the current configuration.

#### Services Not Starting
**Problem**: Docker containers fail to start.
**Solution**: 
1. Check if all required environment variables are set in `.env`
2. Ensure ports 4000, 5173, 5433, 6380, and 8080 are available
3. Check Docker logs: `docker-compose logs [service-name]`

### Health Checks

Test if all services are running correctly:

```bash
# Check backend health
curl http://localhost:4000/api/health

# Check frontend
curl http://localhost:5173

# Check NGINX proxy
curl http://localhost:8080

# Test login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Passw0rd!"}'
```

## 🤝 Contributing

Contributions are welcome! Here's how you can contribute:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all checks pass

### Ideas for Contributions
- Add more AI providers (Anthropic, Cohere, etc.)
- Implement file upload for chat
- Add voice message support
- Create mobile app version
- Add conversation export/import
- Implement user roles and permissions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤖 AI Integration Options

### OpenAI API Integration
For production use with real AI capabilities:
- **Guide**: [OPENAI_INTEGRATION.md](OPENAI_INTEGRATION.md)
- **Features**: GPT-4, GPT-3.5-turbo, GPT-4o-mini
- **Cost**: Pay-per-use
- **Setup**: 5 minutes

### Local Models Integration
For complete privacy and control:
- **Guide**: [LOCAL_MODELS_INTEGRATION.md](LOCAL_MODELS_INTEGRATION.md)
- **Your GGUF Model**: [GGUF_MODEL_INTEGRATION.md](GGUF_MODEL_INTEGRATION.md)
- **Features**: Llama 3.2, Mistral, CodeLlama, and more
- **Cost**: Free (after initial setup)
- **Setup**: 15-30 minutes

### Mock Mode (Default)
For development and testing:
- **Features**: Echo responses
- **Cost**: Free
- **Setup**: Automatic

## 🎯 Future Enhancements

- [ ] Voice message support
- [ ] File upload and sharing
- [ ] Multiple AI providers
- [ ] Conversation export/import
- [ ] Advanced user roles
- [ ] Real-time collaboration
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard
- [ ] Custom AI model training

## 📞 Connect with Me

- **GitHub**: [@voxhash](https://github.com/voxhash)
- **Email**: [Get in touch](mailto:contact@voxhash.dev)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=voxhash/ai-chatbot&type=Date)](https://star-history.com/#voxhash/ai-chatbot&Date)

---

<div align="center">

**Built with ❤️ by [@VoxHash](https://github.com/voxhash)**

*Full-Stack Developer | AI & Web Technologies*

[![GitHub followers](https://img.shields.io/github/followers/voxhash?style=social)](https://github.com/voxhash)

</div>