import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserRole } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }

  canActivate(): Observable<boolean> {
    return this.auth.currentUser$.pipe(
      map(user => {
        console.log('AdminGuard user:', user);
        const role = user?.role as unknown;
        const isAdmin =
          typeof role === 'string'
            ? role.toLowerCase() === 'admin'
            : role === UserRole.Admin || role === 1;

        if (isAdmin) return true;
        this.router.navigate(['/']);
        return false;
      })
    );
  }
}
