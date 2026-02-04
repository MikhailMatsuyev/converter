import { Injectable, ForbiddenException } from '@nestjs/common';
import { from, Observable, switchMap, map } from 'rxjs';
import { RedisService } from "./redis.service";

@Injectable()
export class GuestLimiterService {
  private readonly DAILY_LIMIT = 5;

  constructor(private readonly redisService: RedisService) {}
  /**
   * Проверяет лимит и инкрементит счётчик
   */
  checkAndIncrement$(guestId: string): Observable<number> {
    const today = new Date().toISOString().slice(0, 10);
    const key = `guest:uploads:${guestId}:${today}`;

    return from(this.redisService.ttl(key)).pipe(
      switchMap(ttl => {
        // если ключ новый — выставляем TTL до конца суток
        if (ttl === -1 || ttl === -2) {
          const secondsToEndOfDay = this.getSecondsToEndOfDay();
          return from(this.redisService.expire(key, secondsToEndOfDay));
        }
        return from(Promise.resolve());
      }),
      switchMap(() => from(this.redisService.incr(key))),
      map(count => {
        if (count > this.DAILY_LIMIT) {
          throw new ForbiddenException(
            `Достигнут лимит загрузок для гостя (${this.DAILY_LIMIT} в день)`
          );
        }
        return count;
      })
    );
  }

  /**
   * Получить текущее количество (без инкремента)
   */
  getCount$(guestId: string): Observable<number> {
    const today = new Date().toISOString().slice(0, 10);
    const key = `guest:uploads:${guestId}:${today}`;

    return from(this.redisService.get(key)).pipe(
      map(value => Number(value ?? 0))
    );
  }

  private getSecondsToEndOfDay(): number {
    const now = new Date();
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return Math.floor((end.getTime() - now.getTime()) / 1000);
  }
}
