import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { firebaseAuth } from './firebase/firebase.config';
import { AsyncPipe, JsonPipe } from '@angular/common';
import firebase from 'firebase/compat/app';
import { AuthFacade } from './auth/auth.facade';
import { HttpClient } from '@angular/common/http';
import { LoginComponent } from './auth/login/login.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AsyncPipe, JsonPipe, LoginComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
  protected readonly firebaseAuth = firebaseAuth;
  protected readonly firebase = firebase;

  constructor(protected auth: AuthFacade, private http: HttpClient) {
    //this.auth.register('test@test.com', 'password123').subscribe();
    this.login();
    this.auth.user$.subscribe(
      user => console.log("====auth", user))
  }

  login() {
    this.auth.login('test@example.com', 'password123').subscribe();
  }

  req(): void {
    this.http.get(`${environment.apiUrl}/auth/me`).subscribe({
      next: (res) => console.log('ME:', res),
      error: (err) => console.error('ERROR:', err),
    });
  }

  signup(): void{
    this.auth.register('test@example.com', 'password123').subscribe();
  }


  }
