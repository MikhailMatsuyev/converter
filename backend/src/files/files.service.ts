import { Injectable, ForbiddenException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { from, of, switchMap, map, catchError } from 'rxjs';
import { ALLOWED_FILE_EXTENSIONS, USER_DAILY_LIMITS, USER_FILE_SIZE_LIMITS_MB } from "@shared/constants";
import { UserType } from "@shared/enums";
import { getFirebaseAdmin } from "../firebase-admin/firebase-admin.config";

@Injectable()
export class FilesService {
  private bucket: any;

  constructor(private readonly usersService: UsersService) {
    const admin = getFirebaseAdmin();
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET?.trim();

    if (!bucketName) {
      throw new Error('FIREBASE_STORAGE_BUCKET is not set!');
    }

    this.bucket = admin.storage().bucket(bucketName);
    console.log('🔥 Firebase bucket instance created:', this.bucket.name);
  }

  uploadFile(file: Express.Multer.File, uid: string) {
    // 1️⃣ Проверка формата файла
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_FILE_EXTENSIONS.includes(ext)) {
      throw new BadRequestException(
        `Недопустимый формат файла. Допустимые: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`
      );
    }

    return from(this.usersService.findByFirebaseUid(uid)).pipe(
      switchMap(user => {
        if (!user) throw new ForbiddenException('Пользователь не найден');

        // 2️⃣ Проверка лимитов Free/Paid
        return from(this.usersService.getTodayUploadCount(uid)).pipe(
          switchMap(count => {
            const dailyLimit = USER_DAILY_LIMITS[user.type as UserType];
            if (count >= dailyLimit) {
              throw new ForbiddenException(
                `Достигнут лимит операций в день для ${user.type} пользователя (${dailyLimit})`
              );
            }

            // лимит по размеру файла
            const sizeMB = file.size / (1024 * 1024);
            const maxSize = USER_FILE_SIZE_LIMITS_MB[user.type as UserType][ext];
            if (sizeMB > maxSize) {
              throw new BadRequestException(
                `Превышен допустимый размер файла для ${user.type} пользователя (${maxSize} MB)`
              );
            }

            return of(user);
          })
        );
      }),
      switchMap(user => {
        // 3️⃣ Загрузка в Firebase
        const fileName = `${uid}/${Date.now()}_${file.originalname}`;
        const fileUpload = this.bucket.file(fileName);

        return from(fileUpload.save(file.buffer, {
          metadata: { contentType: file.mimetype },
          resumable: false,
        })).pipe(
          // 4️⃣ Генерация signed URL
          switchMap(() =>
            from(fileUpload.getSignedUrl({
              action: 'read',
              expires: user.type === UserType.FREE
                ? Date.now() + 1000 * 60 * 60               // 1 час
                : Date.now() + 1000 * 60 * 60 * 24 * 30,   // 30 дней
            }))
          ),
          map(([url]) => ({ fileName, url })),
          // 5️⃣ Запись факта загрузки для лимитов
          switchMap(result =>
            from(this.usersService.recordUpload(uid)).pipe(map(() => result))
          ),
          catchError(err => {
            console.error(err);
            throw new InternalServerErrorException('Ошибка загрузки файла');
          })
        );
      })
    );
  }
}
