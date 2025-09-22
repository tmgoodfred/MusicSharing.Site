import { Component, OnInit } from '@angular/core';
import { PlayerService, PlayerState } from '../../core/services/player.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, DragDropModule]
})
export class PlayerComponent implements OnInit {
  playerState$: Observable<PlayerState>;
  queueOpen = false;

  constructor(private playerService: PlayerService) {
    this.playerState$ = this.playerService.state$;
  }

  ngOnInit(): void { }

  togglePlay(): void {
    this.playerService.togglePlayPause();
  }

  playNext(): void {
    this.playerService.playNext();
  }

  playPrevious(): void {
    this.playerService.playPrevious();
  }

  setVolume(event: any): void {
    this.playerService.setVolume(event.target.value / 100);
  }

  seekTo(event: any): void {
    const percent = event.target.value / 100;
    this.playerService.seek(percent * this.getCurrentDuration());
  }

  toggleQueue(): void {
    this.queueOpen = !this.queueOpen;
  }

  drop(event: CdkDragDrop<any[]>): void {
    // Reorder in service (source and target are same list)
    this.playerService.moveInQueue(event.previousIndex, event.currentIndex);
  }

  playFromQueue(index: number): void {
    this.playerService.playAtIndex(index);
  }

  removeFromQueue(index: number): void {
    this.playerService.removeFromQueue(index);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60) || 0;
    const secs = Math.floor(seconds % 60) || 0;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  displayDuration(duration?: number): string {
    if (!duration || isNaN(duration)) return '--:--';
    return this.formatTime(duration);
  }

  getCurrentDuration(): number {
    return (this.playerService as any)['state'].getValue().duration;
  }
}
