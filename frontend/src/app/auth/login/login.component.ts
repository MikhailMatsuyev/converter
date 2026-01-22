// frontend/src/app/auth/login/login.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { tap } from 'rxjs/operators';
import { take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    @if (!auth.user()) {
      <button (click)="login()">Login with Google</button>
    } @else {
      loggedIn
    }

    <ng-template #loggedIn>
      <div class="user-info">
        @if (auth.user()?.photoURL) {
            <img [src]="auth.user()?.photoURL" alt="avatar" width="40" height="40">
        }
        <span>{{ auth.user()?.displayName || auth.user()?.email }}</span>
        <button (click)="logout()">Logout</button>
      </div>
    </ng-template>
  `,
  styles: [`
    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    button {
      cursor: pointer;
    }
  `]
})
export class LoginComponent {
  constructor(public auth: AuthService) {}

  login() {
    this.auth.loginWithGoogle()
      .pipe(
        take(1),
        tap(user => console.log('Logged in user:', user))
      )
      .subscribe();
  }

  logout() {
    this.auth.logout()
      .pipe(
        take(1),
        tap(() => console.log('User logged out'))
      )
      .subscribe();
  }
}
