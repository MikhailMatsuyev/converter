import { UserType } from '../enums';
import { FileExtensions } from './upload-limits';

export const USER_DAILY_LIMITS: Record<UserType, number> = {
  [UserType.FREE]: 5,
  [UserType.PAID]: 50,
};

// Используем enum FileExtensions вместо строк
export const USER_FILE_SIZE_LIMITS_MB: Record<UserType, Record<FileExtensions, number>> = {
  [UserType.FREE]: {
    [FileExtensions.PDF]: 10,
    [FileExtensions.JPG]: 5,
    [FileExtensions.JPEG]: 5,
    [FileExtensions.PNG]: 5,
    [FileExtensions.HEIC]: 5,
  },
  [UserType.PAID]: {
    [FileExtensions.PDF]: 100,
    [FileExtensions.JPG]: 50,
    [FileExtensions.JPEG]: 50,
    [FileExtensions.PNG]: 50,
    [FileExtensions.HEIC]: 50,
  },
};

// Вспомогательная функция для получения лимита
export function getUserFileSizeLimit(userType: UserType, extension: FileExtensions): number {
  return USER_FILE_SIZE_LIMITS_MB[userType][extension];
}

// Функция для валидации лимита
export function validateFileSizeLimit(
  userType: UserType,
  extension: FileExtensions,
  fileSizeMB: number
): boolean {
  const limit = getUserFileSizeLimit(userType, extension);
  return fileSizeMB <= limit;
}
