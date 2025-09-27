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
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordComplexityValidator()]],
      confirmPassword: ['', [Validators.required]]
    });
    this.registerForm.addValidators(this.passwordMatchValidator());
  }

  passwordComplexityValidator(): ValidatorFn {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).{8,}$/;
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as string;
      if (!value) return null;
      return regex.test(value) ? null : { passwordComplexity: true };
    };
  }

  passwordMatchValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const passwordControl = formGroup.get('password');
      const confirmPasswordControl = formGroup.get('confirmPassword');
      if (!passwordControl || !confirmPasswordControl) return null;
      return passwordControl.value === confirmPasswordControl.value ? null : { passwordMismatch: true };
    };
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
        this.isSubmitting = false;
        // Redirect to login with banner instructing to verify email
        this.router.navigate(['/auth/login'], { queryParams: { registered: 1 } });
      },
      error: (error) => {
        this.isSubmitting = false;
        if (error?.status === 409 && error?.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = error?.error?.error || 'Registration failed. Please try again.';
        }
      }
    });
  }
}
