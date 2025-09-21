import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Song } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class SongService {
  private apiUrl = 'http://192.168.1.217:5000/api/music';

  constructor(private http: HttpClient) { }

  getAllSongs(): Observable<Song[]> {
    return this.http.get<Song[]>(this.apiUrl);
  }

  getSongById(id: number): Observable<Song> {
    return this.http.get<Song>(`${this.apiUrl}/${id}`);
  }

  searchSongs(
    title?: string,
    artist?: string,
    genre?: string,
    tags?: string[],
    minPlays?: number,
    maxRating?: number,
    fromDate?: string
  ): Observable<Song[]> {
    let params = new HttpParams();

    if (title) params = params.set('title', title);
    if (artist) params = params.set('artist', artist);
    if (genre) params = params.set('genre', genre);
    if (minPlays) params = params.set('minPlays', minPlays.toString());
    if (maxRating) params = params.set('maxRating', maxRating.toString());
    if (fromDate) params = params.set('fromDate', fromDate);
    if (tags && tags.length) params = params.set('tags', tags.join(','));

    return this.http.get<Song[]>(`${this.apiUrl}/search`, { params });
  }

  uploadSong(formData: FormData): Observable<Song> {
    return this.http.post<Song>(`${this.apiUrl}/upload`, formData);
  }

  updateSong(id: number, song: Partial<Song>): Observable<Song> {
    return this.http.put<Song>(`${this.apiUrl}/${id}`, song);
  }

  deleteSong(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
