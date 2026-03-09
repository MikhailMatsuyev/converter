import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileProcessor } from './file.processor';
import { FilesGateway } from "./files.gateway";
import { UsersModule } from "../users/users.module";
import { PrismaModule } from "../prisma/prisma.module"; // Наш новый воркер

@Module({
  imports: [
    // Регистрируем очередь именно здесь, чтобы она была доступна в контроллере
    PrismaModule,
    UsersModule,
    BullModule.registerQueue({
      name: 'file-processing',
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService, FileProcessor, FilesGateway],
  exports: [FilesService],
})
export class FilesModule {}
