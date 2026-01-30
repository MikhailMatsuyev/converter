import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { UsersService } from "../../users/users.service";
import { AuthService } from "../auth.service";
import { IUser } from "@shared/interfaces/user.interface";

@Injectable()
export class FirebaseUserGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) {}

  canActivate(context: ExecutionContext): Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return throwError(() => new UnauthorizedException('No token'));
    }

    const idToken = authHeader.split(' ')[1];
    if (!idToken) {
      return throwError(() => new UnauthorizedException('Invalid token'));
    }

    // Используем существующий Observable метод validateFirebaseToken$
    return this.authService.validateFirebaseToken$(idToken).pipe(
      switchMap(decoded => {
        const domainUser: {
          firebaseUid : string;
          email?: string;
          displayName?: string | null;
          photoURL?: string | null;
        } = {
          firebaseUid : decoded.firebaseUid ,               // decoded.firebaseUid  всегда есть
          email: decoded.email ?? '',
          displayName: decoded.name ?? null,
          photoURL: decoded.picture ?? null,
        };

        // ищем пользователя в базе
        const existingUser = this.usersService.findByFirebaseUid(domainUser.firebaseUid );

        if (existingUser) {
          request.user = existingUser;
          return of(true);
        }

        // создаём нового пользователя
        const newUser = this.usersService.createFromFirebase(domainUser);
        request.user = newUser;
        return of(true);
      }),
      catchError(err => throwError(() => new UnauthorizedException('Invalid Firebase token')))
    );
  }
}
