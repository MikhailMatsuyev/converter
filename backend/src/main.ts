// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { Observable, from, of, forkJoin } from 'rxjs';
import { tap, catchError, switchMap, map } from 'rxjs/operators';
import { INestApplication } from '@nestjs/common/interfaces/nest-application.interface';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { getFirebaseAdmin } from "./firebase-admin/firebase-admin.config";

// Правильные типы
const createNestApp$ = (): Observable<INestApplication> => {
  const logger = new Logger('NestFactory');
  const server = express();

  return from(NestFactory.create<INestApplication>(
    AppModule,
    new ExpressAdapter(server)
  )).pipe(
    tap(() => logger.log('🚀 Application instance created')),
    catchError((error: Error) => {
      logger.error('💥 Failed to create application', error.stack);
      return from(Promise.reject<INestApplication>(error));
    })
  );
};

// Типизированная настройка Swagger
const setupSwagger$ = (app: INestApplication): Observable<void> => {
  const logger = new Logger('Swagger');

  return new Observable<void>(observer => {
    try {
      logger.log('📚 Configuring Swagger documentation...');

      const config = new DocumentBuilder()
        .setTitle('AI File Processor API')
        .setDescription('Реактивное REST API для обработки файлов с ИИ')
        .setVersion('1.0.0')
        .addTag('files', 'Операции с файлами через reactive streams')
        .addTag('auth', 'Аутентификация Firebase')
        .addTag('users', 'Управление пользователями')
        .addTag('health', 'Мониторинг здоровья')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
        .addServer('http://localhost:3000', 'Локальная разработка')
        .addServer('https://api.ai-file-processor.com', 'Продакшен')
        .setContact('Development Team', 'https://github.com/ai-file-processor', 'dev@ai-file-processor.com')
        .setLicense('MIT', 'https://opensource.org/licenses/MIT')
        .setExternalDoc('Документация', 'https://docs.ai-file-processor.com')
        .build();

      const document = SwaggerModule.createDocument(app, config, {
        operationIdFactory: (controllerKey: string, methodKey: string) =>
          `${controllerKey.replace('Controller', '')}.${methodKey}`
      });

      SwaggerModule.setup('api', app, document, {
        explorer: true,
        swaggerOptions: {
          filter: true,
          docExpansion: 'list',
          showRequestDuration: true,
          persistAuthorization: true,
          displayOperationId: true,
          operationsSorter: 'method',
          tagsSorter: 'alpha',
          defaultModelRendering: 'model',
          defaultModelsExpandDepth: 2,
          defaultModelExpandDepth: 2,
          syntaxHighlight: {
            active: true,
            theme: 'monokai'
          },
          tryItOutEnabled: true,
          requestSnippetsEnabled: true
        }
      });

      logger.log('✅ Swagger ready at /api');
      observer.next();
      observer.complete();
    } catch (error) {
      observer.error(error as Error);
    }
  }).pipe(
    catchError((error: Error) => {
      logger.warn('⚠️ Swagger setup failed, continuing without documentation', error.message);
      return of(void 0);
    })
  );
};

// Типизированный запуск сервера
const startServer$ = (app: INestApplication): Observable<{ app: INestApplication; url: string }> => {
  const logger = new Logger('Server');

  return new Observable<{ app: INestApplication; url: string }>(observer => {
    const port = process.env.PORT || 3000;
    const host = '0.0.0.0';

    app.enableCors({
      origin: 'http://localhost:4200',
      credentials: true,
    });

    app.listen(port, host)
      .then(() => {
        const url = `http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`;
        observer.next({ app, url });
        observer.complete();
      })
      .catch((error: Error) => {
        observer.error(error);
      });
  }).pipe(
    tap(({ url }) => {
      const banner = `
╔══════════════════════════════════════════════════════════════════════════╗
║                    AI FILE PROCESSOR                                     ║
║                    REACTIVE API v1.0                                     ║
╟──────────────────────────────────────────────────────────────────────────╢
║  🚀 Server:    ${url.padEnd(39)}                               ║
║  📅 Started:   ${new Date().toLocaleString().padEnd(39)}       ║
╚══════════════════════════════════════════════════════════════════════════╝
      `.trim();

      logger.log(`\n${banner}\n`);
    }),
    catchError((error: Error) => {
      logger.error(`❌ Failed to start server on port ${process.env.PORT || 3000}`, error.stack);
      return from(Promise.reject<{ app: INestApplication; url: string }>(error));
    })
  );
};

// Типизированный bootstrap
interface BootstrapResult {
  app: INestApplication;
  url: string;
}

const bootstrap$: Observable<BootstrapResult> = createNestApp$().pipe(
  tap(() => {
    // 🔥 ИНИЦИАЛИЗАЦИЯ FIREBASE ADMIN (ОДИН РАЗ ПРИ СТАРТЕ)
    getFirebaseAdmin();
    const logger = new Logger('Firebase');
    logger.log('🔥 Firebase Admin initialized');
  }),
  switchMap((app: INestApplication) =>
    forkJoin([
      setupSwagger$(app),
      of(app)
    ])
  ),
  switchMap(([, app]: [void, INestApplication]) =>
    startServer$(app)
  ),
  tap(({ app, url }: BootstrapResult) => {
    const logger = new Logger('Bootstrap');

    // Типизированные настройки CORS
    app.enableCors({
      origin: [
        'http://localhost:4200',
        'http://localhost:3000',
        'http://localhost:8080'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-KEY']
    });

    logger.log(`🎉 Application bootstrap completed successfully!`);
    logger.log(`🔗 Base URL: ${url}`);

    app.use((req, res, next) => {
      console.log('raw files:', req.files);
      console.log('raw body:', req.body);
      next();
    });

    // Типизированный graceful shutdown
    const gracefulShutdown = (signal: string): void => {
      logger.log(`\n⚠️  Received ${signal}. Gracefully shutting down...`);
      app.close()
        .then(() => {
          logger.log('✅ HTTP server closed');
          process.exit(0);
        })
        .catch((error: Error) => {
          logger.error('❌ Error during shutdown', error);
          process.exit(1);
        });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }),
  catchError((error: Error) => {
    const logger = new Logger('Bootstrap');
    logger.error('💥 Bootstrap pipeline failed', error.stack);
    return from(Promise.reject<BootstrapResult>(error));
  })
);

// Запуск с правильными типами
bootstrap$.subscribe({
  next: (result: BootstrapResult) => {
    const logger = new Logger('Main');
    logger.log(`🚀 Server running at ${result.url}`);
  },
  error: (error: Error) => {
    const logger = new Logger('Main');
    logger.error('💀 Fatal error during bootstrap', error.stack);
    process.exit(1);
  }
});

// Типизированные обработчики ошибок
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  const logger = new Logger('UnhandledRejection');
  const error = reason instanceof Error ? reason : new Error(String(reason));
  logger.error(`⚠️  Unhandled Rejection at: ${promise}, reason: ${error.message}`, error.stack);
});

process.on('uncaughtException', (error: Error) => {
  const logger = new Logger('UncaughtException');
  logger.error(`💀 Uncaught Exception: ${error.message}`, error.stack);
  process.exit(1);
});
