import { Component, OnInit } from '@angular/core';
import { Activity } from '../../core/models/models';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class HomeComponent implements OnInit {
  activities: Activity[] = [];

  constructor() { }

  ngOnInit(): void {
    // This will be replaced with an API call later
    this.loadDummyActivities();
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

  private loadDummyActivities(): void {
    // Just for initial UI development
    this.activities = [
      {
        id: 1,
        userId: 1,
        type: 'Upload',
        data: JSON.stringify({ songId: 1, songTitle: 'My First Song' }),
        createdAt: new Date().toISOString(),
        user: { id: 1, username: 'user1', email: 'user1@example.com', role: 0, createdAt: new Date().toISOString() }
      },
      {
        id: 2,
        userId: 2,
        type: 'Comment',
        data: JSON.stringify({ songId: 1, commentText: 'Great song!' }),
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        user: { id: 2, username: 'user2', email: 'user2@example.com', role: 0, createdAt: new Date().toISOString() }
      }
    ];
  }
}
