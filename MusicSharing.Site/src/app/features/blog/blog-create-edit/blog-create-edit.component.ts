import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BlogService } from '../../../core/services/blog.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog-create-edit',
  templateUrl: './blog-create-edit.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
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
        this.error = 'Failed to load blog post data';
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.blogForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.error = '';

    const blogData = this.blogForm.value;

    if (this.isEditMode && this.postId) {
      this.blogService.updatePost(this.postId, blogData).subscribe({
        next: () => {
          this.router.navigate(['/blog', this.postId]);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.error = 'Failed to update blog post';
          console.error(err);
        }
      });
    } else {
      this.blogService.createPost(blogData).subscribe({
        next: (post) => {
          this.router.navigate(['/blog', post.id]);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.error = 'Failed to create blog post';
          console.error(err);
        }
      });
    }
  }
}
