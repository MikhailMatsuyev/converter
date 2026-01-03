export interface FileResponseDto {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  url?: string;
  createdAt: Date;
  updatedAt?: Date;
  userId: string;
  processingStatus: string;
  processingProgress: number;
}
