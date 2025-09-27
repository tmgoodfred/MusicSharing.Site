import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { VerifyEmailComponent } from './features/register/verify-email/verify-email.component';
import { ResetPasswordComponent } from './features/register/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './features/register/forgot-password/forgot-password.component';
import { AdminComponent } from './features/admin/admin.component';
import { AdminGuard } from './core/guards/admin.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'auth',
    loadChildren: () => import('./core/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'songs',
    loadChildren: () => import('./features/songs/songs.module').then(m => m.SongsModule)
  },
  {
    path: 'playlists',
    loadChildren: () => import('./features/playlists/playlists.module').then(m => m.PlaylistsModule)
  },
  {
    path: 'blog',
    loadChildren: () => import('./features/blog/blog.module').then(m => m.BlogModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./features/search/search.module').then(m => m.SearchModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule)
  },
  {
    path: 'analytics',
    loadChildren: () => import('./features/analytics/analytics.module').then(m => m.AnalyticsModule)
  },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/verify-email', component: VerifyEmailComponent },
  { path: 'auth/reset-password', component: ResetPasswordComponent },
  { path: 'auth/forgot-password', component: ForgotPasswordComponent },
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
