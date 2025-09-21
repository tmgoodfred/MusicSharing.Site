import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlaylistsListComponent } from './playlists-list/playlists-list.component';
import { PlaylistsDetailComponent } from './playlists-detail/playlists-detail.component';
import { PlaylistsCreateEditComponent } from './playlists-create-edit/playlists-create-edit.component';
import { AuthGuard } from '../../core/guards/auth.guard';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PlaylistsListComponent,
    PlaylistsDetailComponent,
    PlaylistsCreateEditComponent,
    RouterModule.forChild([
      {
        path: '',
        component: PlaylistsListComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'create',
        component: PlaylistsCreateEditComponent,
        canActivate: [AuthGuard]
      },
      {
        path: ':id',
        component: PlaylistsDetailComponent
      },
      {
        path: ':id/edit',
        component: PlaylistsCreateEditComponent,
        canActivate: [AuthGuard]
      }
    ])
  ]
})
export class PlaylistsModule { }
