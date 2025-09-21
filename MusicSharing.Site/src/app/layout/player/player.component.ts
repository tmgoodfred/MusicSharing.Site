import { Component, OnInit } from '@angular/core';
import { PlayerService, PlayerState } from '../../core/services/player.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class PlayerComponent implements OnInit {
  playerState$: Observable<PlayerState>;

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

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  getCurrentDuration(): number {
    return this.playerService['state'].getValue().duration;
  }
}
