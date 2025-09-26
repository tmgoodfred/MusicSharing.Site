import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User, Activity, Song, Analytics } from '../models/models';
import { ImageService } from './image.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userApiUrl = 'https://music-sharing.online/api/user';
  private followerApiUrl = 'https://music-sharing.online/api/follower';
  private musicApiUrl = 'https://music-sharing.online/api/music';
  private activityApiUrl = 'https://music-sharing.online/api/activity';

  constructor(
    private http: HttpClient,
    private imageService: ImageService
  ) { }

  private unwrapArray<T>(value: any): T[] {
    if (!value) return [];
    if (Array.isArray(value)) return value as T[];
    if (value.$values) return value.$values as T[];
    return value as T[];
  }

  // Normalize nested song collections coming from ReferenceHandler.Preserve
  private normalizeSong(raw: any): Song {
    return {
      ...raw,
      tags: this.unwrapArray<string>(raw?.tags),
      ratings: this.unwrapArray<any>(raw?.ratings),
      comments: this.unwrapArray<any>(raw?.comments),
      categories: this.unwrapArray<any>(raw?.categories)
    } as Song;
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.userApiUrl}/${id}`);
  }

  updateUser(id: number, userData: any): Observable<User> {
    return this.http.put<User>(`${this.userApiUrl}/${id}`, userData);
  }

  updateUserFormData(id: number, form: FormData): Observable<User> {
    return this.http.put<User>(`${this.userApiUrl}/${id}`, form);
  }

  getUserSongs(userId: number): Observable<Song[]> {
    return this.http.get<any>(`${this.musicApiUrl}/user/${userId}/songs`).pipe(
      map(res => this.unwrapArray<any>(res).map(s => this.normalizeSong(s)))
    );
  }

  getUserActivity(userId: number, count: number = 20): Observable<Activity[]> {
    return this.http.get<any>(`${this.activityApiUrl}/user/${userId}?count=${count}`).pipe(
      map(res => this.unwrapArray<Activity>(res))
    );
  }

  getUserFollowers(userId: number): Observable<User[]> {
    return this.http.get<any>(`${this.followerApiUrl}/${userId}/followers`).pipe(
      map(res => this.unwrapArray<User>(res))
    );
  }

  getUserFollowing(userId: number): Observable<User[]> {
    return this.http.get<any>(`${this.followerApiUrl}/${userId}/following`).pipe(
      map(res => this.unwrapArray<User>(res))
    );
  }

  followUser(followedUserId: number): Observable<any> {
    const currentUserId = this.getCurrentUserId();
    return this.http.post(`${this.followerApiUrl}/follow`, null, {
      params: { followerId: currentUserId.toString(), followedId: followedUserId.toString() }
    });
  }

  unfollowUser(followedUserId: number): Observable<any> {
    const currentUserId = this.getCurrentUserId();
    return this.http.post(`${this.followerApiUrl}/unfollow`, null, {
      params: { followerId: currentUserId.toString(), followedId: followedUserId.toString() }
    });
  }

  isFollowing(followedUserId: number): Observable<boolean> {
    const currentUserId = this.getCurrentUserId();
    return this.http.get<boolean>(`${this.followerApiUrl}/isFollowing`, {
      params: { followerId: currentUserId.toString(), followedId: followedUserId.toString() }
    });
  }

  private getCurrentUserId(): number {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId) : 0;
  }

  getActivityFeed(userId: number, count: number = 20): Observable<Activity[]> {
    return this.http.get<any>(`${this.activityApiUrl}/feed/${userId}?count=${count}`).pipe(
      map(res => this.unwrapArray<Activity>(res))
    );
  }

  getProfilePictureUrl(userId: number): string {
    return this.imageService.getProfileImageUrl(userId);
  }

  // NEW: change password endpoint (JSON)
  updateUserPassword(id: number, newPassword: string): Observable<void> {
    return this.http.put<void>(`${this.userApiUrl}/${id}/password`, { newPassword });
  }

  getUserAnalytics(userId: number): Observable<Analytics> {
    return this.http.get<Analytics>(`${this.userApiUrl}/${userId}/analytics`);
  }

  // Add this new method to fetch all activities including anonymous ones
  getAllActivities(): Observable<Activity[]> {
    return this.http.get<any>(`${this.activityApiUrl}`).pipe(
      map(res => this.unwrapArray<Activity>(res))
    );
  }

  // ========= Email verification & password reset =========

  requestEmailVerification(usernameOrEmail: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.userApiUrl}/request-email-verification`, { usernameOrEmail });
  }

  verifyEmail(token: string): Observable<void> {
    return this.http.post<void>(`${this.userApiUrl}/verify-email`, { token });
  }

  forgotPassword(usernameOrEmail: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.userApiUrl}/forgot-password`, { usernameOrEmail });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.userApiUrl}/reset-password`, { token, newPassword });
  }
}
