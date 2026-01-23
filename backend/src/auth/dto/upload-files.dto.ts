import type { Express } from 'express'; // <- исправлено

export class UploadFilesDto {
  files: Express.Multer.File[];
}
