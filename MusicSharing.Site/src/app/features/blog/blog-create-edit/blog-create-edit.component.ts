import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BlogService } from '../../../core/services/blog.service';
import { BlogPost } from '../../../core/models/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog-create-edit',
  templateUrl: './blog-create-edit.component.html',
  styleUrls: ['./blog-create-edit.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class BlogCreateEditComponent implements OnInit {
  blogForm: FormGroup;
  isSubmitting = false;
  error = '';
  isEditMode = false;
  postId?: number;

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      content: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.postId = parseInt(id);
      this.loadBlogPost(this.postId);
    }
  }

  loadBlogPost(id: number): void {
    this.blogService.getPostById(id).subscribe({
      next: (post) => {
        this.blogForm.patchValue({
          title: post.title,
          content: post.content
        });
      },
      error: (err) => {
        this.error = 'Failed to load blog post for editing.';
        console.error('Error loading blog post:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.blogForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.error = '';

    const blogPostData: Partial<BlogPost> = {
      title: this.blogForm.value.title,
      content: this.blogForm.value.content
    };

    const request = this.isEditMode && this.postId
      ? this.blogService.updatePost(this.postId, blogPostData)
      : this.blogService.createPost(blogPostData);

    request.subscribe({
      next: (post) => {
        this.router.navigate(['/blog', post.id]);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.error = this.isEditMode
          ? 'Failed to update blog post. Please try again.'
          : 'Failed to create blog post. Please try again.';
        console.error('Error submitting blog post:', err);
      }
    });
  }
}
