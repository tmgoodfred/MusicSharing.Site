import { Component, OnInit } from '@angular/core';
import { Song, Rating } from '../../../core/models/models';
import { SongService } from '../../../core/services/song.service';
import { PlayerService } from '../../../core/services/player.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-song-list',
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class SongListComponent implements OnInit {
  songs: Song[] = [];
  isLoading = true;
  error = '';
  isLoggedIn = false;

  constructor(
    private songService: SongService,
    private playerService: PlayerService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadSongs();
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  calculateAverageRating(ratings: Rating[] | undefined): string {
    if (!ratings || ratings.length === 0) {
      return 'No ratings';
    }

    const sum = ratings.reduce((acc, rating) => acc + rating.ratingValue, 0);
    const average = sum / ratings.length;
    return average.toFixed(1);
  }

  loadSongs(): void {
    this.isLoading = true;
    this.songService.getAllSongs().subscribe({
      next: (songs) => {
        this.songs = songs;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Error loading songs. Please try again later.';
        this.isLoading = false;
        console.error('Error loading songs', error);
      }
    });
  }

  playSong(song: Song): void {
    this.playerService.play(song);
  }

  addToQueue(song: Song, event: Event): void {
    event.stopPropagation();
    this.playerService.addToQueue(song);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}
