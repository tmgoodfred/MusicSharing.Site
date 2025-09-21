import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BlogService } from '../../../core/services/blog.service';
import { AuthService } from '../../../core/services/auth.service';
import { BlogPost, User, UserRole } from '../../../core/models/models';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class BlogDetailComponent implements OnInit {
  blogPost: BlogPost | null = null;
  isLoading = true;
  error = '';
  currentUser: User | null = null;
  isAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadBlogPost();
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = user?.role === UserRole.Admin;
    });
  }

  loadBlogPost(): void {
    const postId = this.route.snapshot.paramMap.get('id');
    if (!postId) {
      this.error = 'Blog post ID not found';
      this.isLoading = false;
      return;
    }

    this.blogService.getPostById(parseInt(postId)).subscribe({
      next: (post) => {
        this.blogPost = post;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load blog post. It may have been removed or you don\'t have permission to view it.';
        this.isLoading = false;
        console.error('Error loading blog post:', err);
      }
    });
  }

  deletePost(): void {
    if (!this.blogPost || !confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    this.blogService.deletePost(this.blogPost.id).subscribe({
      next: () => {
        this.router.navigate(['/blog']);
      },
      error: (err) => {
        console.error('Error deleting blog post:', err);
        alert('Failed to delete blog post. Please try again.');
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
