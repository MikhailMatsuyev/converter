#!/bin/bash
echo "🚀 Setting up AI File Processor..."

# Создаем .env файл если его нет
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Created .env file. Please update it with your values!"
fi

# Устанавливаем зависимости
echo "📦 Installing shared dependencies..."
cd shared && npm install

echo "📦 Installing backend dependencies..."
cd ../backend && npm install

echo "📦 Installing frontend dependencies..."
cd ../frontend && npm install

echo "✅ Setup complete!"
echo ""
echo "To start locally with Docker:"
echo "  docker-compose up -d"
echo ""
echo "To start backend only:"
echo "  cd backend && npm run start:dev"