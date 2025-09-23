import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SongService } from '../../../core/services/song.service';
import { AuthService } from '../../../core/services/auth.service';
import { ImageService } from '../../../core/services/image.service';
import { PlayerService } from '../../../core/services/player.service';
import { Song, Comment, User, UserRole } from '../../../core/models/models';
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
  isAdmin = false;

  commentForm: FormGroup;
  isSubmittingComment = false;

  // Owner edit modal
  isOwner = false;
  showEditModal = false;
  editSongForm: FormGroup;
  selectedArtworkFile: File | null = null;

  // Deletion state
  isDeleting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private songService: SongService,
    private authService: AuthService,
    private playerService: PlayerService,
    private imageService: ImageService,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      commentText: ['', [Validators.required, Validators.minLength(2)]],
      isAnonymous: [false]
    });

    this.editSongForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      artist: ['', [Validators.required, Validators.maxLength(200)]],
      genre: [''],
      tagsText: ['']
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = user?.role === UserRole.Admin;
      this.updateIsOwner();
    });
  }

  ngOnInit(): void {
    this.loadSong();
  }

  private updateIsOwner(): void {
    this.isOwner = !!(this.currentUser && this.song && this.song.userId === this.currentUser.id);
  }

  getArtworkUrl(songId: number): string {
    return this.songService.getArtworkUrl(songId);
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
        this.updateIsOwner();
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
    if (this.song) this.playerService.play(this.song);
  }

  addToQueue(): void {
    if (this.song) this.playerService.addToQueue(this.song);
  }

  downloadSong(): void {
    if (this.song) {
      window.location.href = `http://192.168.1.217:5000/api/music/${this.song.id}/download`;
    }
  }

  submitComment(): void {
    if (this.commentForm.invalid || !this.song || this.isSubmittingComment || !this.currentUser) return;

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
        this.commentForm.reset({ commentText: '', isAnonymous: false });
        this.isSubmittingComment = false;
      },
      error: () => { this.isSubmittingComment = false; }
    });
  }

  setRating(rating: number): void {
    if (!this.currentUser || !this.song) return;

    this.userRating = rating;

    this.songService.addOrUpdateRating({
      songId: this.song.id,
      userId: this.currentUser.id,
      ratingValue: rating
    }).subscribe({ next: () => this.loadRatings() });
  }

  openEditModal(): void {
    if (!this.song) return;
    this.editSongForm.reset({
      title: this.song.title || '',
      artist: this.song.artist || '',
      genre: this.song.genre || '',
      tagsText: (this.song.tags && this.song.tags.length > 0) ? this.song.tags.join(', ') : ''
    });
    this.selectedArtworkFile = null;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedArtworkFile = null;
  }

  onArtworkSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedArtworkFile = (input.files && input.files.length > 0) ? input.files[0] : null;
  }

  submitSongUpdate(): void {
    if (!this.song || this.editSongForm.invalid) return;

    const tagsCsv = (this.editSongForm.value.tagsText || '')
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0)
      .join(',');

    const form = new FormData();
    form.append('title', this.editSongForm.value.title);
    form.append('artist', this.editSongForm.value.artist);
    form.append('genre', this.editSongForm.value.genre || '');
    form.append('tags', tagsCsv);
    if (this.selectedArtworkFile) form.append('artwork', this.selectedArtworkFile);

    this.songService.updateSong(this.song.id, form).subscribe({
      next: (updated) => {
        this.song = { ...this.song!, ...updated };
        if (this.selectedArtworkFile) {
          this.songService.refreshArtworkCache(this.song!.id);
        }
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Failed to update song:', err);
        alert('Failed to update song. Please try again.');
      }
    });
  }

  // Delete handlers (pass userId as query parameter)
  confirmDelete(): void {
    if (!this.song || this.isDeleting || !this.currentUser) return;
    if (!confirm('Are you sure you want to delete this song? This action cannot be undone.')) return;

    this.isDeleting = true;
    this.songService.deleteSong(this.song.id, this.currentUser.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.router.navigate(['/songs']);
      },
      error: (err) => {
        this.isDeleting = false;
        console.error('Failed to delete song:', err);
        alert('Failed to delete song. Please try again.');
      }
    });
  }

  // NEW: permissions + delete for comments
  canDeleteComment(comment: Comment): boolean {
    if (!this.currentUser) return false;
    const ownerId = (comment as any).userId ?? comment.user?.id;
    return this.isAdmin || ownerId === this.currentUser.id;
  }

  deleteComment(comment: Comment): void {
    if (!this.currentUser) return;
    if (!confirm('Delete this comment?')) return;

    this.songService.deleteComment(comment.id, this.currentUser.id, this.isAdmin).subscribe({
      next: () => this.loadComments(),
      error: (err) => {
        console.error('Failed to delete comment:', err);
        alert('Failed to delete comment. You may not have permission.');
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  }

  getCommentAuthor(comment: Comment): string {
    if (comment.isAnonymous) return 'Anonymous';
    return comment.user?.username || 'Unknown';
  }
}
