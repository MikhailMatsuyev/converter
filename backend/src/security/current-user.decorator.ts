import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthMapper } from '../auth/auth-mapper';
import type { IAuthMe } from '@shared/interfaces';
import { Observable, of } from 'rxjs';

/**
 * Декоратор для получения текущего пользователя
 * Возвращает Observable<IAuthMe> для реактивного подхода
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Observable<IAuthMe | null> => {
    const request = ctx.switchToHttp().getRequest<{ user?: string }>();
    const idToken = request.user;

    if (!idToken) {
      return of(null);
    }

    // Преобразуем токен в Observable<IAuthMe>
    return AuthMapper.toDomain(idToken);
  },
);
