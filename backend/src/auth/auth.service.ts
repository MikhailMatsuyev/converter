import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { IAuthResponse, IAuthUser } from '@shared/interfaces';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

@Injectable()
export class AuthService {
  private firebaseAuth: admin.auth.Auth;

  constructor() {
    this.firebaseAuth = admin.auth();
  }

  // Основной метод проверки токена (Observable)
  validateFirebaseToken$(idToken: string): Observable<admin.auth.DecodedIdToken> {
    return from(this.firebaseAuth.verifyIdToken(idToken)).pipe(
      catchError(error => {
        return throwError(() => new UnauthorizedException('Invalid Firebase token'));
      })
    );
  }

  // Метод логина (Observable)
  login$(idToken: string): Observable<IAuthResponse> {
    return this.validateFirebaseToken$(idToken).pipe(
      // Получаем пользователя по UID
      mergeMap(decodedToken => 
        from(this.firebaseAuth.getUser(decodedToken.uid)).pipe(
          catchError(error => {
            return throwError(() => new UnauthorizedException('User not found'));
          })
        )
      ),
      // Преобразуем в IAuthUser и IAuthResponse
      map(firebaseUser => {
        const authUser: IAuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || null,
          photoURL: firebaseUser.photoURL || null,
          emailVerified: firebaseUser.emailVerified || false,
        };

        const response: IAuthResponse = {
          user: authUser,
          token: idToken,
          expiresIn: 3600, // 1 час
        };

        return response;
      }),
      catchError(error => {
        // Пробрасываем оригинальную ошибку
        return throwError(() => error);
      })
    );
  }

  // Получение информации о пользователе (Observable)
  getUserInfo$(idToken: string): Observable<IAuthUser> {
    return this.validateFirebaseToken$(idToken).pipe(
      map(decodedToken => ({
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: decodedToken.name || null,
        photoURL: decodedToken.picture || null,
        emailVerified: decodedToken.email_verified || false,
      }))
    );
  }

  // Получение пользователя по UID (Observable)
  getUserByUid$(uid: string): Observable<IAuthUser> {
    return from(this.firebaseAuth.getUser(uid)).pipe(
      map(firebaseUser => ({
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || null,
        photoURL: firebaseUser.photoURL || null,
        emailVerified: firebaseUser.emailVerified || false,
      })),
      catchError(error => {
        return throwError(() => new UnauthorizedException('User not found'));
      })
    );
  }
}