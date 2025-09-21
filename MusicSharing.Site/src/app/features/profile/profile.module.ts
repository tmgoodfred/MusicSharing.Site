import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from './profile.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { AuthGuard } from '../../core/guards/auth.guard';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProfileComponent,
    ProfileEditComponent,
    RouterModule.forChild([
      {
        path: '',
        component: ProfileComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'edit',
        component: ProfileEditComponent,
        canActivate: [AuthGuard]
      },
      {
        path: ':id',
        component: ProfileComponent
      }
    ])
  ]
})
export class ProfileModule { }
