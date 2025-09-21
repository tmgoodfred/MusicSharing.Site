import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SongService } from '../../../core/services/song.service';
import { AuthService } from '../../../core/services/auth.service';
import { PlayerService } from '../../../core/services/player.service';
import { Song, Comment, User, Rating } from '../../../core/models/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-song-detail',
  templateUrl: './song-detail.component.html',
  styleUrls: ['./song-detail.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class SongDetailComponent implements OnInit {
  song: Song | null = null;
  isLoading = true;
  error = '';

  currentUser: User | null = null;
  userRating = 0;
  averageRating = 0;

  commentForm: FormGroup;
  isSubmittingComment = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private songService: SongService,
    private authService: AuthService,
    private playerService: PlayerService,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      commentText: ['', [Validators.required, Validators.minLength(2)]],
      isAnonymous: [false]
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {
    this.loadSong();
  }

  loadSong(): void {
    const songId = this.route.snapshot.paramMap.get('id');
    if (!songId) {
      this.error = 'Song ID not found';
      this.isLoading = false;
      return;
    }

    this.songService.getSongById(parseInt(songId)).subscribe({
      next: (song) => {
        this.song = song;
        this.isLoading = false;

        // Calculate average rating
        if (song.ratings && song.ratings.length > 0) {
          this.averageRating = song.ratings.reduce((sum, rating) => sum + rating.ratingValue, 0) / song.ratings.length;
        }

        // Get user's rating if logged in
        if (this.currentUser && song.ratings) {
          const userRating = song.ratings.find(r => r.userId === this.currentUser?.id);
          if (userRating) {
            this.userRating = userRating.ratingValue;
          }
        }
      },
      error: (error) => {
        this.error = 'Error loading song details';
        this.isLoading = false;
        console.error('Error loading song', error);
      }
    });
  }

  playSong(): void {
    if (this.song) {
      this.playerService.play(this.song);
    }
  }

  addToQueue(): void {
    if (this.song) {
      this.playerService.addToQueue(this.song);
    }
  }

  downloadSong(): void {
    if (this.song) {
      window.location.href = `http://192.168.1.217:5000/api/music/${this.song.id}/download`;
    }
  }

  submitComment(): void {
    if (this.commentForm.invalid || !this.song || this.isSubmittingComment || !this.currentUser) {
      return;
    }

    this.isSubmittingComment = true;

    const comment = {
      songId: this.song.id,
      commentText: this.commentForm.value.commentText,
      isAnonymous: this.commentForm.value.isAnonymous,
      userId: this.currentUser.id
    };

    // In a real implementation, you would call a comment service here
    // For now, we'll just simulate adding the comment to the song
    const newComment: Comment = {
      id: Math.floor(Math.random() * 10000), // This would come from the server in real app
      ...comment,
      createdAt: new Date().toISOString(),
      user: !comment.isAnonymous ? this.currentUser : undefined
    };

    // Add comment to the song
    if (!this.song.comments) {
      this.song.comments = [];
    }
    this.song.comments.push(newComment);

    // Reset form
    this.commentForm.reset({
      commentText: '',
      isAnonymous: false
    });
    this.isSubmittingComment = false;
  }

  setRating(rating: number): void {
    if (!this.currentUser || !this.song) {
      return;
    }

    this.userRating = rating;

    // In a real app, you'd make an API call here
    if (!this.song.ratings) {
      this.song.ratings = [];
    }

    const existingRatingIndex = this.song.ratings.findIndex(r => r.userId === this.currentUser!.id);

    if (existingRatingIndex > -1) {
      // Update existing rating
      this.song.ratings[existingRatingIndex].ratingValue = rating;
    } else {
      // Add new rating
      this.song.ratings.push({
        id: Math.floor(Math.random() * 10000),
        songId: this.song.id,
        userId: this.currentUser.id,
        ratingValue: rating,
        createdAt: new Date().toISOString()
      });
    }

    // Recalculate average
    this.averageRating = this.song.ratings.reduce((sum, r) => sum + r.ratingValue, 0) / this.song.ratings.length;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  }

  getCommentAuthor(comment: Comment): string {
    if (comment.isAnonymous) {
      return 'Anonymous';
    }
    return comment.user?.username || 'Unknown';
  }
}
