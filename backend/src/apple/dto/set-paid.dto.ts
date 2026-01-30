export class SetPaidDto {
  firebaseUid: string;
  isPaid: boolean;
  reason?: string; // опционально для логов
}
