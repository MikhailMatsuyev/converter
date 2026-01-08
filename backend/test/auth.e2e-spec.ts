import { Test, TestingModule } from '@nestjs/testing';
import { CanActivate, ExecutionContext, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from "../src/auth/auth.service";
import { of } from "rxjs";
import { APP_GUARD } from '@nestjs/core';

process.env.NODE_ENV = 'test';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

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
});
