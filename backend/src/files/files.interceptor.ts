import { Injectable, BadRequestException, NestInterceptor, ExecutionContext, CallHandler, mixin } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ALLOWED_FILE_EXTENSIONS, MAX_FILE_SIZE_MB } from '@shared/constants/user-limits';

export function FilesUploadInterceptor(fieldName: string): any {
  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler) {
      // здесь можно добавить логику до/после, если нужно
      return next.handle();
    }
  }

  return mixin(FileInterceptor(fieldName, {
    storage: diskStorage({}),
    limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ext = file.originalname.split('.').pop()?.toLowerCase();
      if (!ext || !ALLOWED_FILE_EXTENSIONS.includes(ext)) {
        return cb(new BadRequestException(`Недопустимый формат файла: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`), false);
      }
      cb(null, true);
    },
  }));
}
