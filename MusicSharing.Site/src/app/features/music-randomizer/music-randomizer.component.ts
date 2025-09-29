import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MusicRandService } from '../../../app/core/services/music-rand.service';
import { MusicRandDataService } from '../../../app/core/services/music-rand-data.service';

@Component({
  selector: 'app-music-randomizer',
  templateUrl: './music-randomizer.component.html',
  styleUrls: ['./music-randomizer.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class MusicRandomizerComponent {
  genre = '';
  bpm = 0;
  selectedKey = '';
  notesInKey: string[] = [];
  genreOptions: string[] = [];
  selectedGenre = '';
  subgenreOptions: string[] = [];
  subgenre = '';
  chordProgression: string[] = [];
  chordsDisplay = '';
  vibe = '';
  melody = '';

private musicService: MusicRandService;
public musicData: MusicRandDataService;

constructor(musicService: MusicRandService, musicData: MusicRandDataService) {
  this.musicService = musicService;
  this.musicData = musicData;
  this.genreOptions = this.musicData.getMainGenres();
  this.selectedGenre = '';
}

  onGenreChange() {
  }

  updateBasedOnGenre() {
    if (this.selectedGenre && this.subgenre) {
      const bpmRange = this.musicData.getBPMRange(this.selectedGenre, this.subgenre);
      if (bpmRange) {
        this.bpm = Math.floor(Math.random() * (bpmRange.MaxBPM - bpmRange.MinBPM + 1)) + bpmRange.MinBPM;
      }
    }
  }

  randomize() {
    if (this.selectedGenre) {
      const subgenres = this.musicData.getSubgenres(this.selectedGenre);
      this.subgenre = subgenres[Math.floor(Math.random() * subgenres.length)];
      this.genre = this.subgenre;
      
      const bpmRange = this.musicData.getBPMRange(this.selectedGenre, this.subgenre);
      if (bpmRange) {
        this.bpm = Math.floor(Math.random() * (bpmRange.MaxBPM - bpmRange.MinBPM + 1)) + bpmRange.MinBPM;
      }
    } else {
      const mainGenres = this.musicData.getMainGenres();
      const randomMainGenre = mainGenres[Math.floor(Math.random() * mainGenres.length)];
      const subgenres = this.musicData.getSubgenres(randomMainGenre);
      this.subgenre = subgenres[Math.floor(Math.random() * subgenres.length)];
      
      this.selectedGenre = randomMainGenre;
      this.genre = this.subgenre;
      
      const bpmRange = this.musicData.getBPMRange(randomMainGenre, this.subgenre);
      if (bpmRange) {
        this.bpm = Math.floor(Math.random() * (bpmRange.MaxBPM - bpmRange.MinBPM + 1)) + bpmRange.MinBPM;
      }
    }
    
    console.log(this.genre);
    this.selectedKey = this.getRandomKey();
    this.notesInKey = this.musicData.musicalKeys[this.selectedKey as keyof typeof this.musicData.musicalKeys];
    this.chordProgression = this.musicService.generateChordProgression(this.notesInKey);
    this.chordsDisplay = this.musicService.generateChordsDisplay(this.chordProgression, this.notesInKey);
    this.vibe = this.musicService.generateRandomVibe();
  }

  getRandomKey(): string {
    const keys = Object.keys(this.musicData.musicalKeys);
    return keys[Math.floor(Math.random() * keys.length)];
  }

  createMelody() {
    this.melody = this.generateMelody(this.chordProgression, this.notesInKey);
  }

  generateMelody(chordProgression: string[], notesInKey: string[]): string {
    const melodyLines: string[] = [];
    const beatsPerBar = 8;
    const totalBars = 4;

    notesInKey.forEach(note => {
      const noteLabel = note.length === 1 ? `${note} : ` : `${note}: `;
      melodyLines.push(noteLabel);
    });

    for (let bar = 0; bar < totalBars; bar++) {
      for (let beat = 0; beat < beatsPerBar; beat++) {
        let notePlaced = false;
        let noteToPlay: string = '';

        if (Math.random() > 0.5) {
          noteToPlay = notesInKey[Math.floor(Math.random() * notesInKey.length)];
          const noteIndex = notesInKey.indexOf(noteToPlay);

          melodyLines[noteIndex] += "o ";
          notePlaced = true;
        }

        melodyLines.forEach((line, i) => {
          if (!notePlaced || i !== notesInKey.indexOf(noteToPlay)) {
            melodyLines[i] += ". ";
          }
        });
      }

      melodyLines.forEach((line, i) => {
        melodyLines[i] += "| ";
      });
    }

    melodyLines.forEach((line, i) => {
      melodyLines[i] = line.trimEnd().replace(/\|$/, '');
    });

    return melodyLines.join('\n');
  }
}