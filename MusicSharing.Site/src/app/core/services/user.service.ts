import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User, Activity, Song, Follower, UserUpdate } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userApiUrl = 'http://192.168.1.217:5000/api/user';
  private followerApiUrl = 'http://192.168.1.217:5000/api/follower';
  private musicApiUrl = 'http://192.168.1.217:5000/api/music';
  private activityApiUrl = 'http://192.168.1.217:5000/api/activity';

  constructor(private http: HttpClient) { }

  private unwrapArray<T>(value: any): T[] {
    if (!value) return [];
    if (Array.isArray(value)) return value as T[];
    if (value.$values) return value.$values as T[];
    return value as T[];
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.userApiUrl}/${id}`);
  }

  updateUser(id: number, userData: UserUpdate): Observable<User> {
    return this.http.put<User>(`${this.userApiUrl}/${id}`, userData);
  }

  updateUserFormData(id: number, form: FormData): Observable<User> {
    return this.http.put<User>(`${this.userApiUrl}/${id}`, form);
  }

  // NEW: change password endpoint (JSON)
  updateUserPassword(id: number, newPassword: string): Observable<void> {
    return this.http.put<void>(`${this.userApiUrl}/${id}/password`, { newPassword });
  }

  getUserSongs(userId: number): Observable<Song[]> {
    return this.http.get<any>(`${this.musicApiUrl}/user/${userId}/songs`).pipe(
      map(res => this.unwrapArray<Song>(res))
    );
  }

  getUserActivity(userId: number): Observable<Activity[]> {
    return this.http.get<any>(`${this.userApiUrl}/${userId}/analytics`).pipe(
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
    return `${this.userApiUrl}/${userId}/profile-picture`;
  }
}
