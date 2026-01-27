import { Injectable, ForbiddenException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { from, of, switchMap, map, catchError } from 'rxjs';
import { UserType } from "@shared/enums";
import { getFirebaseAdmin } from "../firebase-admin/firebase-admin.config";
import { fileTypeFromBuffer } from 'file-type';
import {
  FileExtensions,
  getAllowedMimeTypes,
  isAllowedExtension,
  isAllowedMimeType
} from "@shared/constants/upload-limits";
import { USER_DAILY_LIMITS, USER_FILE_SIZE_LIMITS_MB } from "@shared/constants";
import { ALLOWED_FILE_EXTENSIONS } from "@shared/constants";
// import { ALLOWED_FILE_EXTENSIONS } from "@ai-file-processor/shared";


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

  uploadFile(file: Express.Multer.File, user: { uid: string; type: UserType }) {
    const ext = file.originalname.split('.').pop()?.toLowerCase() as FileExtensions;
    if (!ext || !isAllowedExtension(ext)) {
      throw new BadRequestException(
        `Недопустимый формат файла. Допустимые: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`
      );
    }

    return from(
      user.type !== UserType.FREE
        ? this.usersService.findByFirebaseUid(user.uid)
        : of(user) // гостевой пользователь — сразу передаем
    ).pipe(
      switchMap(foundUser => {
        if (!foundUser) throw new ForbiddenException('Пользователь не найден');

        return from(this.usersService.getTodayUploadCount(foundUser.uid)).pipe(
          switchMap(count => {
            const dailyLimit = USER_DAILY_LIMITS[foundUser.type as UserType];
            if (count >= dailyLimit) {
              throw new ForbiddenException(
                `Достигнут лимит операций в день для ${foundUser.type} пользователя (${dailyLimit})`
              );
            }

            const sizeMB = file.size / (1024 * 1024);
            const maxSize = USER_FILE_SIZE_LIMITS_MB[foundUser.type as UserType][ext];
            if (sizeMB > maxSize) {
              throw new BadRequestException(
                `Превышен допустимый размер файла для ${foundUser.type} пользователя (${maxSize} MB)`
              );
            }

            return from(fileTypeFromBuffer(file.buffer)).pipe(
              map(detected => {
                console.log("ALLOWED_MIME_TYPES---", getAllowedMimeTypes())
                if (!detected || !isAllowedMimeType(detected.mime)) {
                  throw new BadRequestException(
                    `Недопустимый тип файла. Допустимые: ${getAllowedMimeTypes().join(', ')}`
                  );
                }
                return foundUser;
              })
            );
          })
        );
      }),
      switchMap(finalUser => {
        const fileName = `${finalUser.uid}/${Date.now()}_${file.originalname}`;
        const fileUpload = this.bucket.file(fileName);

        return from(
          fileUpload.save(file.buffer, {
            metadata: { contentType: file.mimetype },
            resumable: false,
          })
        ).pipe(
          switchMap(() =>
            from(
              fileUpload.getSignedUrl({
                action: 'read',
                expires:
                  finalUser.type === UserType.FREE
                    ? Date.now() + 1000 * 60 * 60
                    : Date.now() + 1000 * 60 * 60 * 24 * 30,
              })
            )
          ),
          switchMap(([url]) =>
            from(this.usersService.recordUpload(finalUser.uid)).pipe(
              map(() => ({
                fileName,
                url,
                sizeMB: file.size / (1024 * 1024),
                mimeType: file.mimetype,
                userType: finalUser.type,
              }))
            )
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
