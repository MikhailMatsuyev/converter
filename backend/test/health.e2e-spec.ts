import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health → 200 and valid structure', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    const body = response.body;

    expect(body).toHaveProperty('status', 'healthy');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('uptime');
    expect(body).toHaveProperty('memory');
    expect(body).toHaveProperty('environment');
    expect(body).toHaveProperty('nodeVersion');
    expect(body).toHaveProperty('platform');

    expect(body.memory).toHaveProperty('rss');
    expect(body.memory).toHaveProperty('heapUsed');

    expect(body).toHaveProperty('database', 'connected');
    expect(body).toHaveProperty('redis', 'connected');

    expect(body).toHaveProperty('_links');
    expect(body._links.self.href).toBe('/health');
  });
});
