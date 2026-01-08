import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable, of, interval } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { Public } from "../security/public.decorator";

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({
    summary: 'Проверка здоровья сервиса',
    description: 'Реактивная проверка статуса сервиса с метриками'
  })
  @ApiResponse({
    status: 200,
    description: 'Сервис работает',
    schema: {
      example: {
        status: 'healthy',
        timestamp: '2025-12-29T15:00:00.000Z',
        uptime: 123.456,
        memory: {
          rss: '256.43 MB',
          heapTotal: '145.67 MB',
          heapUsed: '89.12 MB',
          external: '45.23 MB'
        },
        database: 'connected',
        redis: 'connected'
      }
    }
  })
  checkHealth(): Observable<any> {
    return interval(100).pipe(
        take(1),
        map(() => {
          const memoryUsage = process.memoryUsage();

          return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: {
              rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
              heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
              heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
              external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
              arrayBuffers: `${(memoryUsage.arrayBuffers / 1024 / 1024).toFixed(2)} MB`
            },
            environment: process.env.NODE_ENV || 'development',
            nodeVersion: process.version,
            platform: process.platform,
            database: 'connected', // В реальном приложении проверяйте подключение к БД
            redis: 'connected',    // В реальном приложении проверяйте Redis
            _links: {
              self: { href: '/health', method: 'GET' },
              api: { href: '/api', method: 'GET' },
              metrics: { href: '/metrics', method: 'GET' }
            }
          };
        })
    );
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Метрики системы в реальном времени' })
  getMetrics(): Observable<any> {
    // Пример реактивных метрик
    return interval(1000).pipe(
        take(5), // Эмулируем поток метрик
        map((count) => ({
          timestamp: new Date().toISOString(),
          cpu: {
            usage: `${Math.random() * 100}%`,
            loadavg: process.cpuUsage()
          },
          requests: {
            total: 1000 + count * 50,
            perSecond: 50 + Math.random() * 20
          },
          memory: {
            used: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
            free: `${(process.memoryUsage().heapTotal - process.memoryUsage().heapUsed) / 1024 / 1024} MB`
          },
          activeConnections: Math.floor(Math.random() * 100) + 10
        }))
    );
  }
}
