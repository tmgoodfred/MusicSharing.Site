import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { PlayerService } from '../../core/services/player.service';
import { SongService } from '../../core/services/song.service';
import { ImageService } from '../../core/services/image.service';
import { FollowerService } from '../../core/services/follower.service';
import { User, Song, Activity, Rating, Analytics } from '../../core/models/models';
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
  analytics: Analytics | null = null;
  followers: User[] = [];
  following: User[] = [];
  isFollowing = false;
  activeTab = 'songs';

  // Map of activityId -> resolved comment text
  commentTexts: Record<number, string> = {};

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private playerService: PlayerService,
    private songService: SongService,
    private followerService: FollowerService,
    private imageService: ImageService
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
          const id = parseInt(userId, 10);
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
          this.analytics = data.analytics;
          this.followers = data.followers;
          this.following = data.following;
          this.isFollowing = data.isFollowing;

          this.hydrateCommentTexts(this.activities);
        }
        if (!this.isOwnProfile && this.activeTab === 'analytics') {
          this.activeTab = 'songs';
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

  getArtworkUrl(songId: number): string {
    return this.songService.getArtworkUrl(songId);
  }

  getProfilePictureUrl(userId: number): string {
    return this.userService.getProfilePictureUrl(userId);
  }

  loadUserData(userId: number) {
    return forkJoin({
      user: this.userService.getUserById(userId),
      songs: this.userService.getUserSongs(userId).pipe(catchError(() => of([]))),
      activities: this.userService.getUserActivity(userId).pipe(catchError(() => of([]))),
      analytics: this.isOwnProfile
        ? this.userService.getUserAnalytics(userId).pipe(catchError(() => of(null)))
        : of(null),
      followers: this.followerService.getFollowers(userId).pipe(catchError(() => of([]))),
      following: this.followerService.getFollowing(userId).pipe(catchError(() => of([]))),
      isFollowing: (this.currentUser && !this.isOwnProfile)
        ? this.followerService.isFollowing(this.currentUser.id, userId).pipe(catchError(() => of(false)))
        : of(false)
    });
  }

  // Robustly parse activity.data (handles double-encoded JSON and PascalCase keys)
  private parseActivityData(data: any): any | null {
    if (data == null) return null;

    let raw: any = data;

    for (let i = 0; i < 2; i++) {
      if (typeof raw === 'string') {
        const trimmed = raw.trim();

        if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
          (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
          raw = trimmed.slice(1, -1);
        }

        if (typeof raw === 'string') {
          raw = raw.replace(/\\"/g, '"').replace(/\\'/g, "'");
        }

        try {
          raw = JSON.parse(raw);
        } catch {
          break;
        }
      }
    }

    return raw;
  }

  private parseCommentActivityData(data: any): { kind: 'song' | 'blog', songId?: number, blogPostId?: number, commentId?: number } | null {
    const obj = this.parseActivityData(data);
    if (!obj || typeof obj !== 'object') return null;

    const toNum = (v: any) => (v === undefined || v === null || v === '') ? undefined : Number(v);

    const songId = toNum(obj.songId ?? obj.SongId ?? obj.targetId ?? obj.TargetId);
    const blogPostId = toNum(obj.blogPostId ?? obj.BlogPostId);
    const commentId = toNum(obj.commentId ?? obj.CommentId);
    const kind: 'song' | 'blog' | undefined =
      (obj.type ?? obj.Type)?.toString().toLowerCase() === 'blog' ? 'blog'
        : (obj.type ?? obj.Type)?.toString().toLowerCase() === 'song' ? 'song'
          : (songId ? 'song' : blogPostId ? 'blog' : undefined);

    if (!commentId) return null;
    if (kind === 'song' && songId) return { kind: 'song', songId, commentId };
    if (kind === 'blog' && blogPostId) return { kind: 'blog', blogPostId, commentId };
    return null;
  }

  getActivityTitle(activity: Activity): string {
    const obj = this.parseActivityData(activity.data);
    const title = obj?.title ?? obj?.Title;
    return typeof title === 'string' ? title : '';
  }

  private hydrateCommentTexts(activities: Activity[]): void {
    activities.forEach(a => {
      if (a.type !== 'Comment' || !a.data) return;
      const parsed = this.parseCommentActivityData(a.data);
      if (!parsed) return;

      if (parsed.kind === 'song' && parsed.songId && parsed.commentId) {
        this.songService.getSongCommentById(parsed.songId, parsed.commentId).subscribe({
          next: c => this.commentTexts[a.id] = c.commentText,
          error: () => this.commentTexts[a.id] = ''
        });
      } else if (parsed.kind === 'blog' && parsed.blogPostId && parsed.commentId) {
        this.songService.getBlogCommentById(parsed.blogPostId, parsed.commentId).subscribe({
          next: c => this.commentTexts[a.id] = c.commentText,
          error: () => this.commentTexts[a.id] = ''
        });
      }
    });
  }

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
    if (tab === 'analytics' && !this.isOwnProfile) {
      this.activeTab = 'songs';
      return;
    }
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
    const me = this.currentUser;
    const target = this.profileUser;
    if (!me || !target) return;

    this.followerService.follow(me.id, target.id).subscribe({
      next: () => {
        this.isFollowing = true;
        if (!this.followers.some(f => f.id === me.id)) {
          this.followers = [...this.followers, me]; // me is User (non-null)
        }
      },
      error: (err) => console.error('Error following user:', err)
    });
  }

  unfollowUser(): void {
    const me = this.currentUser;
    const target = this.profileUser;
    if (!me || !target) return;

    this.followerService.unfollow(me.id, target.id).subscribe({
      next: () => {
        this.isFollowing = false;
        this.followers = this.followers.filter(f => f.id !== me.id);
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
