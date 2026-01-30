import { NestFactory } from '@nestjs/core';
import { AppModule } from "./src/app.module";
import { UsersService } from "./src/users/users.service";
import { UserType } from "@ai-file-processor/shared";

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);

  const usersService = appContext.get(UsersService);

  const testUser = await usersService.createFromFirebase({
    firebaseUid : 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    type: UserType.USER,
  }).toPromise();

  console.log('Test user created:', testUser);

  await appContext.close();
}

bootstrap();
