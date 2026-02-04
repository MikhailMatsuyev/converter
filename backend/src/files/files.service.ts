import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { from, of, switchMap, map, catchError, Observable } from 'rxjs';
import { fileTypeFromBuffer } from 'file-type';
import {
  FileExtensions,
  getAllowedMimeTypes,
  isAllowedExtension,
  isAllowedMimeType,
} from '@shared/constants/upload-limits';
import { IUser } from '@shared/interfaces/user.interface';
import { getFirebaseAdmin } from '../firebase-admin/firebase-admin.config';
import { UserType } from "@shared/enums";
import {
  getFileExpiration,
  getSubscriptionTier,
  getUserFileSizeLimit,
  SubscriptionTier,
  USER_DAILY_LIMITS,
  USER_FILE_SIZE_LIMITS_MB
} from "@shared/constants";
import { tap } from "rxjs/operators";
import Redis from "ioredis";

export type FileUser = IUser & { isPaid: boolean };

@Injectable()
export class FilesService {
  private bucket: any;
  private guestUploads: Record<string, number> = {};
  private redis: Redis;
  private redisKey: string

  constructor(private readonly usersService: UsersService) {
    const admin = getFirebaseAdmin();
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET?.trim();
    if (!bucketName) throw new Error('FIREBASE_STORAGE_BUCKET is not set!');
    this.bucket = admin.storage().bucket(bucketName);
  }

  uploadFile(file: Express.Multer.File, user: FileUser) {
    console.log("=====", file.path);
    const ext = file.originalname.split('.').pop()?.toLowerCase() as FileExtensions;
    if (!ext || !isAllowedExtension(ext)) {
      throw new BadRequestException(
        `Недопустимый формат файла. Допустимые: ${getAllowedMimeTypes().join(', ')}`
      );
    }

    const isGuest = !user.firebaseUid; // если нет firebaseUid , считаем гостем
    // const redisKey = `guest-upload-count:${fileUser.firebaseUid}`;
    const userId = isGuest ? 'guest-' + Math.random().toString(36).slice(2) : user.firebaseUid;
    const isPaid = user.isPaid;

    // Для гостя формируем временный объект
    const fileUser$: Observable<FileUser> = user.type !== UserType.GUEST
      ? this.usersService.findByFirebaseUid(user.firebaseUid).pipe(
        map(found => {
          if (!found) throw new ForbiddenException('Пользователь не найден');

          return {
            ...found,
            isPaid: user.isPaid,
            createdAt: found.createdAt,
            updatedAt: found.updatedAt,
          } as FileUser;
        })
      )
      : of({
        id: 'guest-' + Date.now() + Math.random(),
        firebaseUid: 'guest-' + Date.now() + Math.random(),
        email: '',
        displayName: null,
        photoURL: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        storageQuota: 0,
        usedStorage: 0,
        type: UserType.USER,
        isPaid: false,
      } as FileUser);

    return fileUser$.pipe(
      switchMap(fileUser => {
        console.log("getSubscriptionTier", getSubscriptionTier)
        this.redisKey = `guest-upload-count:${fileUser.firebaseUid}`;
        const tier: SubscriptionTier = getSubscriptionTier(fileUser.isPaid);

        const count$: Observable<number> = isGuest ?
          from(this.redis.get(this.redisKey).then(val => parseInt(val || '0', 10))) :
          from(this.usersService.getTodayUploadCount(fileUser.firebaseUid));

        return count$.pipe(
          tap(count => {
            console.log("count$", count)
          }),
          switchMap(count => {
            if (count >= USER_DAILY_LIMITS[tier]) {
              throw new ForbiddenException(
                `Достигнут лимит операций в день для ${tier} пользователя (${USER_DAILY_LIMITS[tier]})`
              );
            }

            const sizeMB = file.size / (1024 * 1024);
            if (sizeMB > USER_FILE_SIZE_LIMITS_MB[tier][ext]) {
              throw new BadRequestException(
                `Превышен допустимый размер файла для ${tier} пользователя (${USER_FILE_SIZE_LIMITS_MB[tier][ext]} MB)`
              );
            }

            return from(fileTypeFromBuffer(file.buffer)).pipe(
              map(detected => {
                if (!detected || !isAllowedMimeType(detected.mime)) {
                  throw new BadRequestException(
                    `Превышен допустимый размер файла для ${getSubscriptionTier(fileUser.isPaid)} пользователя (${getUserFileSizeLimit(fileUser.isPaid, ext)} MB)`
                  );
                }
                return fileUser;
              })
            );
          })
        );
      }),
      switchMap(fileUser => {
        const fileName = `${fileUser.firebaseUid}/${Date.now()}_${file.originalname}`;
        const fileUpload = this.bucket.file(fileName);

        return from(
          fileUpload.save(file.buffer, {
            metadata: {contentType: file.mimetype},
            resumable: false,
          })
        ).pipe(
          switchMap(() =>
            from(
              from(
                fileUpload.getSignedUrl({
                  action: 'read',
                  expires: Date.now() + getFileExpiration(fileUser.isPaid), // ← здесь применяем новое правило
                })
              )
            )
          ),
          switchMap(([url]) => {
            // Записываем количество загрузок
            if (!isGuest) {
              return from(this.usersService.recordUpload(fileUser.firebaseUid)).pipe(
                map(() => ({
                  fileName,
                  url,
                  sizeMB: file.size / (1024 * 1024),
                  mimeType: file.mimetype,
                  subscriptionTier: getSubscriptionTier(fileUser.isPaid),
                }))
              );
            } else {
              // Увеличиваем счетчик в Redis с TTL 24 часа
              return from(
                this.redis
                  .multi()
                  .incr(this.redisKey)
                  .expire(this.redisKey, 60 * 60 * 24)
                  .exec(),
              ).pipe(
                map(() => ({
                  fileName,
                  url,
                  sizeMB: file.size / (1024 * 1024),
                  mimeType: file.mimetype,
                  subscriptionTier: getSubscriptionTier(fileUser.isPaid),
                })),
              );
            }
          }),
          catchError(err => {
            console.error(err);
            throw new InternalServerErrorException('Ошибка загрузки файла');
          })
        );
      })
    );
  }
}
