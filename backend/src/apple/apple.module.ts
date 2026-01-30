import { AppleInternalController } from "./controllers/apple.internal.controller";
import { Module } from "@nestjs/common";
import { AppleService } from "./apple.service";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [UsersModule],
  controllers: [AppleInternalController],
  providers: [AppleService],
})
export class AppleModule {}
