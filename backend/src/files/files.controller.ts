import { Controller, Post, UploadedFiles, UseInterceptors, Req, BadRequestException } from '@nestjs/common';
import { FilesService } from './files.service';
// import { FilesInterceptor } from '@nestjs/platform-express';
// import { Request } from 'express';
import { ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';
// import { MAX_FILES_PER_REQUEST } from "@ai-file-processor/shared/constants";
import type { Request } from 'express';
import { FilesUploadInterceptor } from "./files.interceptor";
import { UploadFilesDto } from "../auth/dto/upload-files.dto";
import { forkJoin } from "rxjs";
import { map } from "rxjs/operators";
import { UserType } from "@shared/enums";

/*-class UploadFilesDto {
  files: any[];
}*/

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
  @UseInterceptors(FilesUploadInterceptor('files', 10))
  uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[], @Req() req: Request) {
    console.log('---(req as any).user---', (req as any).user);
    const user = (req as any).user
      ? { uid: (req as any).user.uid, type: (req as any).user.type as UserType || UserType.FREE}
      : { uid: 'guest', type: UserType.FREE }; // для гостей можно задать Free или отдельный тип

    // console.log('---FILES---', files);
    // console.log('---REQ BODY---', req.body);
    // console.log('---UID---', (req as any).user?.uid || 'guest');
    if (!files || files.length === 0) {
      throw new BadRequestException('Error: Необходимо прикрепить хотя бы один файл');
    }

    console.log('---user---', user);
    // Обрабатываем каждый файл через сервис
    return forkJoin(
      files.map(file => this.filesService.uploadFile(file, user))
    ).pipe(
      map(results => {
        return results;
      })
    );
  }

  // @Post('test-simple')
  // @UseInterceptors(FilesUploadInterceptor) // Без дополнительных настроек
  // testSimple(@UploadedFiles() files: Express.Multer.File[]) {
  //   console.log('=== TEST SIMPLE ===');
  //   console.log('Files received:', files);
  //
  //   if (!files || files.length === 0) {
  //     throw new BadRequestException('Необходимо прикрепить хотя бы один файл');
  //   }
  //
  //   return {
  //     success: true,
  //     count: files.length,
  //     filenames: files.map(f => f.originalname)
  //   };
  // }


}
