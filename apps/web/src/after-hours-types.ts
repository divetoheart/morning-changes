export type ArpType = 'maj7' | 'm7' | '7' | 'm7b5';
export type ScaleType = 'major' | 'dorian' | 'mixolydian' | 'halfWhole';
export type HarmonyCell = { label: string; roman?: string };
export type FormSection = { name: string; bars: HarmonyCell[][] };
export type StudyKey = {
  id: string;
  label: string;
  short: string;
  minorKey: string;
  majorKey: string;
  minorRoot: number;
  majorRoot: number;
  rationale: string;
  form: FormSection[];
  arpeggios: Array<{ chord: string; anchor: number; type: ArpType }>;
  scales: Array<{ name: string; description: string; anchor: number; type: ScaleType }>;
  modes: Array<[string, string, string]>;
};
