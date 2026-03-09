import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Проверь путь
import { FilesGateway } from './files.gateway';
import { FileStatus } from '@prisma/client';

@Injectable()
@Processor('file-processing')
export class FileProcessor extends WorkerHost {
  private readonly logger = new Logger(FileProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly filesGateway: FilesGateway,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { fileId, userId, mimetype } = job.data;

    this.logger.log(`[🚀] Начинаю обработку файла ${fileId} для пользователя ${userId}`);

    try {
      // 1. Ставим статус PROCESSING в БД
      await this.prisma.file.update({
        where: { id: fileId },
        data: { status: FileStatus.PROCESSING },
      });

      // 2. Уведомляем фронтенд о начале работы
      this.filesGateway.sendFileStatusUpdate(userId, {
        fileId,
        status: FileStatus.PROCESSING,
      });

      // 3. Имитируем тяжелую работу (Sharp / AI / PDF-lib)
      // Здесь будет реальная логика обработки позже
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // 4. Обновляем БД: статус COMPLETED
      const updatedFile = await this.prisma.file.update({
        where: { id: fileId },
        data: { status: FileStatus.COMPLETED },
      });

      this.logger.log(`[✅] Файл ${fileId} успешно обработан!`);

      // 5. Уведомляем фронтенд об успехе
      this.filesGateway.sendFileStatusUpdate(userId, {
        fileId,
        status: FileStatus.COMPLETED,
        url: updatedFile.url ?? undefined, // Ссылка на готовый файл
      });

      return { status: 'success', fileId };
    } catch (error) {
      this.logger.error(`[❌] Ошибка при обработке файла ${fileId}:`, error);

      // Если упали — фиксируем в базе
      await this.prisma.file.update({
        where: { id: fileId },
        data: { status: FileStatus.FAILED },
      }).catch(() => null); // Игнорим ошибку БД, если файл не найден

      // Уведомляем фронтенд о провале
      this.filesGateway.sendFileStatusUpdate(userId, {
        fileId,
        status: FileStatus.FAILED,
      });

      throw error; // Чтобы BullMQ знал, что задача провалена и её можно повторить
    }
  }
}
