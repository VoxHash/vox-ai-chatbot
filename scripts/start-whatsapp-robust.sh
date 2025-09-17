#!/bin/bash

# Robust WhatsApp Bot Start Script
echo "🔄 Starting WhatsApp Bot with QR Code Image Generation..."

# Kill existing WhatsApp bot processes
pkill -f whatsapp_baileys.js 2>/dev/null

# Wait a moment
sleep 3

# Clean up auth files if they exist
if [ -d "auth_info_vox-ai-session" ]; then
    echo "🧹 Cleaning up old auth files..."
    rm -rf auth_info_vox-ai-session
fi

if [ -d "auth_info_vox-ai-session_new" ]; then
    echo "🧹 Cleaning up old new auth files..."
    rm -rf auth_info_vox-ai-session_new
fi

if [ -d ".wwebjs_auth" ]; then
    echo "🧹 Cleaning up old wwebjs auth files..."
    rm -rf .wwebjs_auth
fi

# Clean up old QR code images
echo "🧹 Cleaning up old QR code images..."
rm -f ../logs/whatsapp-qr-*.png

# Start the WhatsApp bot
echo "🚀 Starting WhatsApp bot..."
cd /home/raider/Desktop/Projects/Personal/vox-ai-chatbot/backend

# Create logs directory if it doesn't exist
mkdir -p ../logs

# Start the bot
echo "📱 Starting WhatsApp bot with QR code image generation..."
node src/integrations/whatsapp_baileys.js
