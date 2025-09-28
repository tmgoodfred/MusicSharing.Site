import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { UserService } from '../../core/services/user.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Component({
  selector: 'app-admin',
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  dashboard: any = null;
  loading = true;
  error = '';
  actionMessage = '';

  constructor(
    private adminService: AdminService,
    private router: Router,
    private userService: UserService,

  ) { }

  ngOnInit(): void {
    this.fetchDashboard();
  }

  fetchDashboard(): void {
    this.loading = true;
    this.adminService.getDashboard().subscribe({
      next: (data) => {
        // Unwrap $values arrays for template compatibility
        const dashboard = {
          users: data.users?.$values ?? [],
          songs: data.songs?.$values ?? [],
          comments: data.comments?.$values ?? [],
          blogs: data.blogPosts?.$values ?? [],
          activities: data.activities?.$values ?? []
        };

        // Collect all unique user IDs from songs and blogs
        const songUserIds = dashboard.songs
          .map((song: any) => song.userId)
          .filter((id: any): id is number => typeof id === 'number');
        const blogAuthorIds = dashboard.blogs
          .map((blog: any) => blog.authorId)
          .filter((id: any): id is number => typeof id === 'number');

        const allUserIds = Array.from(new Set([...songUserIds, ...blogAuthorIds]));

        if (allUserIds.length === 0) {
          this.dashboard = dashboard;
          this.loading = false;
          return;
        }

        // Fetch all users in parallel
        forkJoin(
          allUserIds.map(id =>
            this.userService.getUserById(id).pipe(
              catchError(() => of(null))
            )
          )
        ).subscribe(users => {
          const userMap = new Map<number, any>();
          users.forEach(user => {
            if (user) userMap.set(user.id, user);
          });

          // Attach uploaderUsername to each song
          dashboard.songs.forEach((song: any) => {
            const uploader = userMap.get(song.userId);
            song.uploaderUsername = uploader ? uploader.username : '-';
            song.user = uploader;
          });

          // Attach authorUsername to each blog
          dashboard.blogs.forEach((blog: any) => {
            const author = userMap.get(blog.authorId);
            blog.author = author;
          });

          this.dashboard = dashboard;
          this.loading = false;
        });
      },
      error: (err) => {
        this.error = 'Failed to load admin dashboard.';
        this.loading = false;
      }
    });
  }

  viewUser(user: any) {
    this.router.navigate(['/profile', user.id]);
  }
  viewSong(song: any) {
    this.router.navigate(['/songs', song.id]);
  }
  viewBlog(blog: any) {
    this.router.navigate(['/blog', blog.id]);
  }

  deleteUser(user: any) {
    if (!confirm('Delete this user?')) return;
    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.actionMessage = 'User deleted.';
        this.fetchDashboard();
      },
      error: () => { this.actionMessage = 'Failed to delete user.'; }
    });
  }
  deleteSong(song: any) {
    if (!confirm('Delete this song?')) return;
    this.adminService.deleteSong(song.id).subscribe({
      next: () => {
        this.actionMessage = 'Song deleted.';
        this.fetchDashboard();
      },
      error: () => { this.actionMessage = 'Failed to delete song.'; }
    });
  }
  deleteComment(comment: any) {
    if (!confirm('Delete this comment?')) return;
    this.adminService.deleteComment(comment.id).subscribe({
      next: () => {
        this.actionMessage = 'Comment deleted.';
        this.fetchDashboard();
      },
      error: () => { this.actionMessage = 'Failed to delete comment.'; }
    });
  }
  deleteBlog(blog: any) {
    if (!confirm('Delete this blog post?')) return;
    this.adminService.deleteBlog(blog.id).subscribe({
      next: () => {
        this.actionMessage = 'Blog post deleted.';
        this.fetchDashboard();
      },
      error: () => { this.actionMessage = 'Failed to delete blog post.'; }
    });
  }
  promoteUser(user: any) {
    if (!confirm('Promote this user to admin?')) return;
    this.adminService.promoteUserToAdmin(user.id).subscribe({
      next: () => {
        this.actionMessage = 'User promoted to admin.';
        this.fetchDashboard();
      },
      error: () => { this.actionMessage = 'Failed to promote user.'; }
    });
  }

  // Helper to display user or 'Anonymous' for comments
  getCommentUserDisplay(comment: any): string {
    if (comment.isAnonymous) return 'Anonymous';
    return comment.user?.username || '-';
  }
}
