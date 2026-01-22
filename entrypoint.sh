#!/bin/bash
set -e

echo "🚀 Запуск entrypoint..."

# Переходим в директорию backend
cd /app/backend

echo "📦 Проверяем зависимости..."

# Устанавливаем зависимости, если нужно
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.prisma/client/index.js" ]; then
    echo "📦 Установка/переустановка зависимостей..."
    npm install
fi

# Проверяем, установлен ли @prisma/client
if ! npm list @prisma/client > /dev/null 2>&1; then
    echo "🔧 Устанавливаем @prisma/client..."
    npm install @prisma/client
fi

echo "🔧 Генерация Prisma Client..."
npx prisma generate --schema=src/prisma/schema.prisma

echo "🚀 Запуск NestJS в режиме разработки..."
exec npm run start:dev
