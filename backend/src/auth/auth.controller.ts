import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UnauthorizedException,
  Get,
  HttpCode
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IAuthResponse, IAuthUser } from '@shared/interfaces';
import { Public } from "../security/public.decorator";

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login with Firebase token' })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful'
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid token'
  })
  login(@Body() loginDto: LoginDto): Observable<IAuthResponse> {
    return this.authService.login$(loginDto.idToken).pipe(
      catchError(error => {
        const status = error instanceof UnauthorizedException
          ? HttpStatus.UNAUTHORIZED
          : HttpStatus.INTERNAL_SERVER_ERROR;

        return throwError(() =>
          new HttpException(
            error.message || 'Authentication failed',
            status
          )
        );
      })
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user info from token' })
  @ApiResponse({
    status: 200,
    description: 'User information'
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid token'
  })
  getUserInfo(@Body('token') token: string): Observable<IAuthUser> {
    return this.authService.getUserInfo$(token).pipe(
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
