import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq'; // Добавляем импорт
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from "./health/health.controller";
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from "@nestjs/core";
import { FirebaseAuthGuard } from "./security/firebase-auth.guard";
import { FirebaseModule } from "./firebase/firebase.module";
import { FilesModule } from "./files/files.module";
import { UsersModule } from "./users/users.module";
import { AppleModule } from "./apple/apple.module";
import { UploadLimitMiddleware } from "./files/upload-limit.middleware";
import { RedisModule } from "./redis/redis.module";

@Module({
  imports: [
    // Настройка BullMQ (движок очередей)
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'redis-dev',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
      },
    }),
    // Регистрация конкретной очереди для файлов
    BullModule.registerQueue({
      name: 'file-processing',
    }),
    AuthModule,
    FirebaseModule,
    FilesModule,
    UsersModule,
    AppleModule,
    RedisModule
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  constructor() {
    console.log("process.env.REDIS_HOST", process.env.REDIS_HOST)
  }
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UploadLimitMiddleware)
      .forRoutes('files/upload-multiple');
  }
}
