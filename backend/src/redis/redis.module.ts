import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { GuestLimiterService } from './guest-limiter.service';

@Global()
@Module({
  providers: [RedisService, GuestLimiterService],
  exports: [RedisService, GuestLimiterService],
})
export class RedisModule {}
