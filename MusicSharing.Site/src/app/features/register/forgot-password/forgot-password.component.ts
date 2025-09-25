import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  form: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.form = this.fb.group({
      usernameOrEmail: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const { usernameOrEmail } = this.form.value;
    this.userService.forgotPassword(usernameOrEmail!).subscribe({
      next: () => this.submitted = true,
      error: () => this.submitted = true // generic message regardless
    });
  }
}
