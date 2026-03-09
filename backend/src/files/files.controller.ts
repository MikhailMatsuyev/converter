import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Req,
  BadRequestException,
  UnauthorizedException
} from '@nestjs/common';
import { FilesService } from './files.service';
import { ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { FilesUploadInterceptor } from "./files.interceptor";
import { UploadFilesDto } from "../auth/dto/upload-files.dto";
import { forkJoin } from "rxjs";
import { map } from "rxjs/operators";
import { UserType } from "@shared/enums";
import { FileUser, RequestUser } from "@shared/types/request-user.type";
import { v4 as uuidv4 } from 'uuid';
import { toFileUser } from "@shared/utils";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { Public } from "../security/public.decorator";

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    @InjectQueue('file-processing') private readonly fileQueue: Queue // Внедряем очередь
  ) {}

  @Public()
  @Post('upload-multiple')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFilesDto })
  @UseInterceptors(FilesUploadInterceptor('files', 10))
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request
  ) {
    if (!files?.length) {
      throw new BadRequestException('Необходимо прикрепить хотя бы один файл');
    }

    const authUser = (req as any).user;
    const user: RequestUser = this.mapRequestUser(authUser, req);
    const fileUser: FileUser = toFileUser(user);

    // 1. Быстро сохраняем файлы в облако/диск и создаем записи в БД (status: PENDING)
    const uploadResults = await Promise.all(
      files.map(file => this.filesService.saveToDatabaseAndStorage(file, fileUser))
    );

    // 2. Добавляем задачи в очередь BullMQ для фоновой обработки
    await Promise.all(
      uploadResults.map(res =>
        this.fileQueue.add('process-ai', {
          fileId: res.id,
          userId: fileUser.id,
          mimetype: res.mimetype
        }, {
          attempts: 3, // если упадет, повторить 3 раза
          backoff: 5000 // пауза между попытками
        })
      )
    );

    // 3. Мгновенно возвращаем ID файлов. Фронтенд начнет их "слушать" по WebSocket
    return {
      message: 'Файлы приняты и добавлены в очередь на обработку',
      files: uploadResults.map(r => ({ id: r.id, status: 'PENDING' }))
    };
  }

  private mapRequestUser(authUser: any, req: Request): RequestUser {
    return authUser
      ? {
        isAuthenticated: true,
        firebaseUid: authUser.firebaseUid,
        type: authUser.type ?? UserType.USER,
        isPaid: authUser.isPaid ?? false,
      }
      : {
        isAuthenticated: false,
        type: UserType.GUEST,
        isPaid: false,
        guestId: req.headers["x-guest-id"] as string || uuidv4(),
      };
  }
}

// @ApiTags('files')
// @Controller('files')
// export class FilesController {
//   constructor(private readonly filesService: FilesService) {}
//
//   @Post('upload-multiple')
//   @ApiConsumes('multipart/form-data')
//   @ApiBody({
//     description: 'Загрузка нескольких файлов',
//     type: UploadFilesDto,
//   })
//   @UseInterceptors(FilesUploadInterceptor('files', 10))
//   uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[], @Req() req: Request) {
//     console.log('---(req as any).user---', (req as any).user);
//     console.log("=====", files);
//
//     const authUser = (req as any).user;
//
//     const user: RequestUser = authUser
//       ? {
//         isAuthenticated: true,
//         firebaseUid : authUser.firebaseUid ,
//         type: authUser.type ?? UserType.USER,
//         isPaid: authUser.isPaid ?? false,
//       }
//       : {
//         isAuthenticated: false,
//         type: UserType.GUEST,
//         isPaid: false,
//         guestId: req.headers["x-guest-id"] as string || uuidv4(),
//       };
//
//     console.log('---FILES---', files);
//     // console.log('---REQ BODY---', req.body);
//     // console.log('---UID---', (req as any).user?.uid || 'guest');
//     if (!files || files.length === 0) {
//       throw new BadRequestException('Error: Необходимо прикрепить хотя бы один файл');
//     }
//
//     console.log('---user---', user);
//     // Обрабатываем каждый файл через сервис
//     // const fileUser: FileUser = toFileUser(user); // requestUser типа RequestUser
//
//     const fileUser: FileUser = toFileUser(user);
//     return forkJoin(
//       files.map(file => this.filesService.uploadFile(file, fileUser))
//     ).pipe(
//       map(results => results)
//     );
//   }

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
