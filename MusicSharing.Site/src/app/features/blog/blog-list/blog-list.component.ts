import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../../core/services/blog.service';
import { AuthService } from '../../../core/services/auth.service';
import { BlogPost, User, UserRole } from '../../../core/models/models';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class BlogListComponent implements OnInit {
  blogPosts: BlogPost[] = [];
  isLoading = true;
  error = '';
  currentUser: User | null = null;
  isAdmin = false;

  constructor(
    private blogService: BlogService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadBlogPosts();
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = user?.role === UserRole.Admin;
    });
  }

  loadBlogPosts(): void {
    this.isLoading = true;
    this.blogService.getAllPosts().subscribe({
      next: (posts) => {
        this.blogPosts = posts;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load blog posts. Please try again.';
        this.isLoading = false;
        console.error('Error loading blog posts:', err);
      }
    });
  }

  deletePost(id: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    this.blogService.deletePost(id).subscribe({
      next: () => {
        this.blogPosts = this.blogPosts.filter(post => post.id !== id);
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

  truncateContent(content: string, maxLength: number = 200): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }
}
