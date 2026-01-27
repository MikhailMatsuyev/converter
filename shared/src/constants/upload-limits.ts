// ===== Extensions =====
export enum FileExtensions {
  PDF = 'pdf',
  JPG = 'jpg',
  JPEG = 'jpeg',
  PNG = 'png',
  HEIC = 'heic',
}

// ===== Extension → MIME mapping =====
export const EXTENSION_TO_MIME: Record<FileExtensions, readonly string[]> = {
  [FileExtensions.PDF]: ['application/pdf'],
  [FileExtensions.JPG]: ['image/jpeg'],
  [FileExtensions.JPEG]: ['image/jpeg'],
  [FileExtensions.PNG]: ['image/png'],
  [FileExtensions.HEIC]: ['image/heic', 'image/heif'],
} as const;

// ===== Upload limits =====
export const UPLOAD_LIMITS = {
  ALLOWED_FILE_EXTENSIONS: Object.values(FileExtensions) as FileExtensions[],
  MAX_FILE_SIZE_MB: 100,
  MAX_FILES_PER_REQUEST: 10,
} as const;

// ===== Safe getters (NO eager execution) =====
export function getAllowedMimeTypes(): string[] {
  return Object.values(EXTENSION_TO_MIME).flat();
}
/*
export function getAllowedExtensionTypes(): string[] {
  return Object.values(EXTENSION_TO_MIME).flat();
}*/

export function isAllowedExtension(ext?: string): boolean {
  return !!ext && UPLOAD_LIMITS.ALLOWED_FILE_EXTENSIONS.includes(ext as FileExtensions);
}

export function isAllowedMimeType(mime?: string): boolean {
  if (!mime) return false;
  return getAllowedMimeTypes().includes(mime);
}

// ===== Convenience exports =====
export const ALLOWED_FILE_EXTENSIONS = UPLOAD_LIMITS.ALLOWED_FILE_EXTENSIONS;
export const MAX_FILE_SIZE_MB = UPLOAD_LIMITS.MAX_FILE_SIZE_MB;
export const MAX_FILES_PER_REQUEST = UPLOAD_LIMITS.MAX_FILES_PER_REQUEST;




// export enum FileExtensions {
//   PDF = 'pdf',
//   JPG = 'jpg',
//   JPEG = 'jpeg',
//   PNG = 'png',
//   HEIC = 'heic',
// }
//
// // Добавьте маппинг расширения → MIME-типы
// export const EXTENSION_TO_MIME: Record<FileExtensions, string[]> = {
//   [FileExtensions.PDF]: ['application/pdf'],
//   [FileExtensions.JPG]: ['image/jpeg'],
//   [FileExtensions.JPEG]: ['image/jpeg'],
//   [FileExtensions.PNG]: ['image/png'],
//   [FileExtensions.HEIC]: ['image/heic', 'image/heif'],
// };
//
// export const UPLOAD_LIMITS = {
//   ALLOWED_FILE_EXTENSIONS: Object.values(FileExtensions),
//   MAX_FILE_SIZE_MB: 100,
//   MAX_FILES_PER_REQUEST: 10,
// } as const;
//
// export const ALLOWED_MIME_TYPES = Object.values(EXTENSION_TO_MIME).flat();
//
// // Экспортируем для удобства
// export const ALLOWED_FILE_EXTENSIONS = UPLOAD_LIMITS.ALLOWED_FILE_EXTENSIONS;
// export const MAX_FILE_SIZE_MB = UPLOAD_LIMITS.MAX_FILE_SIZE_MB;
// export const MAX_FILES_PER_REQUEST = UPLOAD_LIMITS.MAX_FILES_PER_REQUEST;
