import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SongService } from '../../../core/services/song.service';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-song-upload',
  templateUrl: './song-upload.component.html',
  styleUrls: ['./song-upload.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class SongUploadComponent {
  uploadForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  selectedAudioFile: File | null = null;
  selectedArtworkFile: File | null = null;
  audioPreview = '';
  artworkPreview = '';

  // New: client-side max size (150 MB)
  readonly MAX_AUDIO_MB = 150;
  readonly MAX_AUDIO_BYTES = 150 * 1024 * 1024;

  constructor(
    private fb: FormBuilder,
    private songService: SongService,
    private router: Router,
    private tokenStorage: TokenStorageService
  ) {
    this.uploadForm = this.fb.group({
      title: ['', Validators.required],
      artist: ['', Validators.required],
      genre: [''],
      tags: [''] // comma-separated
    });
  }

  onAudioSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];

      if (file.size > this.MAX_AUDIO_BYTES) {
        this.errorMessage = `Audio file exceeds the ${this.MAX_AUDIO_MB} MB limit.`;
        this.selectedAudioFile = null;
        this.audioPreview = '';
        input.value = '';
        return;
      }

      this.errorMessage = '';
      this.selectedAudioFile = file;
      this.audioPreview = URL.createObjectURL(file);
    }
  }

  onArtworkSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedArtworkFile = input.files[0];
      this.artworkPreview = URL.createObjectURL(this.selectedArtworkFile);
    }
  }

  onSubmit(): void {
    if (this.uploadForm.invalid || !this.selectedAudioFile || this.isSubmitting) return;

    // Defensive check before submit
    if (this.selectedAudioFile.size > this.MAX_AUDIO_BYTES) {
      this.errorMessage = `Audio file exceeds the ${this.MAX_AUDIO_MB} MB limit.`;
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formData = new FormData();

    formData.append('File', this.selectedAudioFile);

    if (this.selectedArtworkFile) {
      formData.append('Artwork', this.selectedArtworkFile);
    }

    formData.append('Title', this.uploadForm.get('title')!.value);
    formData.append('Artist', this.uploadForm.get('artist')!.value);

    const genre = this.uploadForm.get('genre')!.value;
    if (genre) formData.append('Genre', genre);

    const tagsString = this.uploadForm.get('tags')!.value as string;
    if (tagsString) {
      tagsString
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .forEach(tag => formData.append('Tags', tag)); // repeat 'Tags' for each value
    }

    const userId = this.getCurrentUserId();
    formData.append('UserId', userId.toString());

    this.songService.uploadSong(formData).subscribe({
      next: (song) => this.router.navigate(['/songs', song.id]),
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error?.error?.error || 'Upload failed. Please try again.';
      }
    });
  }

  private getCurrentUserId(): number {
    const userId = this.tokenStorage.getUserId();
    if (!userId) {
      this.errorMessage = 'You must be logged in to upload songs.';
      this.isSubmitting = false;
      throw new Error('No user ID found');
    }
    return parseInt(userId, 10);
  }
}
