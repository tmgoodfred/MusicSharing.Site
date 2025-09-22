import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Song } from '../models/models';
import { Comment, Rating } from '../models/models';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SongService {
  private apiUrl = 'http://192.168.1.217:5000/api/music';
  private commentApiUrl = 'http://192.168.1.217:5000/api/comment';
  private ratingApiUrl = 'http://192.168.1.217:5000/api/rating';

  constructor(private http: HttpClient) { }

  private unwrapArray<T>(value: any): T[] {
    if (!value) return [];
    if (Array.isArray(value)) return value as T[];
    if (value.$values) return value.$values as T[];
    return value as T[];
  }

  private normalizeSong(raw: any): Song {
    return {
      ...raw,
      tags: this.unwrapArray<string>(raw.tags),
      categories: this.unwrapArray(raw.categories),
      comments: this.unwrapArray<Comment>(raw.comments),
      ratings: this.unwrapArray<Rating>(raw.ratings)
    } as Song;
  }

  getAllSongs(): Observable<Song[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => this.unwrapArray<any>(res).map(s => this.normalizeSong(s)))
    );
  }

  getSongById(id: number): Observable<Song> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(s => this.normalizeSong(s))
    );
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

    return this.http.get<any>(`${this.apiUrl}/search`, { params }).pipe(
      map(res => this.unwrapArray<any>(res).map(s => this.normalizeSong(s)))
    );
  }

  uploadSong(formData: FormData): Observable<Song> {
    return this.http.post<Song>(`${this.apiUrl}/upload`, formData);
  }

  updateSong(id: number, form: FormData): Observable<Song> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, form).pipe(
      map(s => this.normalizeSong(s))
    );
  }

  // UPDATED: pass userId as query parameter
  deleteSong(id: number, userId: number): Observable<any> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.delete(`${this.apiUrl}/${id}`, { params });
  }

  getComments(songId: number) {
    return this.http.get<any>(`${this.commentApiUrl}/song/${songId}`).pipe(
      map(res => this.unwrapArray<Comment>(res))
    );
  }

  addComment(comment: { songId: number, commentText: string, isAnonymous: boolean, userId: number }) {
    return this.http.post<Comment>(`${this.commentApiUrl}`, comment);
  }

  getRatings(songId: number) {
    return this.http.get<any>(`${this.ratingApiUrl}/song/${songId}`).pipe(
      map(res => ({
        ratings: this.unwrapArray<Rating>(res.ratings),
        average: res.average ?? 0
      }))
    );
  }

  addOrUpdateRating(rating: { songId: number, userId: number, ratingValue: number }) {
    return this.http.post<Rating>(`${this.ratingApiUrl}`, rating);
  }
}
