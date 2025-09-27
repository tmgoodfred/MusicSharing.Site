import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  dashboard: any = null;
  loading = true;
  error = '';
  actionMessage = '';

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit(): void {
    this.fetchDashboard();
  }

  fetchDashboard(): void {
    this.loading = true;
    this.adminService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.loading = false;
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
}
