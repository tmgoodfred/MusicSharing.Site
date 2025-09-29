import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MusicRandDataService {
  ElectronicGenre = {
    "House": { MinBPM: 115, MaxBPM: 130 },
    "Deep House": { MinBPM: 120, MaxBPM: 125 },
    "Tech House": { MinBPM: 120, MaxBPM: 130 },
    "Progressive House": { MinBPM: 125, MaxBPM: 130 },
    "Electro House": { MinBPM: 128, MaxBPM: 132 },
    "Trance": { MinBPM: 130, MaxBPM: 140 },
    "Progressive Trance": { MinBPM: 128, MaxBPM: 135 },
    "Psytrance": { MinBPM: 140, MaxBPM: 150 },
    "Dubstep": { MinBPM: 140, MaxBPM: 150 },
    "Drum and Bass": { MinBPM: 160, MaxBPM: 180 },
    "Techno": { MinBPM: 120, MaxBPM: 150 },
    "Minimal Techno": { MinBPM: 120, MaxBPM: 128 },
    "Hardstyle": { MinBPM: 140, MaxBPM: 150 },
    "Trap": { MinBPM: 140, MaxBPM: 160 },
    "Future Bass": { MinBPM: 130, MaxBPM: 150 },
    "Chillout": { MinBPM: 90, MaxBPM: 120 },
    "Ambient": { MinBPM: 60, MaxBPM: 90 },
    "Glitch Hop": { MinBPM: 110, MaxBPM: 115 },
    "Moombahton": { MinBPM: 108, MaxBPM: 115 },
    "Tropical House": { MinBPM: 100, MaxBPM: 115 },
    "Big Room": { MinBPM: 126, MaxBPM: 132 },
    "Hardcore": { MinBPM: 160, MaxBPM: 200 },
    "Jungle": { MinBPM: 160, MaxBPM: 180 },
    "UK Garage": { MinBPM: 130, MaxBPM: 135 },
    "Bassline": { MinBPM: 135, MaxBPM: 142 },
    "Footwork": { MinBPM: 150, MaxBPM: 160 },
    "Jersey Club": { MinBPM: 130, MaxBPM: 140 },
    "Future Garage": { MinBPM: 130, MaxBPM: 135 },
    "Synthwave": { MinBPM: 80, MaxBPM: 118 },
    "Vaporwave": { MinBPM: 60, MaxBPM: 90 },
    "Electro Swing": { MinBPM: 110, MaxBPM: 125 },
    "Breakbeat": { MinBPM: 125, MaxBPM: 140 },
    "IDM": { MinBPM: 60, MaxBPM: 160 },
    "Gabber": { MinBPM: 180, MaxBPM: 200 },
    "Speedcore": { MinBPM: 200, MaxBPM: 300 },
    "Darkstep": { MinBPM: 160, MaxBPM: 180 },
    "Neurofunk": { MinBPM: 160, MaxBPM: 180 },
    "Liquid Funk": { MinBPM: 160, MaxBPM: 180 },
    "Jump Up": { MinBPM: 170, MaxBPM: 180 },
    "Riddim": { MinBPM: 140, MaxBPM: 150 },
    "Brostep": { MinBPM: 140, MaxBPM: 150 },
    "Complextro": { MinBPM: 128, MaxBPM: 130 },
    "Fidget House": { MinBPM: 128, MaxBPM: 132 },
    "Melbourne Bounce": { MinBPM: 128, MaxBPM: 130 },
    "Future House": { MinBPM: 120, MaxBPM: 128 },
    "Bass House": { MinBPM: 126, MaxBPM: 132 },
    "Ghetto House": { MinBPM: 130, MaxBPM: 135 },
    "Chicago House": { MinBPM: 120, MaxBPM: 130 },
    "Detroit Techno": { MinBPM: 120, MaxBPM: 135 },
    "Acid Techno": { MinBPM: 130, MaxBPM: 150 },
    "Hard Techno": { MinBPM: 140, MaxBPM: 150 },
    "Phonk": { MinBPM: 130, MaxBPM: 150 },
    "Drift Phonk": { MinBPM: 140, MaxBPM: 160 },
    "Lo-fi": { MinBPM: 60, MaxBPM: 90 },
    "Downtempo": { MinBPM: 70, MaxBPM: 100 },
    "Chiptune": { MinBPM: 120, MaxBPM: 150 },
    "8-bit": { MinBPM: 120, MaxBPM: 150 },
    "Electroclash": { MinBPM: 120, MaxBPM: 130 },
    "Nu Disco": { MinBPM: 120, MaxBPM: 125 },
    "Italo Disco": { MinBPM: 120, MaxBPM: 130 },
    "Space Disco": { MinBPM: 120, MaxBPM: 130 },
    "French House": { MinBPM: 110, MaxBPM: 125 },
    "Nu Jazz": { MinBPM: 120, MaxBPM: 130 },
    "Electro Pop": { MinBPM: 110, MaxBPM: 130 },
    "Synth Pop": { MinBPM: 110, MaxBPM: 130 },
    "New Wave": { MinBPM: 120, MaxBPM: 140 },
    "Dark Wave": { MinBPM: 110, MaxBPM: 130 },
    "Cold Wave": { MinBPM: 110, MaxBPM: 130 },
    "Minimal Wave": { MinBPM: 110, MaxBPM: 130 },
    "Dream Pop": { MinBPM: 60, MaxBPM: 100 }
  };

  CountryGenre = {
    "Traditional Country": { MinBPM: 70, MaxBPM: 120 },
    "Modern Country": { MinBPM: 75, MaxBPM: 130 },
    "Outlaw Country": { MinBPM: 80, MaxBPM: 120 },
    "Country Pop": { MinBPM: 90, MaxBPM: 130 },
    "Bluegrass": { MinBPM: 110, MaxBPM: 160 },
    "Country Rock": { MinBPM: 100, MaxBPM: 140 },
    "Western Swing": { MinBPM: 120, MaxBPM: 160 }
  };

  HipHopGenre = {
    "Old School Hip-Hop": { MinBPM: 80, MaxBPM: 100 },
    "Trap": { MinBPM: 130, MaxBPM: 175 },
    "Gangsta Rap": { MinBPM: 85, MaxBPM: 105 },
    "Conscious Hip-Hop": { MinBPM: 80, MaxBPM: 100 },
    "Drill": { MinBPM: 130, MaxBPM: 150 },
    "Mumble Rap": { MinBPM: 120, MaxBPM: 160 },
    "Alternative Hip-Hop": { MinBPM: 85, MaxBPM: 110 },
    "East Coast": { MinBPM: 85, MaxBPM: 100 },
    "West Coast": { MinBPM: 90, MaxBPM: 105 },
    "Southern Hip-Hop": { MinBPM: 70, MaxBPM: 100 },
    "UK Grime": { MinBPM: 130, MaxBPM: 150 }
  };

  JazzGenre = {
    "Bebop": { MinBPM: 160, MaxBPM: 300 },
    "Swing": { MinBPM: 120, MaxBPM: 200 },
    "Cool Jazz": { MinBPM: 80, MaxBPM: 140 },
    "Modal Jazz": { MinBPM: 100, MaxBPM: 160 },
    "Free Jazz": { MinBPM: 60, MaxBPM: 300 },
    "Fusion": { MinBPM: 90, MaxBPM: 160 },
    "Smooth Jazz": { MinBPM: 70, MaxBPM: 110 },
    "Latin Jazz": { MinBPM: 120, MaxBPM: 180 },
    "Nu Jazz": { MinBPM: 90, MaxBPM: 130 }
  };

  ClassicalGenre = {
    "Baroque": { MinBPM: 60, MaxBPM: 120 },
    "Classical Period": { MinBPM: 60, MaxBPM: 120 },
    "Romantic": { MinBPM: 40, MaxBPM: 160 },
    "Contemporary Classical": { MinBPM: 40, MaxBPM: 200 },
    "Minimalist": { MinBPM: 60, MaxBPM: 150 },
    "Opera": { MinBPM: 60, MaxBPM: 140 },
    "Chamber Music": { MinBPM: 60, MaxBPM: 120 },
    "Orchestral": { MinBPM: 60, MaxBPM: 140 }
  };

  PopGenre = {
    "Mainstream Pop": { MinBPM: 90, MaxBPM: 130 },
    "Indie Pop": { MinBPM: 85, MaxBPM: 125 },
    "Synth Pop": { MinBPM: 100, MaxBPM: 130 },
    "K-Pop": { MinBPM: 100, MaxBPM: 140 },
    "J-Pop": { MinBPM: 100, MaxBPM: 140 },
    "Dance Pop": { MinBPM: 110, MaxBPM: 130 },
    "Electro Pop": { MinBPM: 110, MaxBPM: 130 },
    "Art Pop": { MinBPM: 80, MaxBPM: 130 },
    "Teen Pop": { MinBPM: 95, MaxBPM: 130 }
  };

  MetalGenre = {
    "Heavy Metal": { MinBPM: 100, MaxBPM: 160 },
    "Thrash Metal": { MinBPM: 140, MaxBPM: 220 },
    "Death Metal": { MinBPM: 160, MaxBPM: 240 },
    "Black Metal": { MinBPM: 150, MaxBPM: 220 },
    "Doom Metal": { MinBPM: 60, MaxBPM: 100 },
    "Power Metal": { MinBPM: 120, MaxBPM: 180 },
    "Progressive Metal": { MinBPM: 90, MaxBPM: 180 },
    "Nu Metal": { MinBPM: 90, MaxBPM: 140 },
    "Metalcore": { MinBPM: 140, MaxBPM: 200 },
    "Deathcore": { MinBPM: 160, MaxBPM: 260 },
    "Industrial Metal": { MinBPM: 100, MaxBPM: 160 }
  };

  FolkGenre = {
    "Traditional Folk": { MinBPM: 60, MaxBPM: 120 },
    "Contemporary Folk": { MinBPM: 70, MaxBPM: 130 },
    "Celtic": { MinBPM: 100, MaxBPM: 160 },
    "Americana": { MinBPM: 70, MaxBPM: 120 },
    "Singer-Songwriter": { MinBPM: 60, MaxBPM: 120 },
    "Indie Folk": { MinBPM: 70, MaxBPM: 120 }
  };

  WorldGenre = {
    "Reggae": { MinBPM: 60, MaxBPM: 100 },
    "Afrobeat": { MinBPM: 100, MaxBPM: 130 },
    "Latin": { MinBPM: 90, MaxBPM: 160 },
    "Bossa Nova": { MinBPM: 70, MaxBPM: 100 },
    "Samba": { MinBPM: 100, MaxBPM: 160 },
    "Indian Classical": { MinBPM: 60, MaxBPM: 120 },
    "Middle Eastern": { MinBPM: 80, MaxBPM: 140 },
    "Flamenco": { MinBPM: 90, MaxBPM: 160 },
    "Celtic": { MinBPM: 100, MaxBPM: 160 }
  };

  RockGenre = {
    'Classic Rock': { MinBPM: 110, MaxBPM: 140 },
    'Hard Rock': { MinBPM: 120, MaxBPM: 150 },
    'Progressive Rock': { MinBPM: 100, MaxBPM: 130 },
    'Punk Rock': { MinBPM: 160, MaxBPM: 200 },
    'Alternative Rock': { MinBPM: 110, MaxBPM: 140 },
    'Indie Rock': { MinBPM: 100, MaxBPM: 130 }
  };

  getMainGenres(): string[] {
    return [
      "Electronic", 
      "Rock", 
      "Country", 
      "Hip-Hop", 
      "Jazz", 
      "Classical", 
      "Pop", 
      "Metal", 
      "Folk", 
      "World"
    ];
  }

  getSubgenres(mainGenre: string): string[] {
    switch(mainGenre) {
      case "Electronic":
        return Object.keys(this.ElectronicGenre);
      case "Rock":
        return Object.keys(this.RockGenre);
      case "Country":
        return Object.keys(this.CountryGenre);
      case "Hip-Hop":
        return Object.keys(this.HipHopGenre);
      case "Jazz":
        return Object.keys(this.JazzGenre);
      case "Classical":
        return Object.keys(this.ClassicalGenre);
      case "Pop":
        return Object.keys(this.PopGenre);
      case "Metal":
        return Object.keys(this.MetalGenre);
      case "Folk":
        return Object.keys(this.FolkGenre);
      case "World":
        return Object.keys(this.WorldGenre);
      default:
        return [];
    }
  }

  getBPMRange(mainGenre: string, subgenre: string): {MinBPM: number, MaxBPM: number} | undefined {
    switch(mainGenre) {
      case "Electronic":
        return this.ElectronicGenre[subgenre as keyof typeof this.ElectronicGenre];
      case "Rock":
        return this.RockGenre[subgenre as keyof typeof this.RockGenre];
      case "Country":
        return this.CountryGenre[subgenre as keyof typeof this.CountryGenre];
      case "Hip-Hop":
        return this.HipHopGenre[subgenre as keyof typeof this.HipHopGenre];
      case "Jazz":
        return this.JazzGenre[subgenre as keyof typeof this.JazzGenre];
      case "Classical":
        return this.ClassicalGenre[subgenre as keyof typeof this.ClassicalGenre];
      case "Pop":
        return this.PopGenre[subgenre as keyof typeof this.PopGenre];
      case "Metal":
        return this.MetalGenre[subgenre as keyof typeof this.MetalGenre];
      case "Folk":
        return this.FolkGenre[subgenre as keyof typeof this.FolkGenre];
      case "World":
        return this.WorldGenre[subgenre as keyof typeof this.WorldGenre];
      default:
        return undefined;
    }
  }

  musicalKeys = {
    "C Major": ["C", "D", "E", "F", "G", "A", "B"],
  "A Minor": ["A", "B", "C", "D", "E", "F", "G"],
  "G Major": ["G", "A", "B", "C", "D", "E", "F#"],
  "E Minor": ["E", "F#", "G", "A", "B", "C", "D"],
  "D Major": ["D", "E", "F#", "G", "A", "B", "C#"],
  "B Minor": ["B", "C#", "D", "E", "F#", "G", "A"],
  "A Major": ["A", "B", "C#", "D", "E", "F#", "G#"],
  "F# Minor": ["F#", "G#", "A", "B", "C#", "D", "E"],
  "E Major": ["E", "F#", "G#", "A", "B", "C#", "D#"],
  "C# Minor": ["C#", "D#", "E", "F#", "G#", "A", "B"],
  "B Major": ["B", "C#", "D#", "E", "F#", "G#", "A#"],
  "G# Minor": ["G#", "A#", "B", "C#", "D#", "E", "F#"],
  "F# Major": ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
  "D# Minor": ["D#", "E#", "F#", "G#", "A#", "B", "C#"],
  "C# Major": ["C#", "D#", "E#", "F#", "G#", "A#", "B#"],
  "A# Minor": ["A#", "B#", "C#", "D#", "E#", "F#", "G#"],
  "F Major": ["F", "G", "A", "Bb", "C", "D", "E"],
  "D Minor": ["D", "E", "F", "G", "A", "Bb", "C"],
  "Bb Major": ["Bb", "C", "D", "Eb", "F", "G", "A"],
  "G Minor": ["G", "A", "Bb", "C", "D", "Eb", "F"],
  "Eb Major": ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
  "C Minor": ["C", "D", "Eb", "F", "G", "Ab", "Bb"],
  "Ab Major": ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
  "F Minor": ["F", "G", "Ab", "Bb", "C", "Db", "Eb"],
  "Db Major": ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
  "Bb Minor": ["Bb", "C", "Db", "Eb", "F", "Gb", "Ab"],
  "Gb Major": ["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F"],
  "Eb Minor": ["Eb", "F", "Gb", "Ab", "Bb", "Cb", "Db"],
  "Cb Major": ["Cb", "Db", "Eb", "Fb", "Gb", "Ab", "Bb"],
  "Ab Minor": ["Ab", "Bb", "Cb", "Db", "Eb", "Fb", "Gb"],
  "C Dorian": ["C", "D", "Eb", "F", "G", "A", "Bb"],
  "D Dorian": ["D", "E", "F", "G", "A", "B", "C"],
  "E Dorian": ["E", "F#", "G", "A", "B", "C#", "D"],
  "F Dorian": ["F", "G", "Ab", "Bb", "C", "D", "Eb"],
  "G Dorian": ["G", "A", "Bb", "C", "D", "E", "F"],
  "A Dorian": ["A", "B", "C", "D", "E", "F#", "G"],
  "B Dorian": ["B", "C#", "D", "E", "F#", "G#", "A"],
  "C Phrygian": ["C", "Db", "Eb", "F", "G", "Ab", "Bb"],
  "D Phrygian": ["D", "Eb", "F", "G", "A", "Bb", "C"],
  "E Phrygian": ["E", "F", "G", "A", "B", "C", "D"],
  "F Phrygian": ["F", "Gb", "Ab", "Bb", "C", "Db", "Eb"],
  "G Phrygian": ["G", "Ab", "Bb", "C", "D", "Eb", "F"],
  "A Phrygian": ["A", "Bb", "C", "D", "E", "F", "G"],
  "B Phrygian": ["B", "C", "D", "E", "F#", "G", "A"],
  "C Lydian": ["C", "D", "E", "F#", "G", "A", "B"],
  "D Lydian": ["D", "E", "F#", "G#", "A", "B", "C#"],
  "E Lydian": ["E", "F#", "G#", "A#", "B", "C#", "D#"],
  "F Lydian": ["F", "G", "A", "B", "C", "D", "E"],
  "G Lydian": ["G", "A", "B", "C#", "D", "E", "F#"],
  "A Lydian": ["A", "B", "C#", "D#", "E", "F#", "G#"],
  "B Lydian": ["B", "C#", "D#", "E#", "F#", "G#", "A#"],
  "C Mixolydian": ["C", "D", "E", "F", "G", "A", "Bb"],
  "D Mixolydian": ["D", "E", "F#", "G", "A", "B", "C"],
  "E Mixolydian": ["E", "F#", "G#", "A", "B", "C#", "D"],
  "F Mixolydian": ["F", "G", "A", "Bb", "C", "D", "Eb"],
  "G Mixolydian": ["G", "A", "B", "C", "D", "E", "F"],
  "A Mixolydian": ["A", "B", "C#", "D", "E", "F#", "G"],
  "B Mixolydian": ["B", "C#", "D#", "E", "F#", "G#", "A"],
  "C Aeolian": ["C", "D", "Eb", "F", "G", "Ab", "Bb"],
  "D Aeolian": ["D", "E", "F", "G", "A", "Bb", "C"],
  "E Aeolian": ["E", "F#", "G", "A", "B", "C", "D"],
  "F Aeolian": ["F", "G", "Ab", "Bb", "C", "Db", "Eb"],
  "G Aeolian": ["G", "A", "Bb", "C", "D", "Eb", "F"],
  "A Aeolian": ["A", "B", "C", "D", "E", "F", "G"],
  "B Aeolian": ["B", "C#", "D", "E", "F#", "G", "A"],
  "C Locrian": ["C", "Db", "Eb", "F", "Gb", "Ab", "Bb"],
  "D Locrian": ["D", "Eb", "F", "G", "Ab", "Bb", "C"],
  "E Locrian": ["E", "F", "G", "A", "Bb", "C", "D"],
  "F Locrian": ["F", "Gb", "Ab", "Bb", "Cb", "Db", "Eb"],
  "G Locrian": ["G", "Ab", "Bb", "C", "Db", "Eb", "F"],
  "A Locrian": ["A", "Bb", "C", "D", "Eb", "F", "G"],
  "B Locrian": ["B", "C", "D", "E", "F", "G", "A"]
  };

  adjectives = [
    "abundant", "accurate", "adorable", "agile", "alert", "ancient", "angry", "anxious", "arrogant", "ashamed", "attractive", "average", "awful", "beautiful", "better", "bewildered", "big", "bitter", "black", "blue", "bold", "bored", "brave", "brief", "bright", "broad", "broken", "busy", "calm", "careful", "charming", "cheap", "cheerful", "clean", "clear", "clever", "cloudy", "clumsy", "cold", "colorful", "comfortable", "common", "complex", "confident", "confused", "cool", "cooperative", "courageous", "crazy", "creepy", "crisp", "cruel", "curious", "cute", "damaged", "damp", "dangerous", "dark", "dead", "deafening", "deep", "defeated", "defiant", "delicious", "delightful", "depressed", "determined", "different", "difficult", "dirty", "dizzy", "doubtful", "drab", "dry", "dull", "eager", "early", "easy", "elated", "elegant", "embarrassed", "empty", "encouraging", "energetic", "enthusiastic", "envious", "evil", "excited", "expensive", "exuberant", "fair", "faithful", "famous", "fancy", "fantastic", "fast", "fat", "fearless", "fierce", "filthy", "fine", "foolish", "fragile", "frail", "free", "friendly", "frightened", "funny", "fuzzy", "gentle", "giant", "gigantic", "glamorous", "gleaming", "gloomy", "glorious", "good", "gorgeous", "graceful", "grieving", "grotesque", "grumpy", "handsome", "happy", "hard", "harsh", "healthy", "helpful", "helpless", "hilarious", "hollow", "homeless", "homely", "horrible", "hot", "huge", "hungry", "hurt", "icy", "idealistic", "ill", "imaginative", "immense", "impartial", "important", "impossible", "impressive", "incredible", "industrious", "inexpensive", "infamous", "innocent", "inquisitive", "intelligent", "interesting", "itchy", "jealous", "jittery", "jolly", "joyful", "joyous", "juicy", "jumpy", "kind", "lazy", "light", "lively", "lonely", "long", "loose", "loud", "lovely", "lucky", "magnificent", "massive", "mature", "mean", "messy", "mighty", "miniature", "modern", "moist", "motionless", "muddy", "mysterious", "narrow", "nasty", "naughty", "nervous", "new", "nice", "noisy", "nutritious", "obedient", "obnoxious", "odd", "old", "optimistic", "ordinary", "outrageous", "outstanding", "panicky", "perfect", "plain", "pleasant", "poised", "polite", "poor", "powerful", "precious", "prickly", "proud", "pungent", "puny", "quaint", "quick", "quiet", "quirky", "quizzical", "radiant", "rainy", "rapid", "rare", "ratty", "reassuring", "relieved", "repulsive", "responsible", "rich", "ripe", "robust", "rotten", "rough", "round", "rude", "salty", "sarcastic", "sassy", "satisfied", "scary", "scattered", "scrawny", "selfish", "serious", "shaggy", "shaky", "shallow", "sharp", "shiny", "short", "shy", "silly", "skinny", "sleepy", "slimy", "slippery", "slow", "small", "smart", "smelly", "smiling", "smoggy", "smooth", "soft", "soggy", "solid", "sore", "sour", "sparkling", "spectacular", "spicy", "splendid", "spotless", "spotted", "square", "squeaky", "stale", "steep", "sticky", "stormy", "strange", "strong", "stunning", "stupid", "successful", "sudden", "super", "sweet", "swift", "talented", "tame", "tasty", "tender", "tense", "terrible", "thankful", "thoughtful", "thoughtless", "thundering", "tight", "timid", "tired", "tough", "troubled", "ugliest", "ugly", "uninterested", "unsightly", "unusual", "upset", "uptight", "vast", "victorious", "violent", "vivacious", "wandering", "warm", "weary", "wet", "whimsical", "whiny", "white", "wicked", "wide", "wild", "witty", "wobbly", "wonderful", "worried", "worrisome", "wrong", "yawning", "yellow", "young", "yummy", "zany", "zealous", "zesty", "goopy", "abrasive", "abrupt", "absurd", "abysmal", "accessible", "acclaimed", "aching", "acrobatic", "adamant", "addicted", "adept", "adhesive", "admired", "adolescent", "advanced", "affable", "affectionate", "aggravated", "agreeable", "aimless", "airy", "ajar", "alarming", "altruistic", "amateur", "amazing", "ambiguous", "ambitious", "amiable", "ample", "amused", "amusing", "ancient", "angelic", "apathetic", "apprehensive", "appropriate", "apt", "arctic", "articulate", "artistic", "ashamed", "aspiring", "astonishing", "athletic", "attentive", "authentic", "authorized", "automatic", "available", "avaricious", "average", "aware", "awesome", "awestruck", "awkward", "babyish", "back", "bad-tempered", "baggy", "bare", "barren", "bashful", "beady", "beaming", "belated", "beloved", "beneficial", "bewitched", "biodegradable", "biological", "bland", "blank", "blaring", "blissful", "blonde", "blotchy", "blunt", "blurry", "boiling", "boisterous", "bony", "bossy", "bouncy", "bountiful", "brazen", "breakable", "breezy", "brief", "brilliant", "brisk", "bubbly", "bulky", "bumpy", "buoyant", "burdensome", "burly", "bustling", "buzzing", "candid", "canine", "capable", "carefree", "careless", "caring", "cautious", "cavernous", "ceaseless", "cerebral", "chapped", "charming", "chaste", "chattering", "cheeky", "cheesy", "chic", "chilly", "chivalrous", "choosy", "chubby", "circular", "clammy", "classic", "cluttered", "coarse", "cocky", "coherent", "colossal", "compact", "compassionate", "competent", "complacent", "composed", "concerned", "condemned", "conflicted", "conscious", "considerate", "content", "conventional", "cooing", "corrupt", "costly", "crafty", "cramped", "creaky", "credible", "crimson", "crispy", "critical", "crooked", "cuddly", "cultured", "cumbersome", "curly", "cursed", "curved", "cushy", "cynical", "dandy", "dapper", "daring", "darling", "dashing", "dazzling", "deadpan", "deaf", "decent", "decisive", "decorative", "deep-rooted", "defensive", "deficient", "delectable", "delicate", "dependable", "descriptive", "deserted", "desperate", "detailed", "determined", "devoted", "didactic", "digital", "diligent", "dim", "dingy", "direct", "disastrous", "discreet", "disguised", "disloyal", "dismal", "distant", "distinct", "distorted", "dizzying", "dopey", "doting", "double", "downcast", "downtown", "dreary", "droopy", "drowsy", "drunk", "dry-rotted", "dual", "dubious", "ducky", "dumb", "dutiful", "earthy", "easygoing", "eclectic", "ecstatic", "edgy", "edible", "educated", "effervescent", "efficient", "elaborate", "elastic", "elated", "elderly", "electric", "elevated", "elusive", "embellished", "emotional", "empathetic", "empowered", "enchanting", "encouraged", "endangered", "endearing", "endless", "energetic", "engaged", "engaging", "enlightened", "enraged", "entertaining", "enthused", "equable", "equal", "equitable", "erratic", "essential", "esteemed", "ethical", "euphoric", "even", "everlasting", "evident", "evil-minded", "exact", "exalted", "exasperated", "excellent", "excitable", "exclusive", "exotic", "expectant", "experienced", "expert", "extra", "extraneous", "extraordinary", "exuberant", "faint", "fair-minded", "fake", "familiar", "fancy", "fantastical", "farsighted", "fatal", "favorable", "fearful", "feeble", "festive", "fidgety", "filmy", "final", "firm", "fiscal", "flaky", "flashy", "flawless", "flickering", "flimsy", "flirtatious", "flowery", "fluffy", "fluid", "fluttering", "focused", "foolhardy", "forceful", "formal", "forthright", "fortunate", "foul", "fractured", "fragile", "frantic", "frayed", "freezing", "frequent", "fresh", "friendly", "frightening", "frilly", "frisky", "frosty", "frozen", "frugal", "fruitful", "frustrated", "fuchsia", "full", "fumbling", "functional", "fun-loving", "furious", "furry", "fussy", "fuzzy", "gargantuan", "gaseous", "gaudy", "generous", "gentlemanly", "ghastly", "ghostly", "ghoulish", "gleeful", "glib", "global", "glossy", "glowing", "gnarled", "godly", "golden", "gooey", "gorgeous", "graceful", "gracious", "grainy", "grand", "granular", "grateful", "gratifying", "greasy", "greedy", "greenish", "gregarious", "grimy", "gripping", "gritty", "groggy", "gruesome", "guilty", "gullible", "gusty", "guttural", "habitual", "hairless", "hairy", "half", "handmade", "handy", "haphazard", "hardy", "hasty", "hateful", "haunting", "headstrong", "healing", "heartfelt", "hearty", "heavenly", "hectic", "heinous", "helping", "heroic", "hidden", "high-pitched", "hilarious", "hoarse", "hollow", "homemade", "hopeful", "hospitable", "hostile", "hot-headed", "huge-hearted", "humble", "humdrum", "humid", "humiliated", "humorous", "hungry", "hurried", "husky", "icy", "ideal", "idiotic", "idle", "ignorant", "ill-tempered", "illegal", "illicit", "illuminated", "illusory", "imaginary", "imaginative", "immaculate", "immature", "immeasurable", "immense", "imminent", "immune", "impassable", "impatient", "imperfect", "impish", "impolite", "important", "imposing", "impractical", "impressed", "impure", "inaccurate", "inactive", "inadequate", "inappropriate", "incandescent", "incapable", "incessant", "incoherent", "incompetent", "incredible", "independent", "indigo", "industrious", "inebriated", "inefficient", "inept", "infamous", "inferior", "infuriated", "ingenious", "ingrained", "initial", "injured", "innate", "inoffensive", "insecure", "insightful", "insipid", "instant", "insubstantial", "intense", "intentional", "interactive", "interesting", "internal", "intolerable", "intuitive", "invincible", "invisible", "involved", "irate", "irregular", "irrelevant", "irresistible", "irritated", "itchy", "jaded", "jagged", "jam-packed", "jaunty", "jeering", "jerky", "jocund", "joint", "jovial", "joyous", "jubilant", "judicious", "juicy", "jumbo", "jumpy", "junior", "just", "keen", "key", "kindhearted", "klutzy", "knavish", "knobby", "kooky", "kosher", "lame", "lanky", "lavish", "lawful", "lax", "leafy", "learned", "leathery", "left", "legal", "legitimate", "lengthy", "lesser", "lethal", "level", "lighthearted", "likeable", "limp", "limping", "linear", "literate", "lively", "loathsome", "logical", "lonesome", "longing", "loopy", "loose-fitting", "lopsided", "lost", "loudmouthed", "loveless", "lowly", "loyal", "lucky", "luminous", "lush", "luxurious"  ];
}