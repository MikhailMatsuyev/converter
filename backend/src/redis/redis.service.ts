import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { from, Observable } from "rxjs";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'redis-dev', // имя контейнера в Docker
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
    });

    this.client.on('error', (err) => {
      console.error('[ioredis] error:', err);
    });

    this.client.on('connect', () => {
      console.log('[ioredis] connected');
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.quit();
    }
  }

  getClient(): Redis {
    return this.client;
  }

  // Простейшие rxjs методы
  get(key: string): Observable<string | null> {
    return from(this.client.get(key));
  }

  set(key: string, value: string, ttlSeconds?: number): Observable<'OK'> {
    if (ttlSeconds) {
      return from(this.client.set(key, value, 'EX', ttlSeconds));
    }
    return from(this.client.set(key, value));
  }

  incr(key: string): Observable<number> {
    return from(this.client.incr(key));
  }

  expire(key: string, ttlSeconds: number): Observable<number> {
    return from(this.client.expire(key, ttlSeconds));
  }

  del(key: string): Observable<number> {
    return from(this.client.del(key));
  }

  multi(commands: Array<[string, ...any[]]>): Observable<any> {
    const multi = this.client.multi(commands);
    return from(multi.exec());
  }

  ttl(key: string): Observable<number> {
    return from(this.client.ttl(key));
  }
}
