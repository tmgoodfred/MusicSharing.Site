import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class FollowerService {
  private apiUrl = 'https://api.music-sharing.online/api/follower';

  constructor(private http: HttpClient) { }

  private unwrapArray<T>(value: any): T[] {
    if (!value) return [];
    if (Array.isArray(value)) return value as T[];
    if (value.$values) return value.$values as T[];
    return value as T[];
  }

  private normalizeUser(raw: any): User {
    return {
      id: raw.Id ?? raw.id,
      username: raw.Username ?? raw.username,
      email: raw.Email ?? raw.email,
      // Optional fields may be missing from this DTO
      role: raw.Role ?? raw.role,
      createdAt: raw.CreatedAt ?? raw.createdAt,
      profilePicturePath: raw.ProfilePicturePath ?? raw.profilePicturePath
    } as User;
  }

  follow(followerId: number, followedId: number): Observable<any> {
    const params = new HttpParams()
      .set('followerId', followerId.toString())
      .set('followedId', followedId.toString());
    return this.http.post(`${this.apiUrl}/follow`, null, { params });
  }

  unfollow(followerId: number, followedId: number): Observable<any> {
    const params = new HttpParams()
      .set('followerId', followerId.toString())
      .set('followedId', followedId.toString());
    return this.http.post(`${this.apiUrl}/unfollow`, null, { params });
  }

  getFollowers(userId: number): Observable<User[]> {
    return this.http.get<any>(`${this.apiUrl}/${userId}/followers`).pipe(
      map(res => this.unwrapArray<any>(res).map(u => this.normalizeUser(u)))
    );
  }

  getFollowing(userId: number): Observable<User[]> {
    return this.http.get<any>(`${this.apiUrl}/${userId}/following`).pipe(
      map(res => this.unwrapArray<any>(res).map(u => this.normalizeUser(u)))
    );
  }

  isFollowing(followerId: number, followedId: number): Observable<boolean> {
    const params = new HttpParams()
      .set('followerId', followerId.toString())
      .set('followedId', followedId.toString());
    return this.http.get<boolean>(`${this.apiUrl}/isFollowing`, { params });
  }
}
