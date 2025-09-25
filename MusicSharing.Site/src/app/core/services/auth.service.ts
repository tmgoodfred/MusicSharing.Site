import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../models/models';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://api.music-sharing.online/api/user';
  private userUrl = 'https://api.music-sharing.online/api/user';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private jwtHelper = new JwtHelperService();

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenStorage: TokenStorageService
  ) {
    this.initAuthState();
  }

  private initAuthState(): void {
    const token = this.tokenStorage.getToken();
    if (token) {
      this.loadUser();
    }
  }

  login(usernameOrEmail: string, password: string): Observable<any> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { usernameOrEmail, password })
      .pipe(
        tap(response => {
          this.tokenStorage.saveToken(response.token);
          this.loadUser();
        })
      );
  }

  // UPDATED: register with multipart/form-data (supports profile picture)
  register(username: string, email: string, password: string, profilePicture?: File | null): Observable<any> {
    const form = new FormData();
    form.append('username', username);
    form.append('email', email);
    // Backend expects "passwordHash" (it hashes server-side)
    form.append('passwordHash', password);
    // Role required by endpoint; default to "User"
    form.append('role', 'User');
    if (profilePicture) {
      form.append('profilePicture', profilePicture);
    }
    return this.http.post(`${this.apiUrl}`, form);
  }

  logout(): void {
    this.tokenStorage.clear();
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    return !!this.tokenStorage.getToken();
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  private loadUser(): void {
    const token = this.tokenStorage.getToken();

    if (!token) {
      this.logout();
      return;
    }

    try {
      const decodedToken = this.jwtHelper.decodeToken(token);
      const userId = decodedToken.sub || decodedToken.nameid || decodedToken.userId;

      if (!userId) {
        console.error('Could not extract user ID from token');
        this.logout();
        return;
      }

      this.tokenStorage.saveUserId(userId.toString());

      this.http.get<User>(`${this.userUrl}/${userId}`).pipe(
        tap(user => {
          this.currentUserSubject.next(user);
        }),
        catchError(error => {
          console.error('Error loading user', error);
          this.logout();
          return throwError(() => error);
        })
      ).subscribe();
    } catch (error) {
      console.error('Error decoding token', error);
      this.logout();
    }
  }

  getToken(): string | null {
    return this.tokenStorage.getToken();
  }

  updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }
}
