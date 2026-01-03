export interface IUser {
    id: string;           // Наш ID в БД
    uid: string;          // Firebase UID
    email: string;
    displayName: string | null;
    photoURL: string | null;
    createdAt: Date;
    updatedAt: Date;
    storageQuota: number;
    usedStorage: number;
}
