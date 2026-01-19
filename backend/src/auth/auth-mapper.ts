// auth-mapper.ts
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { IAuthMe } from '@shared/interfaces';

export class AuthMapper {
  // Преобразуем DecodedIdToken в IAuthMe
  static toDomain(token: DecodedIdToken): IAuthMe {
    return {
      uid: token.uid,
      email: token.email ?? '',
    };
  }
}
