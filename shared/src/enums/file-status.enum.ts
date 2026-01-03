export enum FileStatus {
  PENDING = "pending",
  UPLOADING = "uploading",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed"
}

export enum ProcessingOperation {
  COLORIZE = "colorize",
  PDF_CONVERT = "pdf_convert",
  COMPRESS = "compress"
}
