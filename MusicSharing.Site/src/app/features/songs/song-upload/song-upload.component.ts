import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SongService } from '../../../core/services/song.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-song-upload',
  templateUrl: './song-upload.component.html',
  styleUrls: ['./song-upload.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class SongUploadComponent {
  uploadForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  selectedAudioFile: File | null = null;
  selectedArtworkFile: File | null = null;
  audioPreview = '';
  artworkPreview = '';

  constructor(
    private fb: FormBuilder,
    private songService: SongService,
    private router: Router
  ) {
    this.uploadForm = this.fb.group({
      title: ['', Validators.required],
      artist: ['', Validators.required],
      genre: [''],
      tags: [''] // Will be split by comma in onSubmit
    });
  }

  onAudioSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedAudioFile = input.files[0];
      // Create a URL for preview
      this.audioPreview = URL.createObjectURL(this.selectedAudioFile);
    }
  }

  onArtworkSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedArtworkFile = input.files[0];
      // Create a URL for preview
      this.artworkPreview = URL.createObjectURL(this.selectedArtworkFile);
    }
  }

  onSubmit(): void {
    if (this.uploadForm.invalid || !this.selectedAudioFile || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('file', this.selectedAudioFile);

    if (this.selectedArtworkFile) {
      formData.append('artwork', this.selectedArtworkFile);
    }

    formData.append('title', this.uploadForm.get('title')?.value);
    formData.append('artist', this.uploadForm.get('artist')?.value);

    const genre = this.uploadForm.get('genre')?.value;
    if (genre) {
      formData.append('genre', genre);
    }

    const tagsString = this.uploadForm.get('tags')?.value;
    if (tagsString) {
      const tags = tagsString.split(',').map((tag: string) => tag.trim());
      tags.forEach((tag: string, index: number) => {
        formData.append(`tags[${index}]`, tag);
      });
    }

    this.songService.uploadSong(formData).subscribe({
      next: (song) => {
        this.router.navigate(['/songs', song.id]);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error?.error?.error || 'Upload failed. Please try again.';
      }
    });
  }
}
