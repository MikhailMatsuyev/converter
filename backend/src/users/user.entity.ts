import { IUser } from "@shared/interfaces/user.interface";


export class UserEntity implements IUser {
  id: string;
  uid: string;           // Firebase UID
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
  updatedAt: Date;
  storageQuota: number;
  usedStorage: number;

  constructor(data: Partial<IUser>) {
    const now = new Date();
    this.id = data.id ?? (Date.now() + Math.random()).toString(); // временный уникальный id
    this.uid = data.uid!;
    this.email = data.email ?? '';
    this.displayName = data.displayName ?? null;
    this.photoURL = data.photoURL ?? null;
    this.createdAt = data.createdAt ?? now;
    this.updatedAt = data.updatedAt ?? now;
    this.storageQuota = data.storageQuota ?? 1024 * 1024 * 1024; // 1GB по умолчанию
    this.usedStorage = data.usedStorage ?? 0;
  }
}
