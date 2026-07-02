export type LetterName = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export type AccidentalOffset = -3 | -2 | -1 | 0 | 1 | 2 | 3;
export type PitchClass = number;

export type SpelledNote = {
  letter: LetterName;
  accidental: AccidentalOffset;
  pitchClass: PitchClass;
};

export type IntervalName =
  | '1' | 'b2' | '2' | '#2' | 'b3' | '3' | '4' | '#4' | 'b5' | '5' | '#5' | 'b6' | '6' | 'bb7' | 'b7' | '7'
  | 'b9' | '9' | '#9' | '11' | '#11' | 'b13' | '13';

export type IntervalDefinition = {
  name: IntervalName;
  semitones: number;
  diatonicSteps: number;
};

export type ScaleMode =
  | 'major'
  | 'naturalMinor'
  | 'harmonicMinor'
  | 'melodicMinor'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'locrian';

export type KeyContext = {
  tonic: SpelledNote;
  mode: ScaleMode;
};

export type ChordQuality =
  | 'major'
  | 'minor'
  | 'dominant7'
  | 'major7'
  | 'minor7'
  | 'halfDiminished7'
  | 'diminished'
  | 'diminished7'
  | 'augmented'
  | 'sus2'
  | 'sus4'
  | 'add9'
  | 'add11'
  | 'add13'
  | 'dominant9'
  | 'dominant11'
  | 'dominant13'
  | 'major9'
  | 'major11'
  | 'major13'
  | 'minor9'
  | 'minor11'
  | 'minor13'
  | 'custom';

export type Chord = {
  root: SpelledNote;
  quality: ChordQuality;
  tones: Array<{ interval: IntervalName; note: SpelledNote }>;
  /** Readable engine-generated label for a user-built chord. */
  label?: string;
};

export type TriadQuality = 'major' | 'minor' | 'diminished' | 'augmented';
export type TriadInversion = 0 | 1 | 2;
export type TriadTone = { interval: '1' | 'b3' | '3' | 'b5' | '5' | '#5'; note: SpelledNote };
export type Triad = {
  root: SpelledNote;
  quality: TriadQuality;
  tones: readonly [TriadTone, TriadTone, TriadTone];
};

export type RomanDegree = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII' | 'i' | 'ii' | 'iii' | 'iv' | 'v' | 'vi' | 'vii';

export type FunctionalChord = {
  degree: RomanDegree;
  quality: ChordQuality;
  context?: 'major' | 'minor';
};

export type StringTuning = {
  id: string;
  label: string;
  /** Low-to-high string order. The renderer may reverse this for display. */
  openStrings: readonly SpelledNote[];
  /** Absolute MIDI pitch for each open string, in the same low-to-high order. */
  openMidi: readonly number[];
};

export type FretRange = {
  start: number;
  end: number;
};

export type FretPosition = {
  stringIndex: number;
  fret: number;
  pitchClass: PitchClass;
  midi: number;
};

export type IntervalPosition = FretPosition & {
  interval: IntervalName;
  note: SpelledNote;
  role: 'root' | 'chordTone' | 'scaleTone' | 'shapeTone';
};

export type ShapeCell = {
  /** Low-to-high string index, relative to the template anchor. */
  stringDelta: number;
  fretDelta: number;
  interval: IntervalName;
};

export type ShapeTemplate = {
  id: string;
  family: 'caged' | 'pentatonic' | 'arpeggio' | 'triad' | 'shell' | 'custom';
  label: string;
  anchor: {
    stringIndex: number;
    interval: IntervalName;
  };
  cells: readonly ShapeCell[];
  visual: {
    colorId: string;
    zoneId?: string;
  };
};

export type PlacedShapeTone = IntervalPosition & {
  shapeId: string;
  shapeFamily: ShapeTemplate['family'];
  colorId: string;
};

export type VoicingRecipe =
  | { kind: 'closed'; inversion: 0 | 1 | 2 | 3 }
  | { kind: 'drop2'; inversion: 0 | 1 | 2 | 3 }
  | { kind: 'shell'; includeRoot?: boolean; includeFifth?: boolean; guideToneOrder?: '3-7' | '7-3' };

export type VoicingVoice = {
  interval: IntervalName;
  note: SpelledNote;
  /** Relative height from the theoretical root pitch, in semitones. */
  relativeSemitones: number;
};

export type GeneratedVoicing = {
  chord: Chord;
  recipe: VoicingRecipe;
  /** Low-to-high theoretical voice order after inversion/drop treatment. */
  voices: readonly VoicingVoice[];
};

export type GeneratedTriadInversion = {
  triad: Triad;
  inversion: TriadInversion;
  voices: readonly VoicingVoice[];
};

export type GuitarVoicingCandidate = {
  voicing: GeneratedVoicing;
  /** One fretboard location per low-to-high voice. */
  positions: readonly IntervalPosition[];
  stringSet: readonly number[];
  fretSpan: number;
};

export type MusicToken =
  | { kind: 'text'; value: string }
  | { kind: 'key'; key: KeyContext }
  | { kind: 'note'; note: SpelledNote }
  | { kind: 'chord'; chord: Chord }
  | { kind: 'function'; function: FunctionalChord }
  | { kind: 'interval'; interval: IntervalName }
  | { kind: 'fret'; value: number }
  | { kind: 'bar'; value: number }
  | { kind: 'string'; value: string };
