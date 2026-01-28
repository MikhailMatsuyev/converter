import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
// import { IUser, UserType } from '/sh../../interfaces/user.interface';
import { IUser } from '@shared/interfaces';
import { Observable, of } from 'rxjs';
import { UserType } from "@shared/enums";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {
  }

  findByFirebaseUid(uid: string): Observable<IUser | null> {
    const user = this.usersRepository.findByFirebaseUid(uid);
    return of(user ?? null);
  }

  createFromFirebase(data: {
    uid: string;        // Firebase UID
    email?: string;
    displayName?: string | null;
    photoURL?: string | null;
    type?: UserType;
  }): Observable<IUser> {
    const newUser = this.usersRepository.create({
      uid: data.uid,
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
  getTodayUploadCount(uid: string): Observable<number> {
    const user = this.usersRepository.findByFirebaseUid(uid);
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
  recordUpload(uid: string): Observable<void> {
    const user = this.usersRepository.findByFirebaseUid(uid);
    if (!user) return of(void 0);
    user.uploadHistory = user.uploadHistory ?? [];
    user.uploadHistory.push(new Date().toISOString());
    this.usersRepository.update(user.id, {uploadHistory: user.uploadHistory});
    return of(void 0);
  }
}

