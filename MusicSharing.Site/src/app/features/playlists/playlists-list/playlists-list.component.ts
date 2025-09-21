import { Component, OnInit } from '@angular/core';
import { PlaylistService } from '../../../core/services/playlists.service';
import { AuthService } from '../../../core/services/auth.service';
import { Playlist, User } from '../../../core/models/models';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-playlists-list',
  templateUrl: './playlists-list.component.html',
  styleUrls: ['./playlists-list.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class PlaylistsListComponent implements OnInit {
  playlists: Playlist[] = [];
  isLoading = true;
  error = '';
  currentUser: User | null = null;

  constructor(
    private playlistService: PlaylistService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadUserPlaylists(user.id);
      }
    });
  }

  loadUserPlaylists(userId: number): void {
    this.isLoading = true;
    this.playlistService.getUserPlaylists(userId).subscribe({
      next: (playlists) => {
        this.playlists = playlists;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load playlists. Please try again.';
        this.isLoading = false;
        console.error('Error loading playlists:', err);
      }
    });
  }

  deletePlaylist(id: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) {
      return;
    }

    this.playlistService.deletePlaylist(id).subscribe({
      next: () => {
        this.playlists = this.playlists.filter(playlist => playlist.id !== id);
      },
      error: (err) => {
        console.error('Error deleting playlist:', err);
        alert('Failed to delete playlist. Please try again.');
      }
    });
  }

  getSongCount(playlist: Playlist): number {
    return playlist.songs?.length || 0;
  }
}
