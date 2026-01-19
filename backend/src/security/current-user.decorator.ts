import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from '../types/auth-request.type';
import { AuthMapper } from "../auth/auth-mapper";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: DecodedIdToken }>();
    if (!request.user) {
      return null;
    }

    // здесь преобразуем Firebase токен в доменную модель
    return AuthMapper.toDomain(request.user);
  },
);
