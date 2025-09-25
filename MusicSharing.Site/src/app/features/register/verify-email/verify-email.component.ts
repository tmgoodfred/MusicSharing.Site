import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  status: 'idle' | 'verifying' | 'success' | 'error' = 'idle';
  message = '';

  constructor(private route: ActivatedRoute, private router: Router, private userService: UserService) { }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!token) {
      this.status = 'error';
      this.message = 'Missing token.';
      return;
    }

    this.status = 'verifying';
    this.userService.verifyEmail(token).subscribe({
      next: () => {
        this.status = 'success';
        this.message = 'Email verified. Redirecting to login...';
        setTimeout(() => this.router.navigate(['/auth/login'], { queryParams: { verified: 1 } }), 1200);
      },
      error: () => {
        this.status = 'error';
        this.message = 'Verification link is invalid or expired.';
      }
    });
  }
}
