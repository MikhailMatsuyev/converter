import { Controller, Get, Post, Param } from '@nestjs/common';

@Controller('files')
export class FilesController {
  @Post('upload')
  upload() {
    throw new Error('Not implemented'); // заглушка
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    throw new Error('Not implemented'); // заглушка
  }

  @Post(':id/process')
  process(@Param('id') id: string) {
    throw new Error('Not implemented'); // заглушка
  }
}
