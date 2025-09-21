import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserUpdate } from '../../../core/models/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  isSubmitting = false;
  error = '';
  currentUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
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
        this.profileForm.patchValue({
          username: user.username,
          email: user.email
        });
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid || this.isSubmitting || !this.currentUser) {
      return;
    }

    // Check if password fields are filled correctly
    if (this.profileForm.get('newPassword')?.value) {
      if (!this.profileForm.get('currentPassword')?.value) {
        this.error = 'You must enter your current password to set a new password.';
        return;
      }

      if (this.profileForm.get('newPassword')?.value !== this.profileForm.get('confirmPassword')?.value) {
        this.error = 'New password and confirmation do not match.';
        return;
      }
    }

    this.isSubmitting = true;
    this.error = '';

    const updatedUser: UserUpdate = {
      username: this.profileForm.value.username,
      email: this.profileForm.value.email
    };

    // Only include password fields if user is changing password
    if (this.profileForm.value.newPassword) {
      updatedUser.passwordHash = this.profileForm.value.newPassword;
      updatedUser.currentPassword = this.profileForm.value.currentPassword;
    }

    this.userService.updateUser(this.currentUser.id, updatedUser).subscribe({
      next: (user) => {
        // Refresh the auth token/user data since it may have changed
        this.authService.login(user.email, this.profileForm.value.currentPassword || '').subscribe({
          next: () => {
            this.router.navigate(['/profile']);
          },
          error: (err) => {
            // If login fails, just navigate anyway, they'll need to login again
            this.router.navigate(['/profile']);
          }
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.error = 'Failed to update profile. ' + (err.error?.error || 'Please try again.');
        console.error('Error updating profile:', err);
      }
    });
  }
}
