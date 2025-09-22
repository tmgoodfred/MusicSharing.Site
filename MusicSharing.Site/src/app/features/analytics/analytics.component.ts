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

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    const userId = Number(localStorage.getItem('userId'));
    if (userId) {
      this.userService.getUserAnalytics(userId).subscribe(data => {
        this.analytics = data;
      });
    }
  }
}
