import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { IAuthResponse, IAuthUser } from '@shared/interfaces';
import { Observable, from, of, throwError, mergeMap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { getFirebaseAdmin } from '../firebase-admin/firebase-admin.config';

@Injectable()
export class AuthService {
  private get firebaseAuth() {
    return getFirebaseAdmin().auth();
  }

  constructor() {
    console.log('AuthService constructed');
  }

  // 🔹 Используется ТОЛЬКО после Guard
  getUserInfo$(decodedToken: admin.auth.DecodedIdToken): Observable<IAuthUser> {
    return of({
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      displayName: decodedToken.name || null,
      photoURL: decodedToken.picture || null,
      emailVerified: decodedToken.email_verified || false,
    });
  }

  // 🔹 Получение пользователя из Firebase по UID
  getUserByUid$(uid: string): Observable<IAuthUser> {
    return from(this.firebaseAuth.getUser(uid)).pipe(
      map(firebaseUser => ({
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || null,
        photoURL: firebaseUser.photoURL || null,
        emailVerified: firebaseUser.emailVerified || false,
      })),
      catchError(() =>
        throwError(() => new UnauthorizedException('User not found')),
      ),
    );
  }

  validateFirebaseToken$(idToken: string): Observable<admin.auth.DecodedIdToken> {
    return from(this.firebaseAuth.verifyIdToken(idToken)).pipe(
      catchError(() => {
        return throwError(() => new UnauthorizedException('Invalid Firebase token'));
      })
    );
  }

  // 🔹 login — если нужен (например, для first-login логики)
  // auth.service.ts
  login$(idToken: string): Observable<IAuthResponse> {
    return this.validateFirebaseToken$(idToken).pipe(
      mergeMap(decodedToken =>
        from(this.firebaseAuth.getUser(decodedToken.uid))
      ),
      map(firebaseUser => ({
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || null,
          photoURL: firebaseUser.photoURL || null,
          emailVerified: firebaseUser.emailVerified || false,
        },
        token: idToken,
        expiresIn: 3600,
      }))
    );
  }
}
