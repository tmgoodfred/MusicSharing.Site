import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ImageService } from '../../../core/services/image.service';
import { User } from '../../../core/models/models';
import { CommonModule } from '@angular/common';
import { of, switchMap, finalize } from 'rxjs';
import { ImageCropperModule, ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ImageCropperModule]
})
export class ProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  isSubmitting = false;
  error = '';
  currentUser: User | null = null;

  selectedProfilePicture: File | null = null;
  profilePreview = '';

  changePassword = false;

  // Cropper state
  showCropper = false;
  imageChangedEvent: any = null;
  croppedImageBase64 = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private imageService: ImageService
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      currentPassword: [''],
      newPassword: [''],
      confirmPassword: ['']
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({ username: user.username, email: user.email });
        if (user.profilePicturePath) {
          this.profilePreview = this.imageService.getProfileImageUrl(user.id);
        }
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  toggleChangePassword(): void {
    this.changePassword = !this.changePassword;
    if (!this.changePassword) {
      this.profileForm.patchValue({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  }

  onProfilePictureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.imageChangedEvent = event;
      this.showCropper = true;
    }
  }

  imageCropped(e: ImageCroppedEvent): void {
    this.croppedImageBase64 = e.base64 || '';
  }

  confirmCrop(): void {
    if (!this.croppedImageBase64) {
      this.showCropper = false;
      return;
    }
    this.selectedProfilePicture = this.base64ToFile(this.croppedImageBase64, 'profile.png');
    this.profilePreview = this.croppedImageBase64;
    this.showCropper = false;
    this.imageChangedEvent = null;
  }

  cancelCrop(): void {
    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImageBase64 = '';
  }

  loadImageFailed(): void {
    this.error = 'Failed to load image. Please try another file.';
  }

  private base64ToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = (arr[0].match(/:(.*?);/)?.[1]) || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8 = new Uint8Array(n);
    while (n--) u8[n] = bstr.charCodeAt(n);
    return new File([u8], filename, { type: mime });
  }

  onSubmit(): void {
    if (this.profileForm.invalid || this.isSubmitting || !this.currentUser) return;

    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId || parseInt(storedUserId, 10) !== this.currentUser.id) {
      this.error = 'You can only edit your own profile.';
      return;
    }

    // Separate validation for password change if enabled
    let shouldUpdatePassword = false;
    if (this.changePassword) {
      const newPwd = this.profileForm.value.newPassword?.trim();
      const confirm = this.profileForm.value.confirmPassword?.trim();

      if (!newPwd || newPwd.length < 6) {
        this.error = 'New password must be at least 6 characters.';
        return;
      }

      if (newPwd !== confirm) {
        this.error = 'New password and confirmation do not match.';
        return;
      }

      // Only set to true if we have a valid password to update
      shouldUpdatePassword = true;
    }

    this.isSubmitting = true;
    this.error = '';

    const form = new FormData();
    form.append('username', this.profileForm.value.username);
    form.append('email', this.profileForm.value.email);
    if (this.selectedProfilePicture) {
      form.append('profilePicture', this.selectedProfilePicture);
    }

    this.userService.updateUserFormData(this.currentUser.id, form).pipe(
      switchMap((updatedUser) => {
        this.authService.updateCurrentUser(updatedUser);

        // Only call updateUserPassword if shouldUpdatePassword is true
        if (shouldUpdatePassword) {
          const newPwd = this.profileForm.value.newPassword?.trim();
          return this.userService.updateUserPassword(this.currentUser!.id, newPwd);
        }
        return of(updatedUser);
      }),
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: () => {
        // Clear the image cache
        this.imageService.clearImageCache('profile', this.currentUser!.id);

        this.router.navigate(['/profile']).then(() => {
          window.location.reload();
        });
      },
      error: (err) => {
        this.error = 'Failed to update profile. ' + (err.error?.error || 'Please try again.');
        console.error('Error updating profile:', err);
      }
    });
  }
}
