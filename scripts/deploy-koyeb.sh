#!/bin/bash
echo "🚀 Deploying to Koyeb..."

# Проверка .env файла
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env from .env.example"
    exit 1
fi

# Сборка образа
echo "📦 Building Docker image..."
docker build -t ai-file-processor:latest .

echo "✅ Build complete!"
echo ""
echo "Manual deployment steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Koyeb will auto-deploy from Dockerfile"
echo "3. Check logs at: https://app.koyeb.com/apps/ai-file-processor-backend/logs"