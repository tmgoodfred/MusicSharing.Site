import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlayerService, PlayerState } from '../../core/services/player.service';
import { Observable, Subscription } from 'rxjs';
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
export class PlayerComponent implements OnInit, OnDestroy {
  playerState$: Observable<PlayerState>;
  queueOpen = false;

  // Track last playing song id to remove when advancing
  private lastSongId: number | null = null;
  private sub?: Subscription;

  // When user goes to previous, skip removal once
  private suppressRemovalOnce = false;

  constructor(private playerService: PlayerService) {
    this.playerState$ = this.playerService.state$;
  }

  ngOnInit(): void {
    this.sub = this.playerService.state$.subscribe((state) => {
      const currId = state.currentSong?.id ?? null;

      // If the song changed (next/finished or user jumped), remove the previous one from queue
      if (this.lastSongId != null && currId !== this.lastSongId) {
        if (!this.suppressRemovalOnce) {
          const idx = state.queue.findIndex(s => s.id === this.lastSongId);
          if (idx !== -1) {
            this.playerService.removeFromQueue(idx);
          }
        } else {
          // Do not remove when going to previous
          this.suppressRemovalOnce = false;
        }
      }

      this.lastSongId = currId;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  togglePlay(): void {
    this.playerService.togglePlayPause();
  }

  playNext(): void {
    this.playerService.playNext();
    // Removal occurs in state subscription when the song actually changes
  }

  playPrevious(): void {
    // Prevent removal when going backward
    this.suppressRemovalOnce = true;
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
    // Previous track removal handled by state subscription
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
