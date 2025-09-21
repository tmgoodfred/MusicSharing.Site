import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BlogListComponent } from './blog-list/blog-list.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { BlogCreateEditComponent } from './blog-create-edit/blog-create-edit.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { AdminGuard } from '../../core/guards/admin.guard';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BlogListComponent,
    BlogDetailComponent,
    BlogCreateEditComponent,
    RouterModule.forChild([
      { path: '', component: BlogListComponent },
      { path: 'create', component: BlogCreateEditComponent, canActivate: [AuthGuard, AdminGuard] },
      { path: ':id', component: BlogDetailComponent },
      { path: ':id/edit', component: BlogCreateEditComponent, canActivate: [AuthGuard, AdminGuard] }
    ])
  ]
})
export class BlogModule { }
