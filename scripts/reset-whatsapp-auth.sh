#!/bin/bash

# Reset WhatsApp authentication data
echo "🔄 Resetting WhatsApp authentication data..."

# Remove existing auth directories
rm -rf backend/auth_info_*

echo "✅ Authentication data cleared"
echo "🚀 You can now restart the WhatsApp bot with: npm run start:whatsapp"
echo "📱 A new QR code will be generated for you to scan"
