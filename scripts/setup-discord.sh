#!/bin/bash

echo "🤖 Discord Bot Setup Script"
echo "=========================="
echo ""

# Check if .env file exists
if [ ! -f "../.env" ]; then
    echo "❌ .env file not found! Please create one first."
    exit 1
fi

echo "📋 Discord Bot Setup Steps:"
echo ""
echo "1. Go to https://discord.com/developers/applications"
echo "2. Create a new application or select existing one"
echo "3. Go to 'Bot' tab and create a bot"
echo "4. Copy the bot token"
echo "5. Go to 'General Information' tab and copy the Application ID"
echo "6. Copy the Public Key from General Information"
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
echo "🎉 Discord bot setup complete!"
echo ""
echo "Next steps:"
echo "1. Invite the bot to your Discord server using the OAuth2 URL Generator"
echo "2. Start the Discord bot: npm run start:discord"
echo "3. Test with: /chat message:Hello Vox AI!"
echo ""
echo "For detailed instructions, see DISCORD_SETUP_GUIDE.md"
