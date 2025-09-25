import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { Playlist, Song } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  // Match backend controller route (singular)
  private apiUrl = 'https://api.music-sharing.online/api/playlist';

  constructor(private http: HttpClient) { }

  // Unwrap .NET $values arrays
  private unwrapArray<T>(value: any): T[] {
    if (!value) return [];
    if (Array.isArray(value)) return value as T[];
    if (value.$values) return value.$values as T[];
    return value as T[];
  }

  private normalizeSong(raw: any): Song {
    return { ...raw } as Song;
  }

  private normalizePlaylist(raw: any): Playlist {
    const songs = this.unwrapArray<any>(raw.songs).map(s => this.normalizeSong(s));
    return { ...raw, songs } as Playlist;
  }

  getAllPlaylists(): Observable<Playlist[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => this.unwrapArray<any>(res).map(p => this.normalizePlaylist(p)))
    );
  }

  // Client-side filter for current user's playlists
  getUserPlaylists(userId: number): Observable<Playlist[]> {
    return this.getAllPlaylists().pipe(map(list => list.filter(p => p.userId === userId)));
  }

  getPlaylistById(id: number): Observable<Playlist> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(p => this.normalizePlaylist(p))
    );
  }

  createPlaylist(playlist: Partial<Playlist>): Observable<Playlist> {
    return this.http.post<Playlist>(this.apiUrl, playlist);
  }

  updatePlaylist(id: number, playlist: Partial<Playlist>): Observable<Playlist> {
    return this.http.put<Playlist>(`${this.apiUrl}/${id}`, playlist);
  }

  // Backend requires userId as query param
  deletePlaylist(id: number, userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { params: { userId: userId.toString() } });
  }

  // Return updated playlist after add/remove so components can assign it
  addSongToPlaylist(playlistId: number, songId: number): Observable<Playlist> {
    return this.http.post<void>(`${this.apiUrl}/${playlistId}/songs/${songId}`, {}).pipe(
      switchMap(() => this.getPlaylistById(playlistId))
    );
  }

  removeSongFromPlaylist(playlistId: number, songId: number): Observable<Playlist> {
    return this.http.delete<void>(`${this.apiUrl}/${playlistId}/songs/${songId}`).pipe(
      switchMap(() => this.getPlaylistById(playlistId))
    );
  }
}
