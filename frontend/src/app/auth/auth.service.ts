import { Injectable, signal } from '@angular/core';
import { signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';
import { firebaseAuth } from '../firebase/firebase.config';
import { HttpClient } from '@angular/common/http';
import { from, map, switchMap, tap, Observable, of } from 'rxjs';
import { IUser } from '@interfaces/user.interface';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = signal<IUser | null>(null); // сигнал для реактивного UI

  constructor(private http: HttpClient) {}

  loginWithGoogle(): Observable<IUser> {
    const provider = new GoogleAuthProvider();

    return from(signInWithPopup(firebaseAuth, provider)).pipe(
      switchMap((result) => from(result.user.getIdToken())), // получаем Firebase idToken
      switchMap((token) =>
        this.http.post<IUser>(`${environment.apiUrl}/auth/login`, { idToken: token }) // отправляем на бэкенд
      ),
      tap((backendUser) => this.user.set(backendUser)) // обновляем сигнал
    );
  }

  logout(): Observable<void> {
    return from(signOut(firebaseAuth)).pipe(
      tap(() => this.user.set(null))
    );
  }

  fetchCurrentUser(): Observable<IUser | null> {
    return this.http.get<IUser>(`${environment.apiUrl}/auth/me`).pipe(
      tap((user) => this.user.set(user)),
      // если ошибка (не авторизован), сбрасываем сигнал
      map((user) => user),
      // Можно ловить ошибку и вернуть null
    );
  }
}
