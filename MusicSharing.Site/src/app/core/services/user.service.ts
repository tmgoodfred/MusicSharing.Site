import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Activity, Song, Follower, UserUpdate } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userApiUrl = 'http://192.168.1.217:5000/api/user';
  private followerApiUrl = 'http://192.168.1.217:5000/api/follower';
  private musicApiUrl = 'http://192.168.1.217:5000/api/music';

  constructor(private http: HttpClient) { }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.userApiUrl}/${id}`);
  }

  updateUser(id: number, userData: UserUpdate): Observable<User> {
    return this.http.put<User>(`${this.userApiUrl}/${id}`, userData);
  }

  // Update to use the music controller endpoint
  getUserSongs(userId: number): Observable<Song[]> {
    return this.http.get<Song[]>(`${this.musicApiUrl}/user/${userId}/songs`);
  }

  getUserActivity(userId: number): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.userApiUrl}/${userId}/analytics`);
  }

  getUserFollowers(userId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.followerApiUrl}/${userId}/followers`);
  }

  getUserFollowing(userId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.followerApiUrl}/${userId}/following`);
  }

  followUser(followedUserId: number): Observable<any> {
    const currentUserId = this.getCurrentUserId();
    return this.http.post(`${this.followerApiUrl}/follow`, null, {
      params: {
        followerId: currentUserId.toString(),
        followedId: followedUserId.toString()
      }
    });
  }

  unfollowUser(followedUserId: number): Observable<any> {
    const currentUserId = this.getCurrentUserId();
    return this.http.post(`${this.followerApiUrl}/unfollow`, null, {
      params: {
        followerId: currentUserId.toString(),
        followedId: followedUserId.toString()
      }
    });
  }

  isFollowing(followedUserId: number): Observable<boolean> {
    const currentUserId = this.getCurrentUserId();
    return this.http.get<boolean>(`${this.followerApiUrl}/isFollowing`, {
      params: {
        followerId: currentUserId.toString(),
        followedId: followedUserId.toString()
      }
    });
  }

  private getCurrentUserId(): number {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId) : 0;
  }
}
