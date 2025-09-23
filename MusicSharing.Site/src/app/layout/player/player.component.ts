import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlayerService, PlayerState } from '../../core/services/player.service';
import { SongService } from '../../core/services/song.service';
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

  private sub?: Subscription;

  constructor(
    private playerService: PlayerService,
    private songService: SongService
  ) {
    this.playerState$ = this.playerService.state$;
  }

  ngOnInit(): void {
    // We'll no longer try to manage queue removal from the component
    // Let the PlayerService handle this entirely
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  togglePlay(): void {
    this.playerService.togglePlayPause();
  }

  playNext(): void {
    // The HTML will have the button disabled if there's no next track,
    // but we'll add this check as an extra safeguard
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
    if (!seconds || isNaN(seconds)) return '0:00';
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

  // New method to get artwork URL using SongService
  getArtworkUrl(songId: number): string {
    return this.songService.getArtworkUrl(songId);
  }
}
