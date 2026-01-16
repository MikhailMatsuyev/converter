import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IS_PUBLIC_KEY } from './public.decorator';
// import * as admin from 'firebase-admin';
import { getFirebaseAdmin } from "../firebase-admin/firebase-admin.config";

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return of(true);
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // 2. TEST / DEV BYPASS
    if (
      process.env.NODE_ENV === 'test' ||
      process.env.NODE_ENV === 'development'
    ) {
      request.user = {
        uid: 'test-user',
        email: 'test@test.com',
      };
      return of(true);
    }

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    const token = authHeader.slice(7).replace(/\s+/g, '');
    console.log('TOKEN LENGTH:', token.length);
    console.log('HAS NEWLINES:', /\s/.test(token));

    let admin;
    try {
      admin = getFirebaseAdmin();
    } catch (e) {
      console.error('🔥 Firebase admin init error:', e);
      throw new UnauthorizedException('Auth service unavailable');
    }

    console.log('AUTH HEADER:', request.headers.authorization);
    console.log('TOKEN TYPE:', typeof token, token);
    return from(admin.auth().verifyIdToken(token)).pipe(
      map((decodedToken) => {
        request.user = decodedToken;
        return true;
      }),
      catchError((err) => {
        console.error('🔥 verifyIdToken error:', err);
        throw new UnauthorizedException('Invalid Firebase token');
      }),
    );
  }
}

