import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { IUser } from '@shared/interfaces/user.interface';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findByFirebaseUid(uid: string): Observable<IUser | null> {
    const user = this.usersRepository.findByFirebaseUid(uid);
    return of(user ?? null);
  }

  createFromFirebase(data: {
    uid: string;        // Firebase UID
    email?: string;
    displayName?: string | null;
    photoURL?: string | null;
  }): Observable<IUser> {
    const newUser = this.usersRepository.create({
      uid: data.uid,
      email: data.email,
      displayName: data.displayName ?? null,
      photoURL: data.photoURL ?? null,
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
}

