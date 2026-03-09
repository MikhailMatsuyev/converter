import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { IUser } from '@shared/interfaces';
import { UserType } from "@shared/enums";
import { from, Observable, map, of } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Приватный маппер, чтобы не дублировать код преобразования
  private mapToIUser(user: any): IUser {
    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      storageQuota: user.storageQuota,
      usedStorage: user.usedStorage,
      isPaid: user.isPaid,
      paidUntil: user.paidUntil?.toISOString(),
      // Логика определения типа: если оплачено - USER (или PREMIUM), если нет - тоже USER, но с флагом isPaid: false
      type: user.isPaid ? UserType.USER : UserType.USER,
    };
  }

  // 2. Поиск пользователя (для Guard)
  findByFirebaseUid(firebaseUid: string): Observable<IUser | null> {
    return from(
      this.prisma.user.findUnique({ where: { firebaseUid } })
    ).pipe(
      map(user => user ? this.mapToIUser(user) : null)
    );
  }

  // 3. Создание пользователя (вместо usersRepository.create)
  createFromFirebase(data: {
    firebaseUid: string;
    email?: string;
    displayName?: string | null;
    photoURL?: string | null;
  }): Observable<IUser> {
    return from(
      this.prisma.user.create({
        data: {
          firebaseUid: data.firebaseUid,
          email: data.email ?? '',
          displayName: data.displayName,
          photoURL: data.photoURL,
        },
      })
    ).pipe(map(user => this.mapToIUser(user)));
  }

  // 4. Обновление (вместо usersRepository.update)
  updateUser(id: string, data: Partial<IUser>): Observable<IUser> {
    return from(
      this.prisma.user.update({
        where: { id },
        data: {
          email: data.email,
          displayName: data.displayName,
          isPaid: data.isPaid,
          // добавляй другие поля по мере необходимости
        }
      })
    ).pipe(map(user => this.mapToIUser(user)));
  }

  // 5. Лимиты: считаем файлы в БД (Вариант Б)
  getTodayUploadCount(userId: string): Observable<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return from(
      this.prisma.file.count({
        where: {
          userId: userId,
          createdAt: { gte: today }
        }
      })
    );
  }

  recordUpload(userId: string): Observable<void> {
    return of(undefined);
  }

  setPaid(userId: string, isPaid: boolean): Observable<IUser> {
    return from(
      this.prisma.user.update({
        where: { id: userId },
        data: {
          isPaid,
          // Можно добавить: paidUntil: isPaid ? someDate : null
        },
      })
    ).pipe(
      map(user => this.mapToIUser(user))
    );
  }
}



/*
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
  constructor(private readonly prisma: PrismaService) {}

  private mapToIUser(user: any): IUser {
    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      storageQuota: user.storageQuota,
      usedStorage: user.usedStorage,
      isPaid: user.isPaid,
      paidUntil: user.paidUntil?.toISOString(),
      // Определяем тип на лету для фронтенда
      type: user.isPaid ? UserType.USER : UserType.USER, // Здесь можно добавить логику для ADMIN
    };
  }

  // Поиск по Firebase UID (используется в Guard)
  findByFirebaseUid(firebaseUid: string): Observable<IUser | null> {
    return from(
      this.prisma.user.findUnique({ where: { firebaseUid } })
    ).pipe(
      map(user => user ? this.mapToIUser(user) : null)
    );
  }

  // Создание нового юзера
  createFromFirebase(data: Partial<IUser>): Observable<IUser> {
    return from(
      this.prisma.user.create({
        data: {
          firebaseUid: data.firebaseUid!,
          email: data.email || '',
          displayName: data.displayName,
          photoURL: data.photoURL,
          // storageQuota и usedStorage возьмутся из дефолтов Prisma
        },
      })
    ).pipe(map(user => this.mapToIUser(user)));
  }

  // Статистика для Dashboard (Шаг 4 плана)
  getUserStats(userId: string): Observable<{ used: number, total: number, filesCount: number }> {
    return from(
      this.prisma.user.findUnique({
        where: { id: userId },
        include: { _count: { select: { files: true } } }
      })
    ).pipe(
      map(user => ({
        used: user?.usedStorage || 0,
        total: user?.storageQuota || 0,
        filesCount: user?._count.files || 0
      }))
    );
  }

/!*@Injectable()
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
    firebaseUid: string;
    email?: string;
    displayName?: string | null;
    photoURL?: string | null;
  }): Observable<IUser> {
    return from(
      this.prisma.user.create({
        data: {
          firebaseUid: data.firebaseUid,
          email: data.email ?? '',
          displayName: data.displayName,
          photoURL: data.photoURL,
          // Схема Prisma сама подставит storageQuota и isPaid по дефолту
        },
      })
    ).pipe(
      map(user => this.mapToIUser(user)) // Вынесем маппинг в отдельный метод
    );
  }

  private mapToIUser(user: any): IUser {
    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      storageQuota: user.storageQuota,
      usedStorage: user.usedStorage,
      isPaid: user.isPaid,
      paidUntil: user.paidUntil?.toISOString(),
      // Определяем тип на лету для фронтенда
      type: user.isPaid ? UserType.USER : UserType.USER, // Здесь можно добавить логику для ADMIN
    };
  }*!/

  /!*!// Вспомогательный метод для чистоты кода
  private mapToIUser(user: any): IUser {
    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      type: user.isPaid ? UserType.PREMIUM : UserType.USER,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      storageQuota: user.storageQuota,
      usedStorage: user.usedStorage,
      isPaid: user.isPaid,
      paidUntil: user.paidUntil?.toISOString(),
    };
  }*!/

  /!*createFromFirebase(data: {
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
  }*!/

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

  /!** Получение количества операций за сегодня *!/
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

  /!** Сохраняем факт загрузки для лимитов *!/
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

*/
