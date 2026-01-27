import { Injectable, NestInterceptor, ExecutionContext, CallHandler, mixin, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Observable } from 'rxjs';
import { ALLOWED_FILE_EXTENSIONS, MAX_FILE_SIZE_MB } from '@shared/constants';
import { isAllowedExtension } from "@shared/constants/upload-limits";

export function FilesUploadInterceptor(fieldName: string = 'files', maxCount: number = 10): any {
  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    private readonly interceptor;

    constructor() {
      // создаем экземпляр интерцептора Multer
      this.interceptor = new (FilesInterceptor(fieldName, maxCount, {
        storage: memoryStorage(),
        limits: {fileSize: MAX_FILE_SIZE_MB * 1024 * 1024},
        fileFilter: (req, file, cb) => {
          const ext = file.originalname.split('.').pop()?.toLowerCase();
          if (!ext || !isAllowedExtension(ext)) {
            console.log('❌ Rejected extension:', ext);
            return cb(
              new BadRequestException(`❌ERROR❌ Разрешены только: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`),
              false,
            );
          }
          console.log('✅ File accepted:', file.originalname);
          cb(null, true);
        },
      }) as any)(); // создаем экземпляр класса
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      // вызываем Multer интерцептор
      return this.interceptor.intercept(context, next);
    }
  }

  return mixin(MixinInterceptor);
}
