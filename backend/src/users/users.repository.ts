import { Injectable } from '@nestjs/common';
import { IUser } from "@shared/interfaces/user.interface";


@Injectable()
export class UsersRepository {
  private users: IUser[] = [];

  findByFirebaseUid(uid: string): IUser | undefined {
    return this.users.find(u => u.uid === uid);
  }

  findById(id: string): IUser | undefined {
    return this.users.find(u => u.id === id);
  }

  findAll(): IUser[] {
    return this.users;
  }

  create(user: Partial<IUser>): IUser {
    const now = new Date();
    const newUser: IUser = {
      id: (Date.now() + Math.random()).toString(), // временный уникальный id
      uid: user.uid!,
      email: user.email ?? '',
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      createdAt: now,
      updatedAt: now,
      storageQuota: user.storageQuota ?? 1024 * 1024 * 1024, // 1GB по умолчанию
      usedStorage: user.usedStorage ?? 0,
    };
    this.users.push(newUser);
    return newUser;
  }

  update(id: string, data: Partial<IUser>): IUser | undefined {
    const user = this.findById(id);
    if (!user) return undefined;
    Object.assign(user, data, { updatedAt: new Date() });
    return user;
  }

  delete(id: string): boolean {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }
}

