import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { BlogPost, Comment as AppComment } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = 'http://192.168.1.217:5000/api/blog';
  private commentApiUrl = 'http://192.168.1.217:5000/api/comment';

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

  addBlogComment(comment: { blogPostId: number; commentText: string; isAnonymous: boolean; userId: number }): Observable<AppComment> {
    return this.http.post<AppComment>(`${this.commentApiUrl}`, comment);
  }
}
