import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { Song, User, UserRole } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = 'http://192.168.1.217:5000/api/search';

  constructor(private http: HttpClient) { }

  private unwrapArray<T>(value: any): T[] {
    if (!value) return [];
    if (Array.isArray(value)) return value as T[];
    if (value.$values) return value.$values as T[];
    return value as T[];
  }

  private normalizeUser(raw: any): User {
    const roleStr = (raw?.Role ?? raw?.role ?? '').toString().toLowerCase();
    const role = roleStr === 'admin' ? UserRole.Admin : UserRole.User;

    return {
      id: raw?.Id ?? raw?.id,
      username: raw?.Username ?? raw?.username,
      email: raw?.Email ?? raw?.email,
      role,
      createdAt: raw?.CreatedAt ?? raw?.createdAt,
      profilePicturePath: raw?.ProfilePicturePath ?? raw?.profilePicturePath
    } as User;
  }

  private normalizeSongDto(raw: any): Song {
    const uploaderRaw = raw?.Uploader ?? raw?.uploader;
    const user = uploaderRaw ? this.normalizeUser(uploaderRaw) : undefined;

    return {
      id: raw?.Id ?? raw?.id,
      title: raw?.Title ?? raw?.title,
      artist: raw?.Artist ?? raw?.artist,
      genre: raw?.Genre ?? raw?.genre,
      tags: this.unwrapArray<string>(raw?.Tags ?? raw?.tags ?? []),
      uploadDate: raw?.UploadDate ?? raw?.uploadDate,
      playCount: raw?.PlayCount ?? raw?.playCount ?? 0,
      downloadCount: raw?.DownloadCount ?? raw?.downloadCount ?? 0,
      filePath: '', // not supplied by search DTO
      artworkPath: raw?.ArtworkPath ?? raw?.artworkPath,
      user,
      userId: user?.id
    } as Song;
  }

  search(q: string, take: number = 20): Observable<{ songs: Song[]; users: User[] }> {
    const query = (q ?? '').trim();
    if (!query) {
      return of({ songs: [], users: [] });
    }

    let params = new HttpParams().set('q', query).set('take', String(take));
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(res => {
        const songsRaw = res?.Songs ?? res?.songs ?? [];
        const usersRaw = res?.Users ?? res?.users ?? [];

        const songs = this.unwrapArray<any>(songsRaw).map(s => this.normalizeSongDto(s));
        const users = this.unwrapArray<any>(usersRaw).map(u => this.normalizeUser(u));

        return { songs, users };
      })
    );
  }
}
