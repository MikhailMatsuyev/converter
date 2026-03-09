import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilesGateway } from './files.gateway';
import { FileStatus } from '@prisma/client';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
@Processor('file-processing')
export class FileProcessor extends WorkerHost {
  private readonly logger = new Logger(FileProcessor.name);
  // Папка, куда будем сохранять результат (внутри контейнера)
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor(
    private readonly prisma: PrismaService,
    private readonly filesGateway: FilesGateway,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { fileId, userId, buffer, originalName } = job.data;

    this.logger.log(`[🎨] Начинаю Sharp-обработку: ${originalName}`);

    try {
      // 1. Статус в БД -> PROCESSING
      await this.prisma.file.update({
        where: { id: fileId },
        data: { status: FileStatus.PROCESSING },
      });

      this.filesGateway.sendFileStatusUpdate(userId, {
        fileId,
        status: FileStatus.PROCESSING,
      });

      // 2. Подготовка папки
      await fs.mkdir(this.uploadDir, { recursive: true });
      const outputFilename = `thumb-${Date.now()}-${originalName}`;
      const outputPath = path.join(this.uploadDir, outputFilename);

      // 3. МАГИЯ SHARP: Ресайз до 300px и конвертация в JPEG
      // Мы превращаем данные обратно в Buffer, так как BullMQ передает их как массив байтов
      await sharp(Buffer.from(buffer))
        .resize(300, 300, { fit: 'inside' })
        .toFormat('jpeg')
        .jpeg({ quality: 80 })
        .toFile(outputPath);

      // 4. Статус в БД -> COMPLETED + сохраняем путь к превью
      const updatedFile = await this.prisma.file.update({
        where: { id: fileId },
        data: {
          status: FileStatus.COMPLETED,
          url: `/uploads/${outputFilename}` // Ссылка, по которой файл будет доступен
        },
      });

      this.logger.log(`[✅] Sharp завершил работу: ${outputFilename}`);

      this.filesGateway.sendFileStatusUpdate(userId, {
        fileId,
        status: FileStatus.COMPLETED,
        url: updatedFile.url ?? undefined,
      });

      return { status: 'success', path: outputPath };
    } catch (error) {
      this.logger.error(`[❌] Ошибка Sharp для файла ${fileId}:`, error);

      await this.prisma.file.update({
        where: { id: fileId },
        data: { status: FileStatus.FAILED },
      }).catch(() => null);

      this.filesGateway.sendFileStatusUpdate(userId, {
        fileId,
        status: FileStatus.FAILED,
      });

      throw error;
    }
  }
}
