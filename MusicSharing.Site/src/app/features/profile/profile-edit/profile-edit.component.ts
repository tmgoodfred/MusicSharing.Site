import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/models';
import { CommonModule } from '@angular/common';
import { of, switchMap, finalize } from 'rxjs';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class ProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  isSubmitting = false;
  error = '';
  currentUser: User | null = null;

  selectedProfilePicture: File | null = null;
  profilePreview = '';

  // Toggleable password change
  changePassword = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      // password fields (only used if changePassword === true)
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

  toggleChangePassword(): void {
    this.changePassword = !this.changePassword;
    if (!this.changePassword) {
      this.profileForm.patchValue({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  }

  onProfilePictureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedProfilePicture = input.files[0];
      this.profilePreview = URL.createObjectURL(this.selectedProfilePicture);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid || this.isSubmitting || !this.currentUser) {
      return;
    }

    // Optional client-side check the route matches logged in user
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId || parseInt(storedUserId, 10) !== this.currentUser.id) {
      this.error = 'You can only edit your own profile.';
      return;
    }

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
    }

    this.isSubmitting = true;
    this.error = '';

    // Build form-data for profile update (username/email/picture)
    const form = new FormData();
    form.append('username', this.profileForm.value.username);
    form.append('email', this.profileForm.value.email);
    if (this.selectedProfilePicture) {
      form.append('profilePicture', this.selectedProfilePicture);
    }

    // First update profile details; then, if requested, update password via JSON endpoint
    this.userService.updateUserFormData(this.currentUser.id, form).pipe(
      switchMap(() => {
        if (this.changePassword) {
          const newPwd = this.profileForm.value.newPassword as string;
          return this.userService.updateUserPassword(this.currentUser!.id, newPwd);
        }
        return of(void 0);
      }),
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: () => this.router.navigate(['/profile']),
      error: (err) => {
        this.error = 'Failed to update profile. ' + (err.error?.error || 'Please try again.');
        console.error('Error updating profile:', err);
      }
    });
  }
}
