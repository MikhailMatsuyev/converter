import { UserType } from "../enums";

export interface IUser {
  id: string;           // Наш ID в БД
  firebaseUid : string; // Firebase UID
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  updatedAt: string;
  storageQuota: number;
  usedStorage: number;
  type: UserType;             // Free / Paid
  uploadHistory?: string[];
  isPaid: boolean;
  paidUntil?: string;
}
// import { UserType } from "@shared/enums";
