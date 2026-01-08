import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from "./health/health.controller";
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from "@nestjs/core";
import { FirebaseAuthGuard } from "./security/firebase-auth.guard";
import { FirebaseModule } from "./firebase/firebase.module";

@Module({
  imports: [AuthModule, FirebaseModule],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
  ],
})
export class AppModule {}
