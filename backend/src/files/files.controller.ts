import { Controller, Post, UploadedFiles, UseInterceptors, Req } from '@nestjs/common';
import { FilesService } from './files.service';
// import { FilesInterceptor } from '@nestjs/platform-express';
// import { Request } from 'express';
import { ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';
// import { MAX_FILES_PER_REQUEST } from "@ai-file-processor/shared/constants";
import type { Request } from 'express';
import { FilesUploadInterceptor } from "./files.interceptor";

class UploadFilesDto {
  files: any[];
}

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload-multiple')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Загрузка нескольких файлов',
    type: UploadFilesDto,
  })
  @UseInterceptors(FilesUploadInterceptor('file'))
  uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[], @Req() req: Request) {
    const uid = (req as any).user?.uid;

    // Обрабатываем каждый файл через сервис
    return files.map(file => this.filesService.uploadFile(file, uid));
  }
}
