import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from "backend/dist/auth/auth.service";
import { LoginDto } from "backend/dist/auth/dto/login.dto";
import { IAuthResponse } from "@ai-file-processor/shared";
import { VerifyTokenDto } from "../backend/src/auth/dto/verify-token.dto";


@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with Firebase token' })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful',
    type: Object // Укажите конкретный DTO если нужно
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid token'
  })
  login(@Body() loginDto: LoginDto): Observable<IAuthResponse> {
    return from(this.authService.login$(loginDto.idToken)).pipe(
      catchError(error => {
        // Преобразуем ошибку в HttpException
        return throwError(() =>
          new HttpException(
            error.message || 'Authentication failed',
            HttpStatus.UNAUTHORIZED
          )
        );
      })
    );
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify Firebase token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Token is invalid' })
  verifyToken(
    @Body() dto: VerifyTokenDto
  ): Observable<{ valid: boolean; firebaseUid?: string; email?: string }> {
    return from(this.authService.validateFirebaseToken$(dto.token)).pipe(
      map(decodedToken => ({
        valid: true,
        firebaseUid: decodedToken.uid, // или firebaseUid, если ты хочешь консистентно с БД
        email: decodedToken.email,
      })),
      catchError(() =>
        throwError(() => new HttpException('Invalid token', HttpStatus.UNAUTHORIZED))
      )
    );
  }

  @Post('me')
  @ApiOperation({ summary: 'Get current user info' })
  getUserInfo(@Body('token') token: string): Observable<any> {
    return from(this.authService.validateFirebaseToken$(token)).pipe(
      map(decodedToken => ({
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
        email_verified: decodedToken.email_verified
      })),
      catchError(error => {
        return throwError(() =>
          new HttpException(
            'Invalid token',
            HttpStatus.UNAUTHORIZED
          )
        );
      })
    );
  }
}
