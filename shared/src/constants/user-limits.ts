// shared/src/constants/user-limits.ts
import { UserType } from '../enums';

export const USER_DAILY_LIMITS: Record<UserType, number> = {
  [UserType.FREE]: 5,   // операций в день
  [UserType.PAID]: 50,  // операций в день
};

export const USER_FILE_SIZE_LIMITS_MB: Record<UserType, Record<string, number>> = {
  [UserType.FREE]: {
    pdf: 10,
    jpg: 5,
    jpeg: 5,
    png: 5,
    heic: 5,
  },
  [UserType.PAID]: {
    pdf: 100,
    jpg: 50,
    jpeg: 50,
    png: 50,
    heic: 50,
  },
};

export const ALLOWED_FILE_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'heic'];
export const MAX_FILE_SIZE_MB = 100;
export const MAX_FILES_PER_REQUEST = 10;
