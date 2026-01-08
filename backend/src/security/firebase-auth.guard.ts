import {
  CanActivate,
  ExecutionContext, Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { from, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from "rxjs/operators";
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('FIREBASE_AUTH') private readonly firebaseAuth: admin.auth.Auth,

  ) {}

  canActivate(context: ExecutionContext): Observable<boolean> {
    if (process.env.NODE_ENV === 'test') {
      return of(true);
    }
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      'isPublic',
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return of(true);
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return throwError(
        () => new UnauthorizedException('No Authorization header'),
      );
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      return throwError(
        () => new UnauthorizedException('Invalid Authorization header'),
      );
    }

    // ⬇️ пока без Firebase — просто пропускаем
    return from(this.firebaseAuth.verifyIdToken(token)).pipe(
      tap(decoded => {
        request.user = decoded;
      }),
      map(() => true),
      catchError(() =>
        throwError(() => new UnauthorizedException('Invalid Firebase token')),
      ),
    );
  }
}

// Injectable()
// export class FirebaseAuthGuard implements CanActivate {
//   constructor(private readonly reflector: Reflector) {}
//
//   canActivate(context: ExecutionContext): Observable<boolean> {
//     console.log('🔥 FirebaseAuthGuard called');
//     const isPublic = this.reflector.getAllAndOverride<boolean>(
//         IS_PUBLIC_KEY,
//         [context.getHandler(), context.getClass()],
//     );
//
//     if (isPublic) {
//         return of(true);
//     }
//     const request = context.switchToHttp().getRequest<AuthRequest>();
//     console.log('Headers:', request.headers);
//
//     const authHeader = request.headers['authorization'];
//
//     if (!authHeader) {
//       return throwError(
//           () => new UnauthorizedException('Authorization header missing'),
//       );
//     }
//
//     const [type, token] = authHeader.split(' ');
//
//     if (type !== 'Bearer' || !token) {
//       return throwError(
//           () => new UnauthorizedException('Invalid authorization format'),
//       );
//     }
//
//     return from(auth().verifyIdToken(token)).pipe(
//         map((decodedToken) => {
//           request.user = decodedToken;
//           return true;
//         }),
//         catchError(() =>
//             throwError(
//                 () => new ForbiddenException('Invalid or expired Firebase token'),
//             ),
//         ),
//     );
//   }
// }
