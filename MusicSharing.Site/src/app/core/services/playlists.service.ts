import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Playlist, Song } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class PlaylistService {
    private apiUrl = 'http://192.168.1.217:5000/api/playlists';

    constructor(private http: HttpClient) { }

    getAllPlaylists(): Observable<Playlist[]> {
        return this.http.get<Playlist[]>(this.apiUrl);
    }

    getUserPlaylists(userId: number): Observable<Playlist[]> {
        return this.http.get<Playlist[]>(`${this.apiUrl}/user/${userId}`);
    }

    getPlaylistById(id: number): Observable<Playlist> {
        return this.http.get<Playlist>(`${this.apiUrl}/${id}`);
    }

    createPlaylist(playlist: Partial<Playlist>): Observable<Playlist> {
        return this.http.post<Playlist>(this.apiUrl, playlist);
    }

    updatePlaylist(id: number, playlist: Partial<Playlist>): Observable<Playlist> {
        return this.http.put<Playlist>(`${this.apiUrl}/${id}`, playlist);
    }

    deletePlaylist(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    addSongToPlaylist(playlistId: number, songId: number): Observable<Playlist> {
        return this.http.post<Playlist>(`${this.apiUrl}/${playlistId}/songs/${songId}`, {});
    }

    removeSongFromPlaylist(playlistId: number, songId: number): Observable<Playlist> {
        return this.http.delete<Playlist>(`${this.apiUrl}/${playlistId}/songs/${songId}`);
    }
}
