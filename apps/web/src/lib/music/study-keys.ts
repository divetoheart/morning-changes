export const STUDY_KEY_SIGNATURES = [
  { id: 'C', label: 'C' },
  { id: 'G', label: 'G' },
  { id: 'D', label: 'D' },
  { id: 'A', label: 'A' },
  { id: 'E', label: 'E' },
  { id: 'B', label: 'B' },
  { id: 'F#', label: 'F♯' },
  { id: 'C#', label: 'C♯' },
  { id: 'F', label: 'F' },
  { id: 'Bb', label: 'B♭' },
  { id: 'Eb', label: 'E♭' },
  { id: 'Ab', label: 'A♭' },
  { id: 'Db', label: 'D♭' },
  { id: 'Gb', label: 'G♭' },
  { id: 'Cb', label: 'C♭' }
] as const;

export type StudyKeyId = (typeof STUDY_KEY_SIGNATURES)[number]['id'];
export type StudyMode = 'major' | 'minor';
