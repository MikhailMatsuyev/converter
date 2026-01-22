#!/bin/sh
set -e

echo "⏳ Устанавливаем зависимости..."
cd /app/shared
npm install --legacy-peer-deps
cd /app/backend
npm install --legacy-peer-deps

echo "📦 Генерируем Prisma Client..."
npx prisma generate --schema=./src/prisma/schema.prisma

echo "🚀 Запускаем NestJS..."
npm run start:dev

