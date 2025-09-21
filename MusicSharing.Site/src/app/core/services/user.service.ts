import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Activity, Song, Follower, UserUpdate } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://192.168.1.217:5000/api/user';

  constructor(private http: HttpClient) { }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: number, userData: UserUpdate): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData);
  }

  getUserSongs(userId: number): Observable<Song[]> {
    return this.http.get<Song[]>(`${this.apiUrl}/${userId}/songs`);
  }

  getUserActivity(userId: number): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.apiUrl}/${userId}/analytics`);
  }

  getUserFollowers(userId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${userId}/followers`);
  }

  getUserFollowing(userId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${userId}/following`);
  }

  followUser(followedUserId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/follow`, { followedUserId });
  }

  unfollowUser(followedUserId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/unfollow`, { followedUserId });
  }

  isFollowing(followedUserId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/isFollowing/${followedUserId}`);
  }
}
