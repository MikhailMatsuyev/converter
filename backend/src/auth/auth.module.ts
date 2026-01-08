import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from "./auth.controller";
// import { initializeFirebaseAdmin } from "./firebase.config";

@Module({
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {
  // Инициализируем Firebase при запуске модуля
  constructor() {
    // initializeFirebaseAdmin();
  }
}
