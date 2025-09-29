import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MusicRandomizerComponent } from './music-randomizer.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MusicRandomizerComponent,
    RouterModule.forChild([
      {
        path: '',
        component: MusicRandomizerComponent
      }
    ])
  ]
})
export class MusicRandomizerModule { }
