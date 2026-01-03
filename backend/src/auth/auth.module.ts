import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { initializeFirebaseAdmin } from "./firebase.config";

@Module({
  providers: [AuthService]
})
export class AuthModule {
  // Инициализируем Firebase при запуске модуля
  constructor() {
    initializeFirebaseAdmin();
  }
}
