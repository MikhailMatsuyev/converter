// prisma.module.ts
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // глобальный модуль, чтобы не импортировать в каждом модуле
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // экспортируем, чтобы другие модули могли использовать
})
export class PrismaModule {}
