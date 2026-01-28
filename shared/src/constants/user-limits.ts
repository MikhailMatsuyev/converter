import { FileExtensions } from './upload-limits';

export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
}

// дневной лимит
export const USER_DAILY_LIMITS: Record<SubscriptionTier, number> = {
  [SubscriptionTier.FREE]: 5,
  [SubscriptionTier.PREMIUM]: 50,
};

// лимиты размера файлов
export const USER_FILE_SIZE_LIMITS_MB: Record<
  SubscriptionTier,
  Record<FileExtensions, number>
> = {
  [SubscriptionTier.FREE]: {
    [FileExtensions.PDF]: 10,
    [FileExtensions.JPG]: 5,
    [FileExtensions.JPEG]: 5,
    [FileExtensions.PNG]: 5,
    [FileExtensions.HEIC]: 5,
  },
  [SubscriptionTier.PREMIUM]: {
    [FileExtensions.PDF]: 100,
    [FileExtensions.JPG]: 50,
    [FileExtensions.JPEG]: 50,
    [FileExtensions.PNG]: 50,
    [FileExtensions.HEIC]: 50,
  },
};

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
