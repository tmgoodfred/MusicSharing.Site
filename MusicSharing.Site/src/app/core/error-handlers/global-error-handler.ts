import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from '../services/error.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  constructor(
    private errorService: ErrorService,
    private zone: NgZone
  ) { }

  handleError(error: Error | HttpErrorResponse): void {
    // Use NgZone to ensure Angular's change detection is triggered
    this.zone.run(() => {
      this.errorService.handleError(error);
    });
  }
}
