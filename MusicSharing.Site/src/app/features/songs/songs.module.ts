import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SongListComponent } from './song-list/song-list.component';
import { SongDetailComponent } from './song-detail/song-detail.component';
import { SongUploadComponent } from './song-upload/song-upload.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SongListComponent,
    SongDetailComponent,
    SongUploadComponent,
    RouterModule.forChild([
      { path: '', component: SongListComponent },
      { path: 'upload', component: SongUploadComponent },
      { path: ':id', component: SongDetailComponent }
    ])
  ]
})
export class SongsModule { }
