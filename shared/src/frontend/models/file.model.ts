import { IFile } from "../../interfaces/file.interface";

export class FileModel implements IFile {
  id: string = "";
  fileName: string = "";
  originalName: string = "";
  fileSize: number = 0;
  mimeType: string = "";
  storagePath: string = "";
  url?: string;
  createdAt: Date = new Date();
  updatedAt?: Date;
  userId: string = "";

  // UI-specific properties
  progress: number = 0;
  status: "idle" | "uploading" | "processing" | "completed" | "error" = "idle";
  errorMessage?: string;
  isSelected: boolean = false;

  constructor(data?: Partial<FileModel>) {
    if (data) {
      Object.assign(this, data);
      // Ensure dates are Date objects
      if (data.createdAt && typeof data.createdAt === "string") {
        this.createdAt = new Date(data.createdAt);
      }
      if (data.updatedAt && typeof data.updatedAt === "string") {
        this.updatedAt = new Date(data.updatedAt);
      }
    }
  }

  get formattedSize(): string {
    if (this.fileSize < 1024) return `${this.fileSize} B`;
    if (this.fileSize < 1024 * 1024) return `${(this.fileSize / 1024).toFixed(1)} KB`;
    return `${(this.fileSize / (1024 * 1024)).toFixed(1)} MB`;
  }

  get isImage(): boolean {
    return this.mimeType.startsWith("image/");
  }

  get isPDF(): boolean {
    return this.mimeType === "application/pdf";
  }
}
