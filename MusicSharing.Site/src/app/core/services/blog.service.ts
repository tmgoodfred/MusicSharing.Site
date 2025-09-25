import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { BlogPost, Comment as AppComment } from '../models/models';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = 'https://api.music-sharing.online/api/blog';
  private commentApiUrl = 'https://api.music-sharing.online/api/comment';

  constructor(private http: HttpClient) { }

  private unwrapArray<T>(value: any): T[] {
    if (!value) return [];
    if (Array.isArray(value)) return value as T[];
    if (value.$values) return value.$values as T[];
    return value as T[];
  }

  getAllPosts(): Observable<BlogPost[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => this.unwrapArray<BlogPost>(res))
    );
  }

  getPostById(id: number): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.apiUrl}/${id}`);
  }

  createPost(post: Partial<BlogPost>): Observable<BlogPost> {
    return this.http.post<BlogPost>(this.apiUrl, post);
  }

  updatePost(id: number, post: Partial<BlogPost>): Observable<BlogPost> {
    return this.http.put<BlogPost>(`${this.apiUrl}/${id}`, post);
  }

  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getBlogComments(blogId: number): Observable<AppComment[]> {
    return this.http.get<any>(`${this.commentApiUrl}/blog/${blogId}`).pipe(
      map(res => this.unwrapArray<AppComment>(res))
    );
  }

  addBlogComment(comment: { blogPostId: number; commentText: string; isAnonymous: boolean; userId: number | null }): Observable<AppComment> {
    return this.http.post<AppComment>(`${this.commentApiUrl}`, comment);
  }

  // NEW: delete a comment by id with userId/isAdmin authorization
  deleteComment(commentId: number, userId: number, isAdmin: boolean): Observable<any> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('isAdmin', String(isAdmin));
    return this.http.delete(`${this.commentApiUrl}/${commentId}`, { params });
  }
}
