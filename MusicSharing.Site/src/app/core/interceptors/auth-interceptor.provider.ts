import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Provider } from '@angular/core';
import { Router } from '@angular/router';
import { AuthInterceptor } from './auth.interceptor';
import { TokenStorageService } from '../services/token-storage.service';

export const authInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  useFactory: (tokenStorage: TokenStorageService, router: Router) => {
    return new AuthInterceptor(tokenStorage, router);
  },
  deps: [TokenStorageService, Router],
  multi: true
};
