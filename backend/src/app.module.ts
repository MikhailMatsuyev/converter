import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
  imports: [AuthModule, FirebaseModule, FilesModule, UsersModule, AppleModule,
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
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UploadLimitMiddleware)
      .forRoutes('files/upload-multiple'); // применяем к нужному роуту
  }
}
