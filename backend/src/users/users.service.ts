import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
// import { IUser, UserType } from '/sh../../interfaces/user.interface';
import { IUser } from '@shared/interfaces';
import { from, Observable, of } from 'rxjs';
import { UserType } from "@shared/enums";
import { map } from "rxjs/operators";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly prisma: PrismaService
  ) {
  }

  findByFirebaseUid(firebaseUid: string): Observable<IUser | null> {
    return from(
      this.prisma.user.findUnique({ where: { firebaseUid } })
    ).pipe(
      map(user => {
        if (!user) return null;
        return {
          id: user.id,
          firebaseUid: user.firebaseUid,
          email: user.email,
          displayName: user.displayName ?? null,
          photoURL: user.photoURL ?? null,
          type: UserType.USER, // пока дефолт
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          storageQuota: user.storageQuota,
          usedStorage: user.usedStorage,
          isPaid: user.isPaid,
          paidUntil: user.paidUntil ? user.paidUntil.toISOString() : undefined,
        } as IUser | null;
      })
    );
  }

  createFromFirebase(data: {
    firebaseUid : string;        // Firebase UID
    email?: string;
    displayName?: string | null;
    photoURL?: string | null;
    type?: UserType;
  }): Observable<IUser> {
    const newUser = this.usersRepository.create({
      firebaseUid : data.firebaseUid ,
      email: data.email,
      displayName: data.displayName ?? null,
      photoURL: data.photoURL ?? null,
      type: data.type ?? UserType.USER, // по умолчанию Free
    });
    return of(newUser);
  }

  getAllUsers(): Observable<IUser[]> {
    const users = this.usersRepository.findAll();
    return of(users);
  }

  updateUser(id: string, data: Partial<IUser>): Observable<IUser | null> {
    const updated = this.usersRepository.update(id, data);
    return of(updated ?? null);
  }

  deleteUser(id: string): Observable<boolean> {
    const deleted = this.usersRepository.delete(id);
    return of(deleted);
  }

  /** Получение количества операций за сегодня */
  getTodayUploadCount(firebaseUid : string): Observable<number> {
    const user = this.usersRepository.findByFirebaseUid(firebaseUid );
    if (!user) return of(0);
    // Пример: считаем по массиву uploadHistory с timestamp
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const countToday = (user.uploadHistory ?? []).filter(
      t => new Date(t).getTime() >= today.getTime()
    ).length;
    return of(countToday);
  }

  /** Сохраняем факт загрузки для лимитов */
  recordUpload(firebaseUid : string): Observable<void> {
    const user = this.usersRepository.findByFirebaseUid(firebaseUid );
    if (!user) return of(void 0);
    user.uploadHistory = user.uploadHistory ?? [];
    user.uploadHistory.push(new Date().toISOString());
    this.usersRepository.update(user.id, {uploadHistory: user.uploadHistory});
    return of(void 0);
  }

  setPaid(userId: string, isPaid: boolean): Observable<void> {
    return from(
      this.prisma.user.update({
        where: { id: userId },
        data: { isPaid },
      }),
    ).pipe(map(() => undefined)); // возвращаем void
  }


}

