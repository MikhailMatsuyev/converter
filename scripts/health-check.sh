#!/bin/bash
echo "🏥 Health check for deployed services..."

# Проверка локального сервиса
echo "Local service:"
curl -s http://localhost:3000/health | jq . || echo "❌ Local service not running"

echo ""
echo "Koyeb service (if deployed):"
KOYEB_URL="https://ai-file-processor-backend-username.koyeb.app"
curl -s "$KOYEB_URL/health" 2>/dev/null | jq . || echo "❌ Koyeb service not responding"