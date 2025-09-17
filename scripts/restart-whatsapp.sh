#!/bin/bash

# WhatsApp Bot Restart Script
echo "🔄 Restarting WhatsApp Bot..."

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

# Start the WhatsApp bot
echo "🚀 Starting WhatsApp bot..."
cd /home/raider/Desktop/Projects/Personal/vox-ai-chatbot/backend

# Create logs directory if it doesn't exist
mkdir -p ../logs

# Start the bot and monitor it
nohup node src/integrations/whatsapp_baileys.js > ../logs/whatsapp.log 2>&1 &
BOT_PID=$!

echo "✅ WhatsApp bot started with PID: $BOT_PID"
echo "📱 Check ../logs/whatsapp.log for QR code"
echo "🔄 Bot will auto-restart if it crashes"

# Monitor the bot and restart if it dies
while true; do
    if ! kill -0 $BOT_PID 2>/dev/null; then
        echo "❌ WhatsApp bot crashed, restarting..."
        sleep 5
        nohup node src/integrations/whatsapp_baileys.js > ../logs/whatsapp.log 2>&1 &
        BOT_PID=$!
        echo "🔄 Restarted with PID: $BOT_PID"
    fi
    sleep 10
done
