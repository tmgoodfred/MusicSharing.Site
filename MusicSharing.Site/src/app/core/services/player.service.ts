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
  currentIndex: number; // NEW: index of currentSong in queue (-1 if none)
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
    queue: [],
    currentIndex: -1
  });

  state$ = this.state.asObservable();
  private updateTimer?: number;

  constructor() { }

  // Centralized playback starter that keeps queue/index in sync
  private startPlayback(song: Song, index: number) {
    if (this.sound) {
      this.sound.stop();
      this.sound.unload();
    }

    this.sound = new Howl({
      src: [`http://192.168.1.217:5000/api/music/${song.id}/stream`],
      html5: true,
      volume: this.state.value.volume,
      onload: () => {
        this.updateState({
          currentSong: song,
          duration: this.sound?.duration() || 0,
          currentIndex: index
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

    this.updateState({
      currentSong: song,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      currentIndex: index
    });

    this.sound.play();
  }

  // Play a specific song; ensure it's part of the queue and update currentIndex
  play(song: Song) {
    let { queue } = this.state.value;
    let idx = queue.findIndex(s => s.id === song.id);

    if (idx === -1) {
      queue = [...queue, song];
      idx = queue.length - 1;
      this.updateState({ queue });
    }

    this.startPlayback(queue[idx], idx);
  }

  // Play by index from queue
  playAtIndex(index: number) {
    const { queue } = this.state.value;
    if (index < 0 || index >= queue.length) return;
    this.startPlayback(queue[index], index);
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
    const { currentIndex, queue } = this.state.value;
    if (currentIndex === -1 || queue.length === 0) return;

    const nextIndex = currentIndex + 1;
    if (nextIndex < queue.length) {
      this.playAtIndex(nextIndex);
    } else {
      // Reached end of queue; stop
      if (this.sound) {
        this.sound.stop();
      }
    }
  }

  playPrevious() {
    const { currentIndex, queue } = this.state.value;
    if (currentIndex === -1 || queue.length === 0) return;

    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      this.playAtIndex(prevIndex);
    }
  }

  addToQueue(song: Song) {
    const queue = [...this.state.value.queue, song];
    this.updateState({ queue });
  }

  removeFromQueue(index: number) {
    const { queue, currentIndex } = this.state.value;
    if (index < 0 || index >= queue.length) return;

    const newQueue = [...queue];
    const [removed] = newQueue.splice(index, 1);

    // Determine new currentIndex and playback behavior
    if (currentIndex === index) {
      // Removed currently playing song
      if (this.sound) {
        this.sound.stop();
        this.sound.unload();
        this.sound = undefined;
      }

      if (newQueue[index]) {
        // Play the next item at the same index
        this.updateState({ queue: newQueue, currentIndex: index });
        this.playAtIndex(index);
        return;
      } else if (newQueue.length > 0) {
        // Play the last item
        const lastIndex = newQueue.length - 1;
        this.updateState({ queue: newQueue, currentIndex: lastIndex });
        this.playAtIndex(lastIndex);
        return;
      } else {
        // Queue empty
        this.updateState({
          queue: newQueue,
          currentIndex: -1,
          currentSong: undefined,
          isPlaying: false,
          currentTime: 0,
          duration: 0
        });
        return;
      }
    } else {
      // Adjust currentIndex if necessary
      const newCurrentIndex = currentIndex > index ? currentIndex - 1 : currentIndex;
      this.updateState({ queue: newQueue, currentIndex: newCurrentIndex });
    }
  }

  moveInQueue(previousIndex: number, currentIndex: number) {
    const { queue } = this.state.value;
    if (previousIndex === currentIndex) return;
    if (previousIndex < 0 || previousIndex >= queue.length) return;
    if (currentIndex < 0 || currentIndex > queue.length) return;

    const newQueue = [...queue];
    const [moved] = newQueue.splice(previousIndex, 1);
    newQueue.splice(currentIndex, 0, moved);

    // Adjust currentIndex if needed
    let newCurrentIndex = this.state.value.currentIndex;
    if (newCurrentIndex === previousIndex) {
      newCurrentIndex = currentIndex;
    } else {
      if (previousIndex < newCurrentIndex && currentIndex >= newCurrentIndex) newCurrentIndex -= 1;
      else if (previousIndex > newCurrentIndex && currentIndex <= newCurrentIndex) newCurrentIndex += 1;
    }

    this.updateState({ queue: newQueue, currentIndex: newCurrentIndex });
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
      this.updateTimer = undefined;
    }
  }
}
