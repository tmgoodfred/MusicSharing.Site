import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export interface AppError {
  message: string;
  status?: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorSubject = new BehaviorSubject<AppError | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor() { }

  handleError(error: Error | HttpErrorResponse): void {
    let errorMessage: string;
    let statusCode: number | undefined;

    if (error instanceof HttpErrorResponse) {
      // Server or connection error
      statusCode = error.status;
      errorMessage = error.error?.message || error.message || 'Server error occurred';
    } else {
      // Client-side error
      errorMessage = error.message || 'An unexpected error occurred';
    }

    this.errorSubject.next({
      message: errorMessage,
      status: statusCode,
      timestamp: new Date()
    });

    // Log error for debugging
    console.error('Application error:', error);
  }

  clearError(): void {
    this.errorSubject.next(null);
  }
}
