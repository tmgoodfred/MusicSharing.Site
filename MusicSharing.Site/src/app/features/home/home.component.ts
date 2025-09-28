import { Component, OnInit } from '@angular/core';
import { Activity, User } from '../../core/models/models';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { SongService } from '../../core/services/song.service';
import { forkJoin } from 'rxjs';

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
  showAllActivities = false;
  isFollowingAnyone = false;

  commentTexts: Record<number, string> = {};
  private userById: Record<number, User> = {};

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private songService: SongService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.userService.getUserFollowing(user.id).subscribe(following => {
          this.isFollowingAnyone = following && following.length > 0;
        });
      } else {
        this.isFollowingAnyone = false;
      }
      this.loadActivityFeed();
    });
  }

  getProfilePictureUrl(userId: number): string {
    return this.userService.getProfilePictureUrl(userId);
  }

  // Helper method for safe access to username's first character
  getUserInitial(username: string | undefined): string {
    return username ? username.charAt(0) : '?';
  }

  formatActivityType(activity: Activity): string {
    if (activity.type === 'Comment') {
      const parsed = this.parseCommentActivityData(activity.data);
      if (parsed?.kind === 'blog') {
        return 'commented on a blog post';
      }
      // Default to song if not blog
      return 'commented on a song';
    }
    switch (activity.type) {
      case 'Upload':
        return 'uploaded a new song';
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

  toggleActivityFeed(): void {
    this.showAllActivities = !this.showAllActivities;
    this.loadActivityFeed();
  }

  loadActivityFeed(): void {
    const userId = this.currentUser ? this.currentUser.id : 5;
    if (this.showAllActivities) {
      this.userService.getAllActivities().subscribe({
        next: (allActivities) => {
          this.activities = allActivities;
          this.hydrateActivityUsers(this.activities);
          this.hydrateCommentTexts(this.activities);
        },
        error: () => {
          this.activities = [];
        }
      });
    } else {
      this.userService.getActivityFeed(userId).subscribe({
        next: (activities) => {
          // Filter out anonymous comments
          this.activities = activities.filter(a =>
            !(a.type === 'Comment' && this.isAnonymousComment(a))
          );
          this.hydrateActivityUsers(this.activities);
          this.hydrateCommentTexts(this.activities);
        },
        error: () => {
          this.activities = [];
        }
      });
    }
  }

  // Attach user objects to activities based on userId
  private hydrateActivityUsers(activities: Activity[]): void {
    const missingIds = Array.from(
      new Set(
        activities
          .map(a => a.userId)
          .filter((id): id is number => typeof id === 'number' && !this.userById[id])
      )
    );

    if (missingIds.length === 0) {
      // No missing users; still attach from cache if available
      activities.forEach(a => {
        if (a.userId && this.userById[a.userId]) a.user = this.userById[a.userId];
      });
      return;
    }

    forkJoin(missingIds.map(id => this.userService.getUserById(id))).subscribe({
      next: (users) => {
        users.forEach(u => (this.userById[u.id] = u));
        activities.forEach(a => {
          if (a.userId && this.userById[a.userId]) a.user = this.userById[a.userId];
        });
      },
      error: () => {
        // If user fetch fails, leave names/avatars blank; UI will show fallbacks
      }
    });
  }

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

  private hydrateCommentTexts(activities: Activity[]): void {
    activities.forEach(a => {
      if (a.type !== 'Comment' || !a.data) return;
      const parsed = this.parseCommentActivityData(a.data);
      if (!parsed) return;

      if (parsed.kind === 'song' && parsed.songId && parsed.commentId) {
        this.songService.getSongCommentById(parsed.songId, parsed.commentId).subscribe({
          next: c => {
            this.commentTexts[a.id] = c.commentText;

            // Store anonymity info in the activity data if not already present
            if (a.data && typeof a.data === 'string') {
              try {
                const dataObj = JSON.parse(a.data);
                if (!('isAnonymous' in dataObj) && !('IsAnonymous' in dataObj)) {
                  dataObj.isAnonymous = c.isAnonymous;
                  a.data = JSON.stringify(dataObj);
                }
              } catch (e) {
                // If parsing fails, just leave as is
              }
            }
          },
          error: () => this.commentTexts[a.id] = ''
        });
      } else if (parsed.kind === 'blog' && parsed.blogPostId && parsed.commentId) {
        this.songService.getBlogCommentById(parsed.blogPostId, parsed.commentId).subscribe({
          next: c => {
            this.commentTexts[a.id] = c.commentText;

            // Store anonymity info in the activity data if not already present
            if (a.data && typeof a.data === 'string') {
              try {
                const dataObj = JSON.parse(a.data);
                if (!('isAnonymous' in dataObj) && !('IsAnonymous' in dataObj)) {
                  dataObj.isAnonymous = c.isAnonymous;
                  a.data = JSON.stringify(dataObj);
                }
              } catch (e) {
                // If parsing fails, just leave as is
              }
            }
          },
          error: () => this.commentTexts[a.id] = ''
        });
      }
    });
  }

  // Build a router link and title for the target resource (song/blog) if present
  getTargetInfo(activity: Activity): { link: any[]; title?: string; kind: 'song' | 'blog' } | null {
    const obj = this.parseActivityData(activity.data);
    const title = obj?.title ?? obj?.Title;

    const toNum = (v: any) => (v === undefined || v === null || v === '') ? undefined : Number(v);
    const songId = toNum(obj?.songId ?? obj?.SongId ?? obj?.targetId ?? obj?.TargetId);
    const blogPostId = toNum(obj?.blogPostId ?? obj?.BlogPostId ?? obj?.postId ?? obj?.PostId ?? obj?.id ?? obj?.Id);
    const typeFromObj = (obj?.type ?? obj?.Type)?.toString().toLowerCase();

    if ((activity.type === 'Upload' || activity.type === 'Rating') && songId) {
      return { link: ['/songs', songId], title, kind: 'song' };
    }

    if (activity.type === 'Comment') {
      const parsed = this.parseCommentActivityData(activity.data);
      if (parsed?.kind === 'song' && parsed.songId) {
        return { link: ['/songs', parsed.songId], title, kind: 'song' };
      }
      if (parsed?.kind === 'blog' && parsed.blogPostId) {
        return { link: ['/blog', parsed.blogPostId], title, kind: 'blog' };
      }
    }

    // Add support for direct blog post activity (e.g., 'BlogPost', 'Post', 'Blog')
    if ((activity.type?.toLowerCase?.() === 'blogpost' || activity.type?.toLowerCase?.() === 'post' || activity.type?.toLowerCase?.() === 'blog') && blogPostId) {
      return { link: ['/blog', blogPostId], title, kind: 'blog' };
    }

    if (typeFromObj === 'song' && songId) return { link: ['/songs', songId], title, kind: 'song' };
    if (typeFromObj === 'blog' && blogPostId) return { link: ['/blog', blogPostId], title, kind: 'blog' };

    return null;
  }

  isAnonymousComment(activity: Activity): boolean {
    if (activity.type !== 'Comment') return false;

    const obj = this.parseActivityData(activity.data);
    return obj?.isAnonymous === true || obj?.IsAnonymous === true;
  }

  getCommentAuthorDisplayName(activity: Activity): string {
    if (this.isAnonymousComment(activity)) {
      return 'Anonymous';
    }
    return activity.user?.username || 'Unknown user';
  }
}
