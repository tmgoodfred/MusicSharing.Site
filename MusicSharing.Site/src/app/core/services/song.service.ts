import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Song, User, Comment, Rating } from '../models/models';
import { map } from 'rxjs/operators';
import { ImageService } from './image.service';

@Injectable({
  providedIn: 'root'
})
export class SongService {
  private apiUrl = 'https://music-sharing.online/api/music';
  private commentApiUrl = 'https://music-sharing.online/api/comment';
  private ratingApiUrl = 'https://music-sharing.online/api/rating';

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

  // UPDATED: map uploader -> user and set userId so UI can show Users section
  private normalizeSong(raw: any): Song {
    const userRaw = raw?.user ?? raw?.User ?? raw?.uploader ?? raw?.Uploader;
    const user = userRaw ? this.normalizeUser(userRaw) : undefined;

    return {
      ...raw,
      tags: this.unwrapArray<string>(raw?.tags),
      categories: this.unwrapArray<any>(raw?.categories),
      comments: this.unwrapArray<Comment>(raw?.comments),
      ratings: this.unwrapArray<Rating>(raw?.ratings),
      user,
      userId: raw?.userId ?? raw?.UserId ?? user?.id
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

  // Supports uploader filter and mixed results (server returns an array of song results with Uploader/user)
  searchSongs(
    title?: string,
    artist?: string,
    genre?: string,
    tags?: string[],
    uploaderOrUser?: string,
    minPlays?: number,
    maxPlays?: number,
    minRating?: number,
    maxRating?: number,
    fromDate?: string,
    toDate?: string,
    categoryIds?: number[]
  ): Observable<{ songs: Song[]; users: User[] }> {
    let params = new HttpParams();

    if (title) params = params.set('title', title);
    if (artist) params = params.set('artist', artist);
    if (genre) params = params.set('genre', genre);
    if (uploaderOrUser) {
      params = params.set('uploader', uploaderOrUser);
      params = params.set('user', uploaderOrUser);
    }
    if (minPlays !== undefined) params = params.set('minPlays', String(minPlays));
    if (maxPlays !== undefined) params = params.set('maxPlays', String(maxPlays));
    if (minRating !== undefined) params = params.set('minRating', String(minRating));
    if (maxRating !== undefined) params = params.set('maxRating', String(maxRating));
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    if (categoryIds && categoryIds.length) params = params.set('categoryIds', categoryIds.join(','));
    if (tags && tags.length) params = params.set('tags', tags.join(','));

    return this.http.get<any>(`${this.apiUrl}/search`, { params }).pipe(
      map(res => {
        // Case 1: Legacy array of songs
        if (Array.isArray(res) || res?.$values) {
          const songs = this.unwrapArray<any>(res).map(s => this.normalizeSong(s));
          return { songs, users: [] as User[] };
        }

        // Case 2: Object with songs/users already split
        if ((res?.songs || res?.Songs) || (res?.users || res?.Users)) {
          const songsRaw = res?.songs ?? res?.Songs ?? [];
          const usersRaw = res?.users ?? res?.Users ?? [];
          const songs = this.unwrapArray<any>(songsRaw).map((s: any) => this.normalizeSong(s));
          const users = this.unwrapArray<User>(usersRaw).map((u: any) => this.normalizeUser(u));
          return { songs, users };
        }

        // Case 3: New API shape returns an array of SongSearchResultDto with embedded Uploader
        const rows = this.unwrapArray<any>(res);
        const usersMap = new Map<number, User>();
        const songs = rows.map(item => {
          const uploaderRaw = item?.Uploader ?? item?.uploader ?? null;
          let uploaderUser: User | undefined;

          if (uploaderRaw && uploaderRaw.Id != null) {
            const mapped = this.normalizeUser(uploaderRaw);
            usersMap.set(mapped.id, mapped);
            uploaderUser = mapped;
          }

          const rawSong = {
            id: item.Id ?? item.id,
            title: item.Title ?? item.title,
            artist: item.Artist ?? item.artist,
            genre: item.Genre ?? item.genre,
            tags: item.Tags ?? item.tags ?? [],
            uploadDate: item.UploadDate ?? item.uploadDate,
            playCount: item.PlayCount ?? item.playCount ?? 0,
            downloadCount: item.DownloadCount ?? item.downloadCount ?? 0,
            filePath: item.filePath ?? item.FilePath,
            artworkPath: item.artworkPath ?? item.ArtworkPath,
            categories: item.Categories ?? item.categories ?? [],
            comments: item.Comments ?? item.comments ?? [],
            ratings: item.Ratings ?? item.ratings ?? [],
            user: uploaderUser,
            userId: uploaderUser?.id
          };

          return this.normalizeSong(rawSong);
        });

        const users = Array.from(usersMap.values());
        return { songs, users };
      })
    );
  }

  private normalizeUser(raw: any): User {
    const roleRaw = raw?.Role ?? raw?.role;
    const role = typeof roleRaw === 'string' ? roleRaw : (roleRaw === 1 ? 'Admin' : 'User');

    return {
      id: raw.Id ?? raw.id,
      username: raw.Username ?? raw.username,
      email: raw.Email ?? raw.email,
      role,
      createdAt: raw.CreatedAt ?? raw.createdAt,
      profilePicturePath: raw.ProfilePicturePath ?? raw.profilePicturePath,
      emailConfirmed: raw.EmailConfirmed ?? raw.emailConfirmed ?? true
    } as User;
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

  getSongCommentById(songId: number, commentId: number) {
    return this.http.get<Comment>(`${this.commentApiUrl}/song/${songId}/${commentId}`);
  }

  getBlogCommentById(blogPostId: number, commentId: number) {
    return this.http.get<Comment>(`${this.commentApiUrl}/blog/${blogPostId}/${commentId}`);
  }

  addComment(comment: { songId: number, commentText: string, isAnonymous: boolean, userId: number | null }) {
    return this.http.post<Comment>(`${this.commentApiUrl}`, comment);
  }

  deleteComment(commentId: number, userId: number, isAdmin: boolean): Observable<any> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('isAdmin', String(isAdmin));
    return this.http.delete(`${this.commentApiUrl}/${commentId}`, { params });
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

  getArtworkUrl(songId: number, forceRefresh = false): string {
    return this.imageService.getSongArtworkUrl(songId, forceRefresh);
  }

  refreshArtworkCache(songId: number): void {
    this.imageService.clearImageCache('artwork', songId);
  }
}
