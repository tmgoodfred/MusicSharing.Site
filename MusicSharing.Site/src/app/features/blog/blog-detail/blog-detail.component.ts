import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BlogService } from '../../../core/services/blog.service';
import { AuthService } from '../../../core/services/auth.service';
import { BlogPost, User, UserRole, Comment as AppComment } from '../../../core/models/models';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


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

  // Comments
  comments: AppComment[] = [];
  commentForm: FormGroup;
  isSubmittingComment = false;
  commentError = '';
  bannedWords: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private authService: AuthService,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      commentText: ['', [Validators.required, Validators.minLength(2)]],
      isAnonymous: [false]
    });
  }

  ngOnInit(): void {
    this.http.get<string[]>('/assets/bannedWords.json').subscribe(words => {
      this.bannedWords = words;
    });
    this.loadBlogPost();
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = this.isAdminRole(user?.role);
    });
  }

  private isAdminRole(role: string | number | null | undefined): boolean {
    if (role == null) return false;
    if (typeof role === 'string') return role.toLowerCase() === 'admin';
    return role === UserRole.Admin || role === 1;
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
        this.loadComments();
      },
      error: (err) => {
        this.error = 'Failed to load blog post. It may have been removed or you don\'t have permission to view it.';
        this.isLoading = false;
        console.error('Error loading blog post:', err);
      }
    });
  }

  loadComments(): void {
    if (!this.blogPost) return;
    this.blogService.getBlogComments(this.blogPost.id).subscribe({
      next: (comments: AppComment[]) => {
        this.comments = comments;
      }
    });
  }
  getCommentAuthor(comment: AppComment): string {
    if (comment.isAnonymous) return 'Anonymous';
    return comment.user?.username || 'Unknown';
  }

  containsBannedWords(text: string): boolean {
    const lower = text.toLowerCase();
    return this.bannedWords.some(word => lower.includes(word));
  }

  submitComment(): void {
    if (this.commentForm.invalid || !this.blogPost || this.isSubmittingComment) return;

    const commentText = this.commentForm.value.commentText;
    if (this.containsBannedWords(commentText)) {
      this.commentError = 'Your comment contains inappropriate language.';
      return;
    }
    this.commentError = '';
    this.isSubmittingComment = true;

    const comment = {
      blogPostId: this.blogPost.id,
      commentText,
      isAnonymous: this.currentUser ? this.commentForm.value.isAnonymous : true,
      userId: this.currentUser ? this.currentUser.id : null
    };

    this.blogService.addBlogComment(comment).subscribe({
      next: () => {
        this.loadComments();
        this.commentForm.reset({
          commentText: '',
          isAnonymous: this.currentUser ? false : true
        });
        this.isSubmittingComment = false;
      },
      error: () => {
        this.isSubmittingComment = false;
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

  // NEW: permissions + delete for comments
  canDeleteComment(comment: AppComment): boolean {
    if (!this.currentUser) return false;
    const ownerId = (comment as any).userId ?? comment.user?.id;
    return this.isAdmin || ownerId === this.currentUser.id;
  }

  deleteComment(comment: AppComment): void {
    if (!this.currentUser) return;
    if (!confirm('Delete this comment?')) return;

    this.blogService.deleteComment(comment.id, this.currentUser.id, this.isAdmin).subscribe({
      next: () => this.loadComments(),
      error: (err) => {
        console.error('Failed to delete comment:', err);
        alert('Failed to delete comment. You may not have permission.');
      }
    });
  }

  canEditOrDeletePost(): boolean {
    if (!this.currentUser || !this.blogPost) return false;
    const isAuthor = this.blogPost.authorId === this.currentUser.id || this.blogPost.author?.id === this.currentUser.id;
    return this.isAdmin || isAuthor;
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
