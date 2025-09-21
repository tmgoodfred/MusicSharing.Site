import { Component, OnInit } from '@angular/core';
import { Activity } from '../../core/models/models';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class HomeComponent implements OnInit {
  activities: Activity[] = [];
  currentUser: User | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.loadActivityFeed();
    });
  }

  // Helper method for safe access to username's first character
  getUserInitial(username: string | undefined): string {
    return username ? username.charAt(0) : '?';
  }

  formatActivityType(activity: Activity): string {
    switch (activity.type) {
      case 'Upload':
        return 'uploaded a new song';
      case 'Comment':
        return 'commented on a song';
      case 'Rating':
        return 'rated a song';
      default:
        return activity.type;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  }

  loadActivityFeed(): void {
    const userId = this.currentUser ? this.currentUser.id : 5;
    this.userService.getActivityFeed(userId).subscribe({
      next: (activities) => {
        this.activities = activities;
      },
      error: () => {
        this.activities = [];
      }
    });
  }

}
