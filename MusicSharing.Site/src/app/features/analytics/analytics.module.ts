import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AnalyticsComponent } from '../analytics/analytics.component';
import { AuthGuard } from '../../core/guards/auth.guard';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AnalyticsComponent,
    RouterModule.forChild([
      {
        path: '',
        component: AnalyticsComponent,
        canActivate: [AuthGuard]
      }
    ])
  ]
})
export class AnalyticsModule { }
