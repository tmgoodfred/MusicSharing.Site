import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Song } from '../models/models';
import { Howl } from 'howler';

// Extend Song interface to include duration
interface SongWithDuration extends Song {
  duration?: number;
}

export interface PlayerState {
  currentSong?: SongWithDuration;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: SongWithDuration[];  // Songs waiting to be played
  history: SongWithDuration[]; // Songs that have been played
  currentIndex: number;  // Index of currentSong in queue (-1 if none)
  hasNextTrack: boolean; // Whether there's another track to play after the current one
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
    history: [],
    currentIndex: -1,
    hasNextTrack: false
  });

  state$ = this.state.asObservable();
  private updateTimer?: number;

  // Track if a song ended naturally (vs. user skipping)
  private songEndedNaturally = false;

  // Store song durations in memory
  private songDurations: Map<number, number> = new Map();

  constructor() { }

  // Centralized playback starter that keeps queue/index in sync
  private startPlayback(song: SongWithDuration, index: number) {
    if (this.sound) {
      this.sound.stop();
      this.sound.unload();
    }

    this.sound = new Howl({
      src: [`http://192.168.1.217:5000/api/music/${song.id}/stream`],
      html5: true,
      volume: this.state.value.volume,
      onload: () => {
        const duration = this.sound?.duration() || 0;

        // Store the duration for future reference
        this.songDurations.set(song.id, duration);

        // Update the song in the queue with its duration
        this.updateSongDurationInQueue(song.id, duration);

        this.updateState({
          currentSong: { ...song, duration },
          duration: duration,
          currentIndex: index
        });

        // Update hasNextTrack when loading a song
        this.updateHasNextTrack();
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
        // Mark that this song ended naturally, so we know to move it to history
        this.songEndedNaturally = true;

        // Check if this is the last song in the queue
        const { currentIndex, queue } = this.state.value;
        const isLastSong = currentIndex === queue.length - 1;

        if (isLastSong) {
          // If it's the last song, just pause and reset to beginning instead of removing
          this.handleLastSongEnd();
        } else {
          // Normal behavior for songs in the middle of the queue
          this.playNext();
        }
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

  // Update the duration of a song in the queue
  private updateSongDurationInQueue(songId: number, duration: number): void {
    const { queue } = this.state.value;
    const updatedQueue = queue.map(song => {
      if (song.id === songId) {
        return { ...song, duration };
      }
      return song;
    });

    this.updateState({ queue: updatedQueue });
  }

  // New method to handle when the last song ends
  private handleLastSongEnd() {
    if (this.sound) {
      // Pause the song
      this.sound.pause();
      // Reset to beginning
      this.sound.seek(0);

      // Add to history but keep in queue
      const { currentSong, history } = this.state.value;
      const newHistory = currentSong ? [...history, currentSong] : [...history];

      this.updateState({
        isPlaying: false,
        currentTime: 0,
        history: newHistory
      });

      // Reset the flag
      this.songEndedNaturally = false;
    }
  }

  // Update the hasNextTrack state based on queue position
  private updateHasNextTrack() {
    const { currentIndex, queue } = this.state.value;
    const hasNext = currentIndex < queue.length - 1;
    this.updateState({ hasNextTrack: hasNext });
  }

  // Play a specific song; ensure it's part of the queue and update currentIndex
  play(song: Song) {
    let { queue } = this.state.value;

    // Convert regular Song to SongWithDuration, including any cached duration
    const songWithDuration: SongWithDuration = {
      ...song,
      duration: this.songDurations.get(song.id)
    };

    let idx = queue.findIndex(s => s.id === song.id);

    if (idx === -1) {
      queue = [...queue, songWithDuration];
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
    const { currentIndex, queue, history, currentSong, hasNextTrack } = this.state.value;
    if (currentIndex === -1 || queue.length === 0) return;

    // Don't do anything if there's no next track
    if (!hasNextTrack) return;

    // Move the current song to history
    const newHistory = currentSong ? [...history, currentSong] : [...history];

    // Remove the current song from the queue
    const newQueue = [...queue];
    newQueue.splice(currentIndex, 1);

    // Reset the flag
    this.songEndedNaturally = false;

    if (newQueue.length > 0) {
      // Play the next song which is now at the current index
      // (since we removed the current one)
      this.updateState({
        queue: newQueue,
        history: newHistory
      });
      this.playAtIndex(Math.min(currentIndex, newQueue.length - 1));
    } else {
      // Queue is now empty
      if (this.sound) {
        this.sound.stop();
        this.sound.unload();
        this.sound = undefined;
      }
      this.updateState({
        queue: [],
        history: newHistory,
        currentIndex: -1,
        currentSong: undefined,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        hasNextTrack: false
      });
    }
  }

  playPrevious() {
    const { queue, history } = this.state.value;

    // Reset the natural ending flag when going to previous
    this.songEndedNaturally = false;

    if (history.length === 0) {
      // No history to go back to, check if we can go back in the queue
      const prevIndex = this.state.value.currentIndex - 1;
      if (prevIndex >= 0) {
        this.playAtIndex(prevIndex);
      }
      return;
    }

    // Get the most recent song from history
    const prevSong = history[history.length - 1];

    // Remove the last song from history
    const newHistory = [...history];
    newHistory.pop();

    // Add it to the beginning of the queue
    const newQueue = [prevSong, ...queue];

    // Update the state
    this.updateState({
      queue: newQueue,
      history: newHistory
    });

    // Play the song that we just moved from history to queue
    this.playAtIndex(0);
  }

  addToQueue(song: Song) {
    // Add any known duration before adding to queue
    const songWithDuration: SongWithDuration = {
      ...song,
      duration: this.songDurations.get(song.id)
    };

    const queue = [...this.state.value.queue, songWithDuration];
    this.updateState({ queue });
    this.updateHasNextTrack();
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
        this.updateState({ queue: newQueue });
        this.playAtIndex(index);
      } else if (newQueue.length > 0) {
        // Play the last item
        const lastIndex = newQueue.length - 1;
        this.updateState({ queue: newQueue });
        this.playAtIndex(lastIndex);
      } else {
        // Queue empty
        this.updateState({
          queue: newQueue,
          currentIndex: -1,
          currentSong: undefined,
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          hasNextTrack: false
        });
      }
    } else {
      // Adjust currentIndex if necessary
      const newCurrentIndex = currentIndex > index ? currentIndex - 1 : currentIndex;
      this.updateState({ queue: newQueue, currentIndex: newCurrentIndex });
      this.updateHasNextTrack();
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
    this.updateHasNextTrack();
  }

  // New method to clear the play history
  clearHistory() {
    this.updateState({ history: [] });
  }

  private updateState(newState: Partial<PlayerState>) {
    this.state.next({
      ...this.state.value,
      ...newState
    });
  }

  private startTimeUpdate() {
    this.stopTimeUpdate(); // Clear any existing timer first

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
