import { ApiProperty } from '@nestjs/swagger';

export class UploadFilesDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary'
    },
    description: 'Массив файлов для загрузки',
    required: true
  })
  files: any[]; // Измените тип на any[] для Swagger
}
