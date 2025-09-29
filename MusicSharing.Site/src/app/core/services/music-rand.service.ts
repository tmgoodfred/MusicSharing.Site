import { Injectable } from '@angular/core';
import { MusicRandDataService } from './music-rand-data.service';

@Injectable({
  providedIn: 'root'
})
export class MusicRandService {
  constructor(private musicData: MusicRandDataService) {}

  getRandomBPM(genre: string, subgenre: string): number {
    const bpmRange = this.musicData.getBPMRange(genre, subgenre);
    if (bpmRange) {
      return Math.floor(Math.random() * (bpmRange.MaxBPM - bpmRange.MinBPM + 1)) + bpmRange.MinBPM;
    }
    return 120;
  }

  generateChordProgression(notesInKey: string[]): string[] {
    const possibleProgressions = [
      ['I', 'IV', 'V', 'I'],
      ['I', 'V', 'vi', 'IV'],
      ['ii', 'V', 'I', 'vi'],
      ['I', 'vi', 'IV', 'V'],
      ['I', 'IV', 'ii', 'V']
    ];

    const randomIndex = Math.floor(Math.random() * possibleProgressions.length);
    const selectedProgression = possibleProgressions[randomIndex];

    return selectedProgression.map(degree => {
      switch (degree) {
        case "I": return notesInKey[0] + " Major";
        case "ii": return notesInKey[1] + " Minor";
        case "IV": return notesInKey[3] + " Major";
        case "V": return notesInKey[4] + " Major";
        case "vi": return notesInKey[5] + " Minor";
        default: return "";
      }
    });
  }

  generateChordsDisplay(chordProgression: string[], notesInKey: string[]): string {
    return chordProgression.map(chord => {
      const [rootNote, chordType] = chord.split(' ');
      const rootIndex = notesInKey.indexOf(rootNote);
      const chordNotes = chordType === "Major" ? 
        [rootNote, notesInKey[(rootIndex + 2) % notesInKey.length], notesInKey[(rootIndex + 4) % notesInKey.length]] : 
        [rootNote, notesInKey[(rootIndex + 2) % notesInKey.length], notesInKey[(rootIndex + 3) % notesInKey.length]];
      return `${chord}: ${chordNotes.join(', ')}`;
    }).join('\n');
  }

  generateMelody(chordProgression: string[], notesInKey: string[]): string {
    const beatsPerBar = 8;
    const totalBars = 4;
    let melodyLines = notesInKey.map(note => note.length === 1 ? `${note} : ` : `${note}: `);
    for (let bar = 0; bar < totalBars; bar++) {
      for (let beat = 0; beat < beatsPerBar; beat++) {
        let noteToPlay: string | null = null;
        if (Math.random() > 0.5) {
          noteToPlay = notesInKey[Math.floor(Math.random() * notesInKey.length)];
          const noteIndex = notesInKey.indexOf(noteToPlay);
          melodyLines[noteIndex] += "o ";
        }
        melodyLines = melodyLines.map((line, i) => line += (noteToPlay && notesInKey[i] === noteToPlay ? "" : ". ") + "| ");
      }
    }
    return melodyLines.map(line => line.replace(/\|?\s*$/, '')).join('\n');
  }

  generateRandomVibe(): string {
    const adjectives = this.musicData.adjectives;
    let adjective1 = adjectives[Math.floor(Math.random() * adjectives.length)];
    let adjective2;
    do {
      adjective2 = adjectives[Math.floor(Math.random() * adjectives.length)];
    } while (adjective1 === adjective2);

    adjective1 = adjective1.charAt(0).toUpperCase() + adjective1.slice(1);
    adjective2 = adjective2.charAt(0).toUpperCase() + adjective2.slice(1);

    return `${adjective1}-${adjective2}`;
  }
}