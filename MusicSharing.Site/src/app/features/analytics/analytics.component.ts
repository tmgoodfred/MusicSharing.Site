import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { Analytics } from '../../core/models/models';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AnalyticsComponent implements OnInit {
  analytics?: Analytics;
  isLoading = true;
  error = '';

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    const userId = Number(localStorage.getItem('userId'));
    if (!userId) {
      this.isLoading = false;
      this.error = 'You must be logged in to view analytics.';
      return;
    }

    this.userService.getUserAnalytics(userId).subscribe({
      next: data => {
        this.analytics = data;
        this.isLoading = false;
      },
      error: err => {
        console.error('Failed to load analytics', err);
        this.error = 'Failed to load analytics. Please try again later.';
        this.isLoading = false;
      }
    });
  }
}
