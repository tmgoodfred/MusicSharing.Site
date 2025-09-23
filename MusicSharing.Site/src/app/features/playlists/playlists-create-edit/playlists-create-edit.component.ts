import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PlaylistService } from '../../../core/services/playlists.service';
import { SongService } from '../../../core/services/song.service';
import { ImageService } from '../../../core/services/image.service';
import { CommonModule } from '@angular/common';
import { Playlist, Song, User } from '../../../core/models/models';
import { AuthService } from '../../../core/services/auth.service';
import { forkJoin, catchError, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-playlists-create-edit',
  templateUrl: './playlists-create-edit.component.html',
  styleUrls: ['./playlists-create-edit.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule]
})
export class PlaylistsCreateEditComponent implements OnInit {
  playlistForm: FormGroup;
  isSubmitting = false;
  error = '';
  isEditMode = false;
  playlistId?: number;
  currentUser: User | null = null;

  // Songs management
  availableSongs: Song[] = [];
  selectedSongs: Song[] = [];
  isLoadingSongs = false;
  searchQuery = '';
  filteredSongs: Song[] = [];

  constructor(
    private fb: FormBuilder,
    private playlistService: PlaylistService,
    private songService: SongService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private imageService: ImageService,
    private router: Router
  ) {
    this.playlistForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Check if we're editing an existing playlist
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.playlistId = parseInt(id);
      this.loadPlaylistData();
    } else {
      this.loadAvailableSongs();
    }
  }

  getArtworkUrl(songId: number): string {
    return this.songService.getArtworkUrl(songId);
  }

  loadPlaylistData(): void {
    if (!this.playlistId) return;

    // Load both playlist details and available songs in parallel
    forkJoin({
      playlist: this.playlistService.getPlaylistById(this.playlistId),
      songs: this.songService.getAllSongs().pipe(catchError(() => of([])))
    }).subscribe({
      next: (data) => {
        // Update form with playlist details
        this.playlistForm.patchValue({
          name: data.playlist.name,
          description: data.playlist.description || ''
        });

        // Set up songs
        this.availableSongs = data.songs;
        this.selectedSongs = data.playlist.songs || [];

        // Filter available songs to not include selected songs
        this.updateAvailableSongs();

        // Initialize filtered songs
        this.filteredSongs = this.availableSongs;
      },
      error: (err) => {
        this.error = 'Failed to load playlist data. Please try again.';
        console.error('Error loading playlist data:', err);
      }
    });
  }

  loadAvailableSongs(): void {
    this.isLoadingSongs = true;
    this.songService.getAllSongs().subscribe({
      next: (songs) => {
        this.availableSongs = songs;
        this.filteredSongs = songs;
        this.isLoadingSongs = false;
      },
      error: (err) => {
        this.error = 'Failed to load songs. Please try again.';
        this.isLoadingSongs = false;
        console.error('Error loading songs:', err);
      }
    });
  }

  updateAvailableSongs(): void {
    // Remove selected songs from available songs
    if (this.selectedSongs.length) {
      const selectedIds = this.selectedSongs.map(song => song.id);
      this.availableSongs = this.availableSongs.filter(song => !selectedIds.includes(song.id));
    }
  }

  onSearchChange(): void {
    if (!this.searchQuery.trim()) {
      this.filteredSongs = this.availableSongs;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredSongs = this.availableSongs.filter(song =>
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query)
    );
  }

  addSong(song: Song): void {
    this.selectedSongs.push(song);
    this.availableSongs = this.availableSongs.filter(s => s.id !== song.id);
    this.filteredSongs = this.filteredSongs.filter(s => s.id !== song.id);
  }

  removeSong(song: Song): void {
    this.selectedSongs = this.selectedSongs.filter(s => s.id !== song.id);
    this.availableSongs.push(song);
    this.onSearchChange(); // Re-filter available songs
  }

  onSubmit(): void {
    if (this.playlistForm.invalid || this.isSubmitting || !this.currentUser) {
      return;
    }

    this.isSubmitting = true;
    this.error = '';

    const playlistData: Partial<Playlist> = {
      name: this.playlistForm.value.name,
      description: this.playlistForm.value.description,
      userId: this.currentUser.id
    };

    // Different logic for create vs. edit
    const request = this.isEditMode && this.playlistId
      ? this.playlistService.updatePlaylist(this.playlistId, playlistData)
      : this.playlistService.createPlaylist(playlistData);

    request.pipe(
      // After creating/updating the playlist, handle song assignments
      switchMap(playlist => {
        if (this.isEditMode && this.selectedSongs.length === 0) {
          // If editing and all songs were removed, just return the playlist
          return of(playlist);
        }

        // For new playlists or if songs have changed, we need to handle the song assignments
        const songRequests = this.selectedSongs.map(song =>
          this.playlistService.addSongToPlaylist(playlist.id, song.id)
        );

        // If no songs to add, return the playlist as is
        if (songRequests.length === 0) {
          return of(playlist);
        }

        // Process all song additions and return the final playlist
        return forkJoin(songRequests).pipe(
          // Just return the last result which should have all songs
          switchMap(() => this.playlistService.getPlaylistById(playlist.id))
        );
      })
    ).subscribe({
      next: (playlist) => {
        this.router.navigate(['/playlists', playlist.id]);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.error = this.isEditMode
          ? 'Failed to update playlist. Please try again.'
          : 'Failed to create playlist. Please try again.';
        console.error('Error submitting playlist:', err);
      }
    });
  }
}
