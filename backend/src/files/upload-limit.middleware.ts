import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { from, switchMap, map, tap, of, throwError } from 'rxjs';
import { USER_DAILY_LIMITS, getSubscriptionTier, getFileExpiration } from '@shared/constants';
import { RedisService } from "../redis/redis.service";
import { AuthenticatedRequest } from "../types/auth-request.type";

@Injectable()
export class UploadLimitMiddleware implements NestMiddleware {
  constructor(private readonly redisService: RedisService) {}

  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const user = req.user;
    const isGuest = !user?.firebaseUid;
    const userId = isGuest ? `guest:${req.ip}` : user.firebaseUid;
    const tier = getSubscriptionTier(!isGuest && user?.isPaid);
    const redisKey = `uploads:${userId}:${new Date().toISOString().slice(0, 10)}`;

    // 1. Сразу инкрементим (атомарно)
    from(this.redisService.incr(redisKey)).pipe(
      switchMap((count: number) => {
        // 2. Проверяем лимит
        if (count > USER_DAILY_LIMITS[tier]) {
          return throwError(() => new ForbiddenException(
            `Достигнут лимит операций (${USER_DAILY_LIMITS[tier]}) для ${tier} пользователя`
          ));
        }

        // 3. Если это первый инкремент, ставим TTL
        if (count === 1) {
          const ttlSeconds = Math.floor(getFileExpiration(!!user?.isPaid) / 1000);
          // Используем map(() => count), чтобы прокинуть count дальше, если нужно
          return from(this.redisService.expire(redisKey, ttlSeconds)).pipe(map(() => count));
        }

        return of(count);
      })
    ).subscribe({
      next: () => next(),
      error: (err) => next(err),
    });
  }
}
