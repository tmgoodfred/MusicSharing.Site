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
        this.loadComments();
        this.loadRatings();
      },
      error: (error) => {
        this.error = 'Error loading song details';
        this.isLoading = false;
        console.error('Error loading song', error);
      }
    });
  }

  loadRatings(): void {
    if (!this.song) return;
    this.songService.getRatings(this.song.id).subscribe({
      next: (result) => {
        if (this.song) {
          this.song.ratings = result.ratings;
          this.averageRating = result.average;
          if (this.currentUser) {
            const userRating = result.ratings.find(r => r.userId === this.currentUser?.id);
            this.userRating = userRating ? userRating.ratingValue : 0;
          }
        }
      }
    });
  }

  loadComments(): void {
    if (!this.song) return;
    this.songService.getComments(this.song.id).subscribe({
      next: (comments) => {
        if (this.song) this.song.comments = comments;
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

    this.songService.addComment(comment).subscribe({
      next: () => {
        this.loadComments();
        this.commentForm.reset({
          commentText: '',
          isAnonymous: false
        });
        this.isSubmittingComment = false;
      },
      error: () => {
        this.isSubmittingComment = false;
      }
    });
  }

  setRating(rating: number): void {
    if (!this.currentUser || !this.song) {
      return;
    }

    this.userRating = rating;

    const ratingObj = {
      songId: this.song.id,
      userId: this.currentUser.id,
      ratingValue: rating
    };

    this.songService.addOrUpdateRating(ratingObj).subscribe({
      next: () => {
        this.loadRatings();
      }
    });
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
