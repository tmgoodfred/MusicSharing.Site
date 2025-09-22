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
  private apiUrl = 'http://192.168.1.217:5000/api/user';
  private userUrl = 'http://192.168.1.217:5000/api/user';
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

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}`, { username, email, password });
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

      // Save the userId in storage
      this.tokenStorage.saveUserId(userId.toString());

      // Fetch the full user profile
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
}
