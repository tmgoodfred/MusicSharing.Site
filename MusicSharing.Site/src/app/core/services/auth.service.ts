import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://192.168.1.217:5000/api';
  private tokenKey = 'auth_token';
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUser();
  }

  login(usernameOrEmail: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/user/login`, { usernameOrEmail, password })
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.loadUser();
        })
      );
  }

  register(username: string, email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/user`, {
      username,
      email,
      passwordHash: password,
      role: 0 // User role
    });
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private loadUser(): void {
    const token = this.getToken();
    if (token) {
      // Simplified token parsing without library
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.http.get<User>(`${this.apiUrl}/user/${payload.nameid}`).subscribe(
          user => this.currentUserSubject.next(user),
          error => {
            console.error('Error loading user', error);
            this.logout();
          }
        );
      } catch (e) {
        console.error('Invalid token', e);
        this.logout();
      }
    }
  }
}
