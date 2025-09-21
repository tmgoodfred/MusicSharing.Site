import { Component, HostListener } from '@angular/core';
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
  isDropdownOpen = false; // Add this property
  menuOpen = false;
  isMobile = false;

  constructor(
    private themeService: ThemeService,
    private authService: AuthService
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
}
