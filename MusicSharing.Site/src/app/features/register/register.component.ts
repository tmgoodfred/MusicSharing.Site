import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ImageCropperModule, ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ImageCropperModule]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  selectedProfilePicture: File | null = null;
  profilePreview = '';

  showCropper = false;
  imageChangedEvent: any = null;
  croppedImageBase64 = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Create the form with individual controls
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });

    // Add the validator to the form after creation
    this.registerForm.addValidators(this.passwordMatchValidator());
  }

  // Updated to return a ValidatorFn
  passwordMatchValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const passwordControl = formGroup.get('password');
      const confirmPasswordControl = formGroup.get('confirmPassword');

      if (!passwordControl || !confirmPasswordControl) {
        return null;
      }

      const password = passwordControl.value;
      const confirmPassword = confirmPasswordControl.value;

      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  // Rest of your component remains the same...
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
    this.errorMessage = 'Failed to load image. Please try another file.';
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
    if (this.registerForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const { username, email, password } = this.registerForm.value;

    this.authService.register(username, email, password, this.selectedProfilePicture).subscribe({
      next: () => {
        this.authService.login(email, password).subscribe({
          next: () => this.router.navigate(['/']),
          error: () => {
            this.isSubmitting = false;
            this.errorMessage = 'Registration successful but login failed. Please login manually.';
          }
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error?.error?.error || 'Registration failed. Please try again.';
      }
    });
  }
}
