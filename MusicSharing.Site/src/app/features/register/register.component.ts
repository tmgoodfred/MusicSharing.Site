import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  // Profile picture selection
  selectedProfilePicture: File | null = null;
  profilePreview = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onProfilePictureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedProfilePicture = input.files[0];
      this.profilePreview = URL.createObjectURL(this.selectedProfilePicture);
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { username, email, password } = this.registerForm.value;

    this.authService.register(username, email, password, this.selectedProfilePicture).subscribe({
      next: () => {
        // Auto-login after registration
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
