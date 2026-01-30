import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import type { IAuthMe } from '@shared/interfaces';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class AuthMapper {
  /**
   * Преобразуем ID токен в IAuthMe в реактивном стиле
   * @param idToken Firebase ID токен
   */
  static toDomain(idToken: string): Observable<IAuthMe> {
    const auth = getAuth();

    return from(auth.verifyIdToken(idToken)).pipe(
      map((decoded: DecodedIdToken) => ({
        firebaseUid : decoded.firebaseUid ,
        email: decoded.email ?? '',
      }))
    );
  }
}
