import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { Observable } from 'rxjs';
import { User } from '../../core/models/models';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class HeaderComponent {
  isDarkMode$: Observable<boolean>;
  currentUser$: Observable<User | null>;

  constructor(
    private themeService: ThemeService,
    private authService: AuthService
  ) {
    this.isDarkMode$ = this.themeService.darkMode$;
    this.currentUser$ = this.authService.currentUser$;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
  }
}
