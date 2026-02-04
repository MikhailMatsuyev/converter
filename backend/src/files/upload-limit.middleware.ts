import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { from, switchMap } from 'rxjs';
import { USER_DAILY_LIMITS, getSubscriptionTier, getFileExpiration } from '@shared/constants';
import { IUser } from "@shared/interfaces";
import { RedisService } from "../redis/redis.service";

export interface AuthenticatedRequest extends Request {
  user: IUser;
}

@Injectable()
export class UploadLimitMiddleware implements NestMiddleware {
  constructor(private readonly redisService: RedisService) {}

  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    console.log("==UploadLimitMiddlewareUploadLimitMiddlewareUploadLimitMiddleware== req.user.isPaid", req)
    console.log("=============================");
    console.log("=============================");
    console.log("=============================");
    const user: IUser | undefined = req.user ?? false;
    const isGuest = !user?.firebaseUid;
    const userId = isGuest ? `guest-${req.ip}` : user.firebaseUid;
    const tier = getSubscriptionTier(!isGuest && user?.isPaid);
    const redisKey = `uploads:${userId}:${new Date().toISOString().slice(0, 10)}`;

    from(this.redisService.get(redisKey)).pipe(
      switchMap(countStr => {
        const count = parseInt(countStr ?? '0');
        if (count >= USER_DAILY_LIMITS[tier]) {
          throw new ForbiddenException(
            `Достигнут лимит операций в день для ${tier} пользователя (${USER_DAILY_LIMITS[tier]})`,
          );
        }
        // увеличиваем и выставляем TTL (1 час для гостей/бесплатных, 24ч для платных)
        const ttlSeconds = getFileExpiration(user.isPaid) / 1000; // переводим в секунды
        return from(this.redisService.incr(redisKey)).pipe(
          switchMap(() => this.redisService.expire(redisKey, ttlSeconds)),
        );
      })
    ).subscribe({
      next: () => next(),
      error: err => next(err)
    });
  }
}
