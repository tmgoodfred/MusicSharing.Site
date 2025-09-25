import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  token = '';
  form: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(private route: ActivatedRoute, private router: Router, fb: FormBuilder, private userService: UserService) {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    this.form = fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.matchValidator() });
  }

  private matchValidator(): ValidatorFn {
    return (group: AbstractControl) => {
      const p = group.get('password')?.value;
      const c = group.get('confirmPassword')?.value;
      return p === c ? null : { mismatch: true };
    };
  }

  onSubmit(): void {
    if (!this.token || this.form.invalid || this.isSubmitting) return;
    this.isSubmitting = true;
    this.errorMessage = '';

    this.userService.resetPassword(this.token, this.form.value.password).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/auth/login'], { queryParams: { reset: 1 } });
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error || err?.error?.error || 'Invalid or expired token.';
      }
    });
  }
}
