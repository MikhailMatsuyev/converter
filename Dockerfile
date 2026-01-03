# ============ BUILD STAGE ============
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем shared package.json и устанавливаем зависимости
COPY shared/package*.json ./shared/
RUN cd shared && npm install

# Собираем shared
COPY shared/ ./shared/
RUN cd shared && npm run build 2>/dev/null || echo "No build script in shared"

# Копируем backend package.json и устанавливаем зависимости
COPY backend/package*.json ./backend/
RUN cd backend && npm ci

# Собираем backend
COPY backend/ ./backend/
RUN cd backend && npm run build

# ============ PRODUCTION STAGE ============
FROM node:20-alpine

WORKDIR /app

# Устанавливаем только production зависимости backend
COPY backend/package*.json ./
RUN npm ci --only=production --ignore-scripts

# Копируем собранные файлы из builder
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/shared ./shared

# Создаем non-root пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001
USER nestjs

# Health check для Koyeb
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT:-3000}/health', (r) => {if(r.statusCode !== 200) throw new Error()})"

EXPOSE 3000

CMD ["node", "dist/backend/main.js"]
