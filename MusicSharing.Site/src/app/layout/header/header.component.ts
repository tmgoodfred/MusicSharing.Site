import { Component, HostListener } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { Observable } from 'rxjs';
import { User } from '../../core/models/models';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class HeaderComponent {
  isDarkMode$: Observable<boolean>;
  currentUser$: Observable<User | null>;
  isDropdownOpen = false;
  menuOpen = false;
  isMobile = false;

  // Quick search text in header
  quickQuery = '';

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router
  ) {
    this.isDarkMode$ = this.themeService.darkMode$;
    this.currentUser$ = this.authService.currentUser$;
    this.checkMobile();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkMobile();
  }

  @HostListener('window:orientationchange')
  onOrientationChange() {
    this.checkMobile();
  }

  checkMobile() {
    this.isMobile = window.innerHeight > window.innerWidth;
    if (!this.isMobile) {
      this.menuOpen = false;
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  logout(): void {
    this.isDropdownOpen = false;
    this.authService.logout();
  }

  goToSearch(): void {
    const q = this.quickQuery?.trim();
    if (!q) return;
    // Navigate to /search?q=... ; SearchComponent will auto-run based on query param
    this.router.navigate(['/search'], { queryParams: { q } });
  }
}
