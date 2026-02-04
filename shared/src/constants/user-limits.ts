import { FileExtensions } from './upload-limits';

export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
}

// дневной лимит
export const USER_DAILY_LIMITS: Record<SubscriptionTier, number> = {
  [SubscriptionTier.FREE]: 5,
  [SubscriptionTier.PREMIUM]: 10,
};

// лимиты размера файлов
export const USER_FILE_SIZE_LIMITS_MB: Record<
  SubscriptionTier,
  Record<FileExtensions, number>
> = {
  [SubscriptionTier.FREE]: {
    [FileExtensions.PDF]: 10,
    [FileExtensions.JPG]: 1,
    [FileExtensions.JPEG]: 1,
    [FileExtensions.PNG]: 1,
    [FileExtensions.HEIC]: 1,
  },
  [SubscriptionTier.PREMIUM]: {
    [FileExtensions.PDF]: 20,
    [FileExtensions.JPG]: 2,
    [FileExtensions.JPEG]: 2,
    [FileExtensions.PNG]: 2,
    [FileExtensions.HEIC]: 2,
  },
};

// новые константы: срок хранения файлов (в миллисекундах)
export const USER_FILE_EXPIRATION_MS: Record<SubscriptionTier, number> = {
  [SubscriptionTier.FREE]: 1000 * 60 * 60,       // 1 час
  [SubscriptionTier.PREMIUM]: 1000 * 60 * 60 * 24, // 24 часа
};

export function getFileExpiration(isPaid: boolean): number {
  const tier: SubscriptionTier = getSubscriptionTier(isPaid);
  return USER_FILE_EXPIRATION_MS[tier];
}

export function getSubscriptionTier(isPaid: boolean): SubscriptionTier {
  return isPaid ? SubscriptionTier.PREMIUM : SubscriptionTier.FREE;
}

export function getUserFileSizeLimit(
  isPaid: boolean,
  extension: FileExtensions
): number {
  const tier = getSubscriptionTier(isPaid);
  return USER_FILE_SIZE_LIMITS_MB[tier][extension];
}

export function validateFileSizeLimit(
  isPaid: boolean,
  extension: FileExtensions,
  fileSizeMB: number
): boolean {
  return fileSizeMB <= getUserFileSizeLimit(isPaid, extension);
}
