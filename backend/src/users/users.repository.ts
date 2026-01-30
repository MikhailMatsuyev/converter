import { Injectable } from '@nestjs/common';
import { IUser } from "@shared/interfaces/user.interface";
import { UserType } from "@shared/enums";


@Injectable()
export class UsersRepository {
  private users: IUser[] = [];

  findByFirebaseUid(firebaseUid : string): IUser | undefined {
    console.log("========firebaseUid=========", firebaseUid)
    console.log("========this.users=========", this.users)
    return this.users.find((u: IUser) => u.firebaseUid  === firebaseUid );
  }

  findById(id: string): IUser | undefined {
    return this.users.find((u: IUser) => u.id === id);
  }

  findAll(): IUser[] {
    return this.users;
  }

  create(user: Partial<IUser>): IUser {
    const now = new Date();
    const newUser: IUser = {
      id: (Date.now() + Math.random()).toString(), // временный уникальный id
      firebaseUid : user.firebaseUid !,
      email: user.email ?? '',
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      storageQuota: user.storageQuota ?? 1024 * 1024 * 1024, // 1GB по умолчанию
      type: user.type ?? UserType.USER,
      usedStorage: user.usedStorage ?? 0,
      isPaid: user.isPaid ?? false
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

