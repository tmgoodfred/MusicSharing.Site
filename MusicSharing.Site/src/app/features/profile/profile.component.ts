import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { PlayerService } from '../../core/services/player.service';
import { User, Song, Activity, UserRole, Rating } from '../../core/models/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ProfileComponent implements OnInit {
  profileUser: User | null = null;
  currentUser: User | null = null;
  isOwnProfile = false;
  isLoading = true;
  error = '';
  songs: Song[] = [];
  activities: Activity[] = [];
  followers: User[] = [];
  following: User[] = [];
  isFollowing = false;
  activeTab = 'songs'; // 'songs', 'activity', 'followers', 'following'

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private playerService: PlayerService
  ) { }

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Load profile data
    this.route.paramMap.pipe(
      switchMap(params => {
        const userId = params.get('id');

        // If no ID provided, show current user's profile
        if (!userId && this.currentUser) {
          this.isOwnProfile = true;
          return this.loadUserData(this.currentUser.id);
        }
        // Otherwise load the requested user's profile
        else if (userId) {
          const id = parseInt(userId);
          this.isOwnProfile = this.currentUser?.id === id;
          return this.loadUserData(id);
        }

        // Fallback if there's no current user or ID
        return of(null);
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          this.profileUser = data.user;
          this.songs = data.songs;
          this.activities = data.activities;
          this.followers = data.followers;
          this.following = data.following;
          this.isFollowing = data.isFollowing;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load profile. User may not exist or you may not have permission to view it.';
        this.isLoading = false;
        console.error('Error loading profile:', err);
      }
    });
  }

  calculateAverageRating(ratings: Rating[] | undefined): string {
    if (!ratings || ratings.length === 0) {
      return 'No ratings';
    }

    const sum = ratings.reduce((acc, rating) => acc + rating.ratingValue, 0);
    const average = sum / ratings.length;
    return average.toFixed(1);
  }

  loadUserData(userId: number) {
    return forkJoin({
      user: this.userService.getUserById(userId),
      songs: this.userService.getUserSongs(userId).pipe(catchError(() => of([]))),
      activities: this.userService.getUserActivity(userId).pipe(catchError(() => of([]))),
      followers: this.userService.getUserFollowers(userId).pipe(catchError(() => of([]))),
      following: this.userService.getUserFollowing(userId).pipe(catchError(() => of([]))),
      isFollowing: this.currentUser
        ? this.userService.isFollowing(userId).pipe(catchError(() => of(false)))
        : of(false)
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  playSong(song: Song): void {
    this.playerService.play(song);
  }

  addToQueue(song: Song, event: Event): void {
    event.stopPropagation();
    this.playerService.addToQueue(song);
  }

  followUser(): void {
    if (!this.currentUser || !this.profileUser) return;

    this.userService.followUser(this.profileUser.id).subscribe({
      next: () => {
        this.isFollowing = true;
        // Add current user to followers
        if (this.currentUser) {
          this.followers = [...this.followers, this.currentUser];
        }
      },
      error: (err) => console.error('Error following user:', err)
    });
  }

  unfollowUser(): void {
    if (!this.currentUser || !this.profileUser) return;

    this.userService.unfollowUser(this.profileUser.id).subscribe({
      next: () => {
        this.isFollowing = false;
        // Remove current user from followers
        if (this.currentUser) {
          this.followers = this.followers.filter(f => f.id !== this.currentUser?.id);
        }
      },
      error: (err) => console.error('Error unfollowing user:', err)
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  formatActivityType(activity: Activity): string {
    switch (activity.type) {
      case 'Upload':
        return 'uploaded a song';
      case 'Comment':
        return 'commented on a song';
      case 'Rating':
        return 'rated a song';
      case 'Follow':
        return 'followed a user';
      default:
        return activity.type;
    }
  }
}
