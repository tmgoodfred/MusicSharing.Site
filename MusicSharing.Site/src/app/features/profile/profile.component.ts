import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { PlayerService } from '../../core/services/player.service';
import { User, Song, Activity, Rating } from '../../core/models/models';
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
  activeTab = 'songs';

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private playerService: PlayerService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.route.paramMap.pipe(
      switchMap(params => {
        const userId = params.get('id');
        if (!userId && this.currentUser) {
          this.isOwnProfile = true;
          return this.loadUserData(this.currentUser.id);
        } else if (userId) {
          const id = parseInt(userId);
          this.isOwnProfile = this.currentUser?.id === id;
          return this.loadUserData(id);
        }
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

  // Defensive: handle both plain arrays and $values-wrapped collections
  calculateAverageRating(ratings: Rating[] | any): string {
    const list: Rating[] = Array.isArray(ratings) ? ratings : (ratings?.$values ?? []);
    if (!list || list.length === 0) {
      return 'No ratings';
    }
    const sum = list.reduce((acc, r) => acc + (r?.ratingValue ?? 0), 0);
    const average = sum / list.length;
    return average.toFixed(1);
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
      case 'Upload': return 'uploaded a song';
      case 'Comment': return 'commented on a song';
      case 'Rating': return 'rated a song';
      case 'Follow': return 'followed a user';
      default: return activity.type;
    }
  }
}
