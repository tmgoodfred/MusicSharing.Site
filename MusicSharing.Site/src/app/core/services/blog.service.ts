import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BlogPost, Comment as AppComment } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = 'http://192.168.1.217:5000/api/blog';
  private commentApiUrl = 'http://192.168.1.217:5000/api/comment';

  constructor(private http: HttpClient) { }

  getAllPosts(): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(this.apiUrl);
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

  // Use app Comment model to avoid DOM Comment conflict
  getBlogComments(blogId: number): Observable<AppComment[]> {
    return this.http.get<AppComment[]>(`${this.commentApiUrl}/blog/${blogId}`);
  }

  addBlogComment(comment: { blogPostId: number; commentText: string; isAnonymous: boolean; userId: number }): Observable<AppComment> {
    return this.http.post<AppComment>(`${this.commentApiUrl}`, comment);
  }
}
