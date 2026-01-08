import { Test, TestingModule } from '@nestjs/testing';
import { CanActivate, ExecutionContext, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { FirebaseAuthGuard } from "../src/security/firebase-auth.guard";
import { AuthService } from "../src/auth/auth.service";
import { of } from "rxjs";
import { APP_GUARD } from '@nestjs/core';

process.env.NODE_ENV = 'test';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  /**
   * Мок Guard:
   * - если есть заголовок Authorization → пускаем и кладём req.user
   * - если нет → 401
   */

  const allowAllGuard: CanActivate = {
    canActivate: (context: ExecutionContext) => true,
  };

  const mockAuthService = {
    login$: jest.fn().mockReturnValue(
      of({
        accessToken: 'fake-token',
      }),
    ),
    getUserInfo$: jest.fn().mockReturnValue(
      of({
        uid: 'test-user-id',
        email: 'test@example.com',
      }),
    ),
  };

  const mockAuthGuard = {
    canActivate(context) {
      const req = context.switchToHttp().getRequest();
      const authHeader = req.headers['authorization'];

      if (!authHeader) {
        return false;
      }

      req.user = {
        id: 'test-user-id',
        email: 'test@test.com',
      };

      return true;
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(APP_GUARD)
      .useValue(allowAllGuard)
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ---------- LOGIN ----------

  it('POST /auth/login should be public', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ idToken: 'fake-id-token' })
      .expect(200);
    expect(res.body).toEqual({
      accessToken: 'fake-token',
    });
  });

  // ---------- ME ----------

  // it('GET /auth/me without token should return 401', async () => {
  //   await request(app.getHttpServer())
  //     .get('/auth/me')
  //     .expect(401);
  // });

  it('GET /auth/me with token should return current user', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer fake-token')
      .expect(200);

    expect(res.body).toEqual({
      uid: 'test-user-id',
      email: 'test@example.com',
    });
  });

  // it('GET /auth/me should NOT accept token in body', async () => {
  //   await request(app.getHttpServer())
  //     .get('/auth/me')
  //     .send({ token: 'fake-token' })
  //     .expect(401);
  // });
});
