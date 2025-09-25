import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  infoMessage = '';

  // When login fails with 403, allow "Resend verification"
  pendingVerification = false;
  enteredIdentifier = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      if (params.has('verified')) {
        this.infoMessage = 'Email verified. You can log in now.';
      } else if (params.has('registered')) {
        this.infoMessage = 'We sent a verification email. Please verify before logging in.';
      } else if (params.has('reset')) {
        this.infoMessage = 'Password reset successfully. Please log in.';
      } else {
        this.infoMessage = '';
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.infoMessage = '';
    this.pendingVerification = false;

    const { usernameOrEmail, password } = this.loginForm.value;
    this.enteredIdentifier = usernameOrEmail;

    this.authService.login(usernameOrEmail, password).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isSubmitting = false;
        if (error?.status === 403) {
          this.errorMessage = 'Verify your email before you can login.';
          this.pendingVerification = true;
        } else {
          this.errorMessage = error?.error || error?.error?.error || 'Login failed. Please check your credentials.';
        }
      }
    });
  }

  resendVerification(): void {
    if (!this.enteredIdentifier) return;
    this.userService.requestEmailVerification(this.enteredIdentifier).subscribe({
      next: () => {
        this.infoMessage = 'If the account requires verification, an email has been sent.';
      },
      error: () => {
        this.infoMessage = 'If the account requires verification, an email has been sent.';
      }
    });
  }
}
