import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException, mixin, Type } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Observable } from 'rxjs';

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_FILE_EXTENSIONS = ['jpg', 'png', 'pdf'];

function isAllowedExtension(ext: string): boolean {
  return ALLOWED_FILE_EXTENSIONS.includes(ext);
}

export function FilesUploadInterceptor(
  fieldName: string = 'files',
  maxCount: number = 10,
): Type<NestInterceptor> {

  // Создаем внутренний класс-миксин
  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    private readonly filesInterceptor: NestInterceptor;

    constructor() {
      // FilesInterceptor возвращает класс, создаем его экземпляр
      const interceptorClass = FilesInterceptor(fieldName, maxCount, {
        storage: memoryStorage(),
        limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
          const ext = file.originalname.split('.').pop()?.toLowerCase();
          if (!ext || !isAllowedExtension(ext)) {
            return cb(new BadRequestException(
              `❌ Разрешены только: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`,
            ), false);
          }
          cb(null, true);
        },
      });

      this.filesInterceptor = new interceptorClass();
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>>  {
      // Делаем делегирование работы внутреннему FilesInterceptor
      return this.filesInterceptor.intercept(context, next);
    }
  }

  return mixin(MixinInterceptor);
}


// import { Injectable, NestInterceptor, ExecutionContext, CallHandler, mixin, BadRequestException } from '@nestjs/common';
// import { FilesInterceptor } from '@nestjs/platform-express';
// import { memoryStorage } from 'multer';
// import { Observable } from 'rxjs';
// import { ALLOWED_FILE_EXTENSIONS, MAX_FILE_SIZE_MB } from '@shared/constants';
// import { isAllowedExtension } from "@shared/constants/upload-limits";
//
// export function FilesUploadInterceptor(fieldName: string = 'files', maxCount: number = 10): any {
//   @Injectable()
//   class MixinInterceptor implements NestInterceptor {
//     private readonly interceptor;
//
//     constructor() {
//       // создаем экземпляр интерцептора Multer
//       this.interceptor = new (FilesInterceptor(fieldName, maxCount, {
//         storage: memoryStorage(),
//         limits: {fileSize: MAX_FILE_SIZE_MB * 1024 * 1024},
//         fileFilter: (req, file, cb) => {
//           console.log("file===========++++", file)
//           const ext = file.originalname.split('.').pop()?.toLowerCase();
//           if (!ext || !isAllowedExtension(ext)) {
//             console.log('❌ Rejected extension:', ext);
//             return cb(
//               new BadRequestException(`❌ERROR❌ Разрешены только: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`),
//               false,
//             );
//           }
//           console.log('✅ File accepted:', file.originalname);
//           cb(null, true);
//         },
//       }) as any)(); // создаем экземпляр класса
//     }
//
//     intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//       // вызываем Multer интерцептор
//       return this.interceptor.intercept(context, next);
//     }
//   }
//
//   return mixin(MixinInterceptor);
// }
