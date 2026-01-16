import { Injectable } from '@angular/core';
import { Observable, from, of, switchMap } from 'rxjs';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getIdToken,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { firebaseAuth } from '../firebase/firebase.config';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  // 🔹 Reactive user$
  readonly user$ = new Observable<User | null>(subscriber => {
    return onAuthStateChanged(
      firebaseAuth,
      user => subscriber.next(user),
      error => subscriber.error(error),
    );
  });

  // 🔹 Reactive JWT
  readonly token$ = this.user$.pipe(
    switchMap(user =>
      user ? from(getIdToken(user, true)) : of(null),
    ),
  );

  login(email: string, password: string): Observable<void> {
    return from(
      signInWithEmailAndPassword(firebaseAuth, email, password),
    ).pipe(
      switchMap(() => of(void 0)),
    );
  }

  register(email: string, password: string): Observable<void> {
    return from(
      createUserWithEmailAndPassword(firebaseAuth, email, password),
    ).pipe(
      switchMap(() => of(void 0)),
    );
  }

  logout(): Observable<void> {
    return from(firebaseAuth.signOut());
  }
}
