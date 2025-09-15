#!/bin/bash

# Vox AI Chatbot - Bot Setup Script
# This script helps set up Discord and Telegram bots

echo "🤖 Vox AI Chatbot - Bot Setup Script"
echo "===================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://appuser:applongpass@localhost:5433/chatbot
REDIS_URL=redis://localhost:6380

# JWT Secrets (generate secure random strings)
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:5173

# Bot Tokens (REQUIRED for Discord and Telegram)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here
DISCORD_BOT_TOKEN=your-discord-bot-token-here
DISCORD_CLIENT_ID=your-discord-client-id-here
DISCORD_CLIENT_SECRET=your-discord-client-secret-here
DISCORD_PUBLIC_KEY=your-discord-public-key-here

# Optional: OpenAI API Key
OPENAI_API_KEY=your-openai-api-key-here
EOF
    echo "✅ .env file created!"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🔧 Next Steps:"
echo "============="
echo ""
echo "1. 📱 Telegram Bot Setup:"
echo "   - Open Telegram and search for @BotFather"
echo "   - Send /newbot command"
echo "   - Follow prompts to create your bot"
echo "   - Copy the bot token and update TELEGRAM_BOT_TOKEN in .env"
echo ""
echo "2. 🎮 Discord Bot Setup:"
echo "   - Go to https://discord.com/developers/applications"
echo "   - Create new application"
echo "   - Go to Bot section and create bot"
echo "   - Copy bot token and update DISCORD_BOT_TOKEN in .env"
echo "   - Copy Application ID and update DISCORD_CLIENT_ID in .env"
echo "   - Copy Public Key and update DISCORD_PUBLIC_KEY in .env"
echo ""
echo "3. 🚀 Start Services:"
echo "   - Run: sudo docker-compose up -d"
echo "   - Run: cd backend && npm run start:telegram &"
echo "   - Run: cd backend && npm run start:discord &"
echo ""
echo "4. 🧪 Test Setup:"
echo "   - Run: node scripts/check-modules.js"
echo "   - Open: http://localhost:8080"
echo "   - Test Telegram: Send message to your bot"
echo "   - Test Discord: Use /chat command in your server"
echo ""
echo "📚 For detailed instructions, see SETUP_GUIDE.md"
echo ""
echo "🎉 Setup script completed!"
