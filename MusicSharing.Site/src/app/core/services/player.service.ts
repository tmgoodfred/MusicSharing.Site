import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Song } from '../models/models';
import { Howl } from 'howler';

export interface PlayerState {
  currentSong?: Song;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Song[];
}

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private sound?: Howl;
  private state = new BehaviorSubject<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    queue: []
  });

  state$ = this.state.asObservable();
  private updateTimer?: number;

  constructor() { }

  play(song: Song) {
    if (this.sound) {
      this.sound.stop();
    }

    this.sound = new Howl({
      src: [`http://192.168.1.217:5000/api/music/${song.id}/stream`],
      html5: true,
      volume: this.state.value.volume,
      onload: () => {
        this.updateState({
          currentSong: song,
          duration: this.sound?.duration() || 0
        });
      },
      onplay: () => {
        this.updateState({ isPlaying: true });
        this.startTimeUpdate();
      },
      onpause: () => {
        this.updateState({ isPlaying: false });
        this.stopTimeUpdate();
      },
      onstop: () => {
        this.updateState({ isPlaying: false, currentTime: 0 });
        this.stopTimeUpdate();
      },
      onend: () => {
        this.playNext();
      }
    });

    this.sound.play();
  }

  togglePlayPause() {
    if (!this.sound) return;

    if (this.state.value.isPlaying) {
      this.sound.pause();
    } else {
      this.sound.play();
    }
  }

  setVolume(volume: number) {
    if (this.sound) {
      this.sound.volume(volume);
    }
    this.updateState({ volume });
  }

  seek(position: number) {
    if (this.sound) {
      this.sound.seek(position);
      this.updateState({ currentTime: position });
    }
  }

  playNext() {
    const { currentSong, queue } = this.state.value;
    if (!currentSong || queue.length === 0) return;

    const currentIndex = queue.findIndex(song => song.id === currentSong.id);
    if (currentIndex > -1 && currentIndex < queue.length - 1) {
      this.play(queue[currentIndex + 1]);
    }
  }

  playPrevious() {
    const { currentSong, queue } = this.state.value;
    if (!currentSong || queue.length === 0) return;

    const currentIndex = queue.findIndex(song => song.id === currentSong.id);
    if (currentIndex > 0) {
      this.play(queue[currentIndex - 1]);
    }
  }

  addToQueue(song: Song) {
    const queue = [...this.state.value.queue, song];
    this.updateState({ queue });
  }

  private updateState(newState: Partial<PlayerState>) {
    this.state.next({
      ...this.state.value,
      ...newState
    });
  }

  private startTimeUpdate() {
    this.updateTimer = window.setInterval(() => {
      if (this.sound && this.state.value.isPlaying) {
        this.updateState({ currentTime: this.sound.seek() as number });
      }
    }, 1000);
  }

  private stopTimeUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
  }
}
