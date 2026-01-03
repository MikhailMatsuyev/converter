# AI File Processor - Контекст проекта
**Последнее обновление:** 2025-01-24  
**Текущая фаза:** Инициализация проектов

## 🎯 Цель проекта
Production-like MVP для резюме: веб-приложение для обработки PDF и раскраски ч/б фото с ИИ.
- **Frontend:** Angular 21 (standalone)
- **Backend:** NestJS 11 (модульный монолит)
- **Auth:** Firebase Google OAuth
- **Деплой:** Google Cloud (Cloud Run + Firebase Hosting)

## ☁️ Инфраструктура (Google Cloud)
- **Free Trial:** $300 кредитов на 90 дней
- **Cloud Run:** NestJS бэкенд (Always Free tier)
- **Cloud SQL:** PostgreSQL db-f1-micro ($15/мес → покрывается кредитами)
- **Firebase Hosting:** Angular фронтенд (Always Free)
- **Firebase Auth:** Google OAuth (50K аутентификаций/мес бесплатно)
- **Firebase Storage:** 5GB файлов (Always Free)

## ПРОЦЕСС РАЗРАБОТКИ
┌────────────────────────────────────────────────────────────┐
│                     ПРОЦЕСС РАЗРАБОТКИ                     │
├────────────────────────────────────────────────────────────┤
│ 1. ЗАПУСК:                                                 │
│    docker-compose up -d     → Backend в Docker             │
│    cd frontend && npm start → Frontend локально            │
│                                                            │
│ 2. ИЗМЕНЕНИЯ КОДА:                                         │
│    Изменяем backend/src/ → Docker hot reload               │
│    Изменяем frontend/src/ → Angular hot reload             │
│                                                            │
│ 3. УСТАНОВКА НОВЫХ ПАКЕТОВ:                                │
│    Frontend: cd frontend && npm install <пакет>            │
│    Backend: docker-compose up --build -d                   │
│                                                            │
│ 4. ОЧИСТКА:                                                │
│    Backend/Shared: Удаляем локальные node_modules          │
│    Frontend: Оставляем node_modules для работы             │
└────────────────────────────────────────────────────────────┘

## 🐳 ДОКЕР-КОНФИГУРАЦИЯ (РАБОЧАЯ)

### Архитектура Workspaces
ai-file-processor/
├── package.json # Корневой package.json с workspaces
│ "workspaces": ["shared", "backend"] ← Управление зависимостями
├── backend/ # NestJS бэкенд
├── shared/ # Общие типы TypeScript (@ai-file-processor/shared)
└── frontend/ # Angular (отдельно, не в workspaces)


## Процес деплоя
# 1. Сборка образа (контейнеры могут работать)
docker build -t mikhailmatsuev/ai-file-processor:latest .

# 2. Перед тестом остановить если порт занят
docker stop nest-backend 2>/dev/null || true

# 3. Тест нового образа
docker run -p 3000:3000 --name test-app mikhailmatsuev/ai-file-processor:latest

# 4. Если тест ок - загрузить в Docker Hub
docker push mikhailmatsuev/ai-file-processor:latest

# 5. На Koyeb сделать redeploy (старый контейнер Koyeb сам заменит)
# 6. Вернуть локально дев окружение
docker-compose up -d


## 🏗️ Архитектура

ai-file-processor/
├── frontend/                    # Angular 21 → Firebase Hosting
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   └── utils/
│   ├── angular.json
│   └── tsconfig.json
│
├── backend/                     # NestJS 11 → Cloud Run
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── files/
│   │   │   └── users/
│   │   ├── common/
│   │   └── main.ts
│   ├── Dockerfile              # Контейнеризация для Cloud Run
│   ├── cloudbuild.yaml         # CI/CD пайплайн
│   └── tsconfig.json
│
├── shared/                      # Единая система типов
│   ├── src/
│   │   ├── interfaces/         # Общие интерфейсы-контракты
│   │   │   ├── file.interface.ts      # IFile
│   │   │   ├── user.interface.ts      # IUser
│   │   │   └── processable.interface.ts
│   │   │
│   │   ├── backend/            # Типы для NestJS
│   │   │   ├── dto/
│   │   │   │   ├── request/    # DTO запросов
│   │   │   │   └── response/   # DTO ответов
│   │   │   └── entities/       # Сущности TypeORM
│   │   │
│   │   └── frontend/           # Типы для Angular
│   │       ├── models/         # UI-модели
│   │       └── types/          # Фронтенд-специфичные типы
│   │
│   ├── package.json
│   └── tsconfig.json           # Алиасы: @shared/*, @interfaces/* и т.д.
│
├── firebase/                   # Firebase конфигурация
│   ├── storage.rules          # Правила доступа к файлам
│   └── firebase.json
│
└── project_context.md          # Этот файл

┌────────────────────────────────────────────────┐
│             Google Cloud Platform              │
├────────────────────────────────────────────────┤
│  🌍 Регион: europe-west3 (Франкфурт, Германия) │
│                                                │
│  ┌─────────────┐     ┌─────────────┐           │
│  │ Cloud Run   │◄───►│ Cloud SQL   │           │
│  │ (NestJS)    │     │ (PostgreSQL)│           │
│  └─────────────┘     └─────────────┘           │
│         │                     │                │
│         ▼                     ▼                │
│  ┌─────────────┐     ┌─────────────┐           │
│  │ Интернет    │     │ Приватный IP│           │
│  │ (Публичный) │     │ (VPC)       │           │
│  └─────────────┘     └─────────────┘           │
│                                                │
│  🌐 Firebase Hosting (Глобальный CDN)          │
│  (Angular статика)                             │
└────────────────────────────────────────────────┘

Архитектура с PostgreSQL:

┌─────────────────────────────────────────────────────────────────┐
│                      Google Cloud Platform                      │
├─────────────────────────────────────────────────────────────────┤
├─────────────────┐     ┌─────────────────┐     ┌─────────────────┤
│   Angular App   │────▶│   NestJS API    │────▶│   PostgreSQL    │
│   (Frontend)    │     │   (Backend)     │     │   (Cloud SQL)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Firebase Auth   │     │Firebase Storage │     │   TypeORM       │
│ (Google OAuth)  │     │ (User Files)    │     │   (ORM)         │
└─────────────────┘     └─────────────────┘     └─────────────────┘


🗺️ Схема проекта с Docker Compose

E:\project\converter\ai-file-processor\         ← КОРЕНЬ ПРОЕКТА
├── 📁 frontend/                    # Angular (локально, НЕ в Docker)
│   ├── src/
│   ├── proxy.conf.json            # ← Прокси на бэкенд
│   ├── angular.json
│   └── package.json
│
├── 📁 backend/                     # NestJS (в Docker)
│   ├── src/
│   ├── Dockerfile                 # ← Для продакшена (Cloud Run)
│   ├── Dockerfile.dev             # ← Для разработки
│   ├── package.json
│   └── tsconfig.json
│
├── 📁 shared/                      # Общие типы TypeScript
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
│
├── 📁 firebase/                    # Firebase конфиги
│   ├── storage.rules
│   └── firebase.json
│
├── 📄 docker-compose.yml          # ← ГЛАВНЫЙ ФАЙЛ (здесь!)
├── 📄 docker-compose.override.yml # ← Опционально: переопределения
├── 📄 .env                        # Переменные окружения
├── 📄 .dockerignore
└── 📄 project_context.md

## 🧠 Архитектурные решения и паттерны

### 📦 Паттерны проектирования
- **Модульный монолит (Modular Monolith)** — логическое разделение на модули в рамках одного приложения
- **Repository Pattern** — для работы с БД (абстракция над TypeORM)
- **Service Layer** — бизнес-логика инкапсулирована в сервисах
- **DTO Pattern** — явное разделение между сущностями БД и объектами передачи
- **Dependency Injection** — встроен в Angular и NestJS, используется везде
- **Interface-based DTO/Model** - Интерфейс (контракт) → Множественные реализации (DTO для бэка and Models для фронта) с разными ответственностями

### 📊 Система типов и интерфейсов (TypeScript)
shared/    ← ТОЛЬКО ТИПЫ (интерфейсы, типы, enums)
backend/   ← РЕАЛИЗАЦИЯ (декораторы NestJS, TypeORM)
frontend/  ← РЕАЛИЗАЦИЯ (Angular модели, сервисы)

### 📚 Правила для shared/:
Только TypeScript типы (интерфейсы, типы, enums)
Никаких декораторов (@ApiProperty, @Entity, @Column)
Никаких runtime зависимостей (class-validator, typeorm, @nestjs/*)
Только структура данных, без логики

**Принципы работы:**
1. **Интерфейсы-контракты** — общие интерфейсы в `interfaces/` (IFile, IUser)
2. **DTO классы** — реализуют интерфейсы + валидация + Swagger декораторы
3. **Сущности БД** — реализуют интерфейсы + TypeORM декораторы
4. **Frontend модели** — реализуют интерфейсы + UI-специфичные поля

**Пример имплементации:**

// 1. Интерфейс (общий контракт)
export interface IFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
}

// 2. DTO для бэка (NestJS)
export class UploadFileDto implements IFile {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsNumber() size: number;
  // + Swagger и валидация
}

// 3. Модель для фронта (Angular)
export class FileModel implements IFile {
  id: string; name: string; size: number; mimeType: string;
  progress: number; // UI-специфичное поле
  status: string;   // UI-специфичное поле
}
### 🔌 Коммуникация между фронтендом и бэкендом
REST API — основной протокол (NestJS контроллеры)

Swagger/OpenAPI — автоматическая документация API

WebSocket — планируется для real-time уведомлений о процессе обработки

Firebase Storage — прямые загрузки файлов с signed URLs

### 🗄️ Работа с данными
PostgreSQL — основная реляционная БД

TypeORM — ORM для работы с БД

Firebase Storage — хранение пользовательских файлов

Кэширование: Redis (планируется на Phase 2)

### 🔄 Реактивное программирование (Observables)
Frontend (Angular): Все HTTP-запросы возвращают Observable<T>

Backend (NestJS): Поддержка реактивных стримов через RxJS

State Management: Использование BehaviorSubject для управления состоянием

💰 Финансовый план
Месяцы 1-3: $0 (всё покрывается $300 кредитами Google Cloud)

После 90 дней:

Вариант A: $7-15/мес за Cloud SQL (остальное бесплатно)

Вариант B: Миграция БД на Supabase → $0 полностью

Вариант C: Переход на Always Free + отдельный хостинг БД

✅ Выполнено
1. Планирование
Определен стек: Angular 21 + NestJS 11 + Node.js 20.19+

Выбрана архитектура: модульный монолит (не микросервисы)

Решено: упрощённая авторизация (Google OAuth только)

Добавлен Swagger для документации API

Создана общая папка shared/ для типов

Определена инфраструктура: Google Cloud + Firebase

2. Настройка инфраструктуры
Node.js 20.19.0+ установлен

Firebase проект создан: ai-file-processor

Google Sign-in включён в Firebase Authentication

Конфиг firebaseConfig сохранён в корне проекта

Решение по БД: PostgreSQL на Cloud SQL (первые 90 дней из кредитов)

3. Инициализация проектов (выполняется сейчас)
Создана структура папок (frontend/, backend/, shared/)

Angular 21 проект создан (standalone, SCSS, routing)

NestJS 11 проект создан

Настроены TypeScript алиасы для shared/

Создан базовый Dockerfile для NestJS

Настроен firebase/ каталог с конфигами

## ✅ Выполнено
### 1. Планирование
- [x] Определен стек: Angular 21 + NestJS 11 + Node.js 20.19+
- [x] Выбрана архитектура: модульный монолит (не микросервисы)
- [x] Решено: упрощённая авторизация (Google OAuth только)
- [x] Добавлен Swagger для документации API
- [x] Создана общая папка `shared/` для типов
- [x] Определена инфраструктура: Google Cloud + Firebase

### 2. Настройка инфраструктуры
- [x] Node.js 20.19.0+ установлен
- [x] Firebase проект создан: `ai-file-processor`
- [x] Google Sign-in включён в Firebase Authentication
- [x] Конфиг `firebaseConfig` сохранён в корне проекта
- [x] Решение по БД: PostgreSQL на Cloud SQL (первые 90 дней из кредитов)

### 3. Инициализация проектов (выполняется сейчас)
- [х] Создана структура папок (frontend/, backend/, shared/)
- [х] Angular 21 проект создан (standalone, SCSS, routing)
- [х] NestJS 11 проект создан
- [х] Настроены TypeScript алиасы для `shared/`
- [х] Создан базовый Dockerfile для NestJS
- [х] Настроен firebase/ каталог с конфигами


📦 Зависимости
Backend зависит от Shared: "@ai-file-processor/shared": "file:../shared"
Shared публикует типы: "main": "dist/index.js", "types": "dist/index.d.ts"
Корневой package.json управляет workspaces


🔧 Текущие задачи
Завершить инициализацию проектов:


# AI File Processor - План разработки ✅

## 🔧 ШАГ 1: Проверка окружения ✅ ВЫПОЛНЕНО
- [x] Бэкенд доступен: `http://localhost:3000/health`
- [x] Swagger доступен: `http://localhost:3000/api`
- [x] PgAdmin доступен: `http://localhost:5050`
- [x] PostgreSQL запущен (порт 5432)
- [x] Docker контейнеры: `backend`, `postgres`, `pgadmin`

## 🔐 ШАГ 2: Настройка Auth (Firebase)
### Backend (NestJS):
- [x] Установить Firebase Admin SDK: `npm install firebase-admin`
- [x] Создать модуль `auth`: `nest g module auth`
- [x] Создать сервис `auth`: `nest g service auth`
- [x] Создать guard: `nest g guard auth/guards/firebase`
- [x] Создать контроллер: `nest g controller auth`
- [x] Создать DTO: `login.dto.ts`, `auth-response.dto.ts`
- [x] Создать конфиг Firebase: `firebase.config.ts`
- [x] Добавить эндпоинты: `/auth/login`, `/auth/me`, `/auth/verify`
- [x] Интегрировать AuthModule в AppModule
- [ ] Настроить стратегию JWT Firebase в guard
- [ ] Протестировать аутентификацию через Swagger

### Frontend (Angular):
- [ ] Установить Firebase SDK: `npm install firebase`
- [ ] Создать сервис: `ng g service services/auth`
- [ ] Создать компонент Login: `ng g component pages/login`
- [ ] Настроить Firebase конфиг из `firebase-config.txt`
- [ ] Реализовать Google Sign-in

## 📁 ШАГ 3: Настройка Files модуля
### Backend:
- [ ] Создать модуль `files`: `nest g module files`
- [ ] Создать сервис `files`: `nest g service files`
- [ ] Создать контроллер `files`: `nest g controller files`
- [ ] Настроить загрузку файлов (multipart/form-data)
- [ ] Интегрировать Firebase Storage

### Frontend:
- [ ] Создать сервис: `ng g service services/file`
- [ ] Создать компонент Upload: `ng g component/components/file-upload`
- [ ] Реализовать drag-and-drop загрузку
- [ ] Отображение прогресса загрузки

## 👤 ШАГ 4: Настройка Users модуля
### Backend:
- [ ] Создать модуль `users`: `nest g module users`
- [ ] Создать сущность User для TypeORM
- [ ] Создать сервис для управления пользователями
- [ ] Эндпоинты: `/users/profile`, `/users/stats`

## 🗃️ ШАГ 5: Настройка БД и TypeORM
- [ ] Настроить TypeORM конфигурацию в `backend`
- [ ] Создать миграции для User и File сущностей
- [ ] Проверить связь между таблицами
- [ ] Настроить репозитории

## 🎨 ШАГ 6: Базовый UI и Routing
- [ ] Настроить routing в Angular
- [ ] Создать Layout компонент
- [ ] Компонент Dashboard
- [ ] Навигационное меню
- [ ] Защищённые роуты (Auth Guard)

## 🔗 ШАГ 7: Интеграция и CORS
- [ ] Настроить CORS в NestJS
- [ ] Подключить frontend к backend API
- [ ] Настроить интерцепторы для авторизации
- [ ] Глобальная обработка ошибок

## 🤖 ШАГ 8: AI обработка (заглушки)
- [ ] Создать сервис для обработки PDF (mock)
- [ ] Создать сервис для раскраски фото (mock)
- [ ] Очередь обработки (простейшая реализация)
- [ ] WebSocket для real-time уведомлений

## 🧪 ШАГ 9: Тестирование
- [ ] Протестировать полный flow: вход → загрузка → обработка
- [ ] Проверить работу с разными типами файлов
- [ ] Тестирование ошибок и edge cases
- [ ] Проверить UI на мобильных устройствах

## 🚀 ШАГ 10: Деплой подготовка
- [ ] Собрать production build frontend
- [ ] Протестировать Docker образ
- [ ] Настроить environment variables
- [ ] Подготовить к деплою на Cloud Run



powershell
# Выполнить в PowerShell:
cd E:\project\converter
mkdir frontend, backend, shared, firebase

# Инициализируем shared как npm пакет
cd shared && npm init -y
cd ..

# Создаем Angular проект
ng new frontend --standalone --skip-tests --style=scss --routing --package-manager=npm --skip-git

# Создаем NestJS проект
nest new backend --package-manager=npm --skip-git

# Создаем базовый Dockerfile для Cloud Run
New-Item backend/Dockerfile -Type File
New-Item backend/cloudbuild.yaml -Type File

# Создаем firebase конфиги
New-Item firebase/storage.rules -Type File
New-Item firebase/firebase.json -Type File
