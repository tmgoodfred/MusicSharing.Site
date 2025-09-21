import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PlaylistService } from '../../../core/services/playlists.service';
import { AuthService } from '../../../core/services/auth.service';
import { PlayerService } from '../../../core/services/player.service';
import { Playlist, Song, User } from '../../../core/models/models';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-playlist-detail',
    templateUrl: './playlists-detail.component.html',
  styleUrls: ['./playlists-detail.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]

})
export class PlaylistsDetailComponent implements OnInit {
    playlist: Playlist | null = null;
    isLoading = true;
    error = '';
    currentUser: User | null = null;
    isOwner = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private playlistService: PlaylistService,
        private authService: AuthService,
        private playerService: PlayerService
    ) { }

    ngOnInit(): void {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
            this.loadPlaylist();
        });
    }

    loadPlaylist(): void {
        const playlistId = this.route.snapshot.paramMap.get('id');
        if (!playlistId) {
            this.error = 'Playlist ID not found';
            this.isLoading = false;
            return;
        }

        this.playlistService.getPlaylistById(parseInt(playlistId)).subscribe({
            next: (playlist) => {
                this.playlist = playlist;
                this.isOwner = this.currentUser?.id === playlist.userId;
                this.isLoading = false;
            },
            error: (err) => {
                this.error = 'Failed to load playlist. It may have been removed or you don\'t have permission to view it.';
                this.isLoading = false;
                console.error('Error loading playlist:', err);
            }
        });
    }

    playAll(): void {
        if (!this.playlist?.songs?.length) return;

        // Play the first song
        this.playerService.play(this.playlist.songs[0]);

        // Add the rest to queue
        this.playlist.songs.slice(1).forEach(song => {
            this.playerService.addToQueue(song);
        });
    }

    playSong(song: Song): void {
        this.playerService.play(song);
    }

    addToQueue(song: Song): void {
        this.playerService.addToQueue(song);
    }

    removeSongFromPlaylist(songId: number): void {
        if (!this.playlist || !this.isOwner) return;

        if (!confirm('Are you sure you want to remove this song from the playlist?')) {
            return;
        }

        this.playlistService.removeSongFromPlaylist(this.playlist.id, songId).subscribe({
            next: (updatedPlaylist) => {
                this.playlist = updatedPlaylist;
            },
            error: (err) => {
                console.error('Error removing song from playlist:', err);
                alert('Failed to remove song. Please try again.');
            }
        });
    }

    deletePlaylist(): void {
        if (!this.playlist || !this.isOwner) return;

        if (!confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) {
            return;
        }

        this.playlistService.deletePlaylist(this.playlist.id).subscribe({
            next: () => {
                this.router.navigate(['/playlists']);
            },
            error: (err) => {
                console.error('Error deleting playlist:', err);
                alert('Failed to delete playlist. Please try again.');
            }
        });
    }

    formatDuration(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
}
