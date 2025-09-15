#!/bin/bash

echo "🤖 Quick Discord Bot Setup"
echo "=========================="
echo ""

# Check if .env file exists
if [ ! -f "../.env" ]; then
    echo "❌ .env file not found! Please create one first."
    exit 1
fi

echo "📋 You need to get these from Discord Developer Portal:"
echo "   1. Bot Token"
echo "   2. Application ID (Client ID)"
echo "   3. Public Key"
echo ""
echo "🔗 Go to: https://discord.com/developers/applications"
echo ""

# Prompt for Discord configuration
echo "Please enter your Discord bot configuration:"
echo ""

read -p "Discord Bot Token: " DISCORD_BOT_TOKEN
read -p "Discord Client ID (Application ID): " DISCORD_CLIENT_ID
read -p "Discord Public Key: " DISCORD_PUBLIC_KEY

# Validate inputs
if [ -z "$DISCORD_BOT_TOKEN" ] || [ -z "$DISCORD_CLIENT_ID" ] || [ -z "$DISCORD_PUBLIC_KEY" ]; then
    echo "❌ All fields are required!"
    exit 1
fi

# Add Discord configuration to .env
echo ""
echo "🔧 Adding Discord configuration to .env file..."

# Remove existing Discord config if any
sed -i '/^DISCORD_/d' ../.env

# Add new Discord config
cat >> ../.env << EOF

# Discord Bot Configuration
DISCORD_BOT_TOKEN=$DISCORD_BOT_TOKEN
DISCORD_CLIENT_ID=$DISCORD_CLIENT_ID
DISCORD_PUBLIC_KEY=$DISCORD_PUBLIC_KEY
EOF

echo "✅ Discord configuration added to .env file!"
echo ""

# Register slash commands
echo "🚀 Registering Discord slash commands..."
cd ../backend
node register-discord-commands.js

echo ""
echo "🔄 Restarting Discord bot..."
pkill -f "discord.js"
npm run start:discord &

echo ""
echo "🎉 Discord bot setup complete!"
echo ""
echo "Next steps:"
echo "1. Invite the bot to your Discord server using OAuth2 URL Generator"
echo "2. Test with: /chat message:Hello Vox AI!"
echo ""
echo "For detailed instructions, see QUICK_DISCORD_SETUP.md"
