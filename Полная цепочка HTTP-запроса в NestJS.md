CLIENT Browser (HTTP method URL headers body)
↓
Node.js HTTP server (Express / Fastify)
↓
NestJS platform adapter
↓
GLOBAL MIDDLEWARE (уровень http-сервера Express или Fastify)
├─ CORS и security headers, читать req+res+body+cookie, модиф headers, лог запрос
├─ это уровень http-сервера Express или Fastify
└─ применяются ко всем HTTP-запросам, про контроллеры не знают ничего
↓
Nest Router (уровень Nest)
├─ определяет Controller по урлу
├─ определяет Handler (метод) по урлу 
└─ формирует ExecutionContext по урлу
↓
Middleware (уровень http-сервера Express или Fastify)
├─ работают только для определённых маршрутов
├─ Rate limiting по IP, логирование
└─
↓
Guards (уровень Nest)
├─
├─
└─
↓
Interceptors (уровень Nest) До метода-хэндлера
├─ Обертка вокруг хендлера, может менять данные до и после обработки
├─ Трансформация ответа (самый частый кейс), Логирование, Кэширование
└─ interceptor знает контроллер и метод
↓
Pipes
↓
Controller
↓
Service / Business logic
↓
Interceptors  (уровень Nest) После метода-хэндлера
↓
Exception Filters
↓
HTTP Response

Handler — это метод контроллера, который обрабатывает конкретный HTTP-маршрут
ExecutionContext — NestJS abstraction
2️⃣ Он содержит handler, controller и транспорт
3️⃣ Используется в guards, interceptors, filters
