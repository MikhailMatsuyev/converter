export interface IFile {
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
}

export interface IFileUpload {
  originalName: string;
  buffer?: ArrayBuffer | Uint8Array;
  mimeType: string;
  size: number;
  userId: string;
}

export interface IFileProcessing {
  fileId: string;
  operation: "colorize" | "pdf_convert" | "compress";
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  resultUrl?: string;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}
