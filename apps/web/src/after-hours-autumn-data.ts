import type { ArpType, FormSection, ScaleType, StudyKey } from './after-hours-types';
import { buildChord, type Chord, type ChordQuality, type FunctionalChord } from './lib/music';

type BuiltInChordQuality = Exclude<ChordQuality, 'custom'>;

const MAJOR_II = { degree: 'ii', quality: 'minor7', context: 'major' } satisfies FunctionalChord;
const MAJOR_V = { degree: 'V', quality: 'dominant7', context: 'major' } satisfies FunctionalChord;
const MAJOR_I = { degree: 'I', quality: 'major7', context: 'major' } satisfies FunctionalChord;
const MAJOR_IV = { degree: 'IV', quality: 'major7', context: 'major' } satisfies FunctionalChord;
const MINOR_II = { degree: 'ii', quality: 'halfDiminished7', context: 'minor' } satisfies FunctionalChord;
const MINOR_V = { degree: 'V', quality: 'dominant7', context: 'minor' } satisfies FunctionalChord;
const MINOR_I = { degree: 'i', quality: 'minor', context: 'minor' } satisfies FunctionalChord;
const MINOR_I7 = { degree: 'i', quality: 'minor7', context: 'minor' } satisfies FunctionalChord;

const chord = (root: string, quality: BuiltInChordQuality) => buildChord(root, quality);
const cell = (chordValue: Chord, functional?: FunctionalChord) => ({ chord: chordValue, function: functional });
const bars = (chords: Chord[], functions: readonly FunctionalChord[]) => chords.map((chordValue, index) => [cell(chordValue, functions[index])]);

type AutumnChordSet = {
  ii: Chord;
  V: Chord;
  I: Chord;
  IV: Chord;
  half: Chord;
  minorV: Chord;
  minor: Chord;
  minor7: Chord;
  flatVII: Chord;
};

function makeForm(chords: AutumnChordSet): FormSection[] {
  const first = [chords.ii, chords.V, chords.I, chords.IV, chords.half, chords.minorV, chords.minor, chords.minor];
  const firstFunctions = [MAJOR_II, MAJOR_V, MAJOR_I, MAJOR_IV, MINOR_II, MINOR_V, MINOR_I, MINOR_I];
  return [
    { name: 'A', bars: bars(first, firstFunctions) },
    { name: 'A′', bars: bars(first, firstFunctions) },
    { name: 'B', bars: bars([chords.half, chords.minorV, chords.minor, chords.minor, chords.ii, chords.V, chords.I, chords.I], [MINOR_II, MINOR_V, MINOR_I, MINOR_I, MAJOR_II, MAJOR_V, MAJOR_I, MAJOR_I]) },
    { name: 'C', bars: [
      [cell(chords.half, MINOR_II)],
      [cell(chords.minorV, MINOR_V)],
      [cell(chords.minor, MINOR_I), cell(chords.minor7, MINOR_I7)],
      [cell(chords.ii, MAJOR_II), cell(chords.V, MAJOR_V)],
      [cell(chords.I, MAJOR_I), cell(chords.flatVII)],
      [cell(chords.half, MINOR_II), cell(chords.minorV, MINOR_V)],
      [cell(chords.minor, MINOR_I)],
      [cell(chords.minor, MINOR_I)]
    ] }
  ];
}

const scale = (name: string, description: string, anchor: number, type: ScaleType) => ({ name, description, anchor, type });
const arp = (chordValue: Chord, anchor: number, type: ArpType) => ({ chord: chordValue, anchor, type });

export const AUTUMN_STUDIES: StudyKey[] = [
  {
    id:'gm-bb', label:'G minor / B♭ major', short:'Gm / B♭', minorKey:'G minor', majorKey:'B♭ major', minorRoot:3, majorRoot:6,
    rationale:'The standard modern-jazz setting: Cannonball Adderley’s 1958 recording with Miles Davis made this G minor / B♭ major version a default language for jam sessions and lead sheets.',
    form:makeForm({ ii:chord('C','minor7'), V:chord('F','dominant7'), I:chord('B♭','major7'), IV:chord('E♭','major7'), half:chord('A','halfDiminished7'), minorV:chord('D','dominant7'), minor:chord('G','minor'), minor7:chord('G','minor7'), flatVII:chord('E♭','dominant7') }),
    arpeggios:[arp(chord('C','minor7'),8,'m7'),arp(chord('F','dominant7'),8,'7'),arp(chord('B♭','major7'),6,'maj7'),arp(chord('A','halfDiminished7'),5,'m7b5'),arp(chord('D','dominant7'),5,'7'),arp(chord('G','minor7'),3,'m7')],
    scales:[scale('B♭ major scale','Use over B♭maj7 and E♭maj7',6,'major'),scale('C dorian','Use over Cm7',8,'dorian'),scale('F mixolydian','Use over F7',8,'mixolydian'),scale('D half-whole diminished','Tension over D7 to G minor',5,'halfWhole')],
    modes:[['Cm7','C dorian (notes of B♭ major)','Lean on 9 (D) and 13 (A) for color.'],['F7','F mixolydian','Approach the B♭ landing through F–E♭–D.'],['B♭maj7','B♭ Ionian','Aim for 3 (D) and 9 (C) at downbeats.'],['E♭maj7','E♭ Lydian or B♭ major','Use ♯11 (A) to color this IV.'],['Am7♭5','A locrian ♮2','Highlight E♭ (♭5) and B♮ (9).'],['D7','D phrygian dominant / altered','Resolve E♭ down to D over Gm.'],['Gm','G dorian / harmonic minor','B♭, A, G are strong landings.']]
  },
  {
    id:'em-g', label:'E minor / G major', short:'Em / G', minorKey:'E minor', majorKey:'G major', minorRoot:0, majorRoot:3,
    rationale:'The guitar-friendly open-position study. It is paired with Bill Evans’s Portrait in Jazz as a listening reference, then translated into an E minor / G major fretboard setting where open strings and first-position shapes make the form unusually approachable.',
    form:makeForm({ ii:chord('A','minor7'), V:chord('D','dominant7'), I:chord('G','major7'), IV:chord('C','major7'), half:chord('F♯','halfDiminished7'), minorV:chord('B','dominant7'), minor:chord('E','minor'), minor7:chord('E','minor7'), flatVII:chord('C','dominant7') }),
    arpeggios:[arp(chord('A','minor7'),5,'m7'),arp(chord('D','dominant7'),5,'7'),arp(chord('G','major7'),3,'maj7'),arp(chord('F♯','halfDiminished7'),2,'m7b5'),arp(chord('B','dominant7'),2,'7'),arp(chord('E','minor7'),0,'m7')],
    scales:[scale('G major scale','Use over Gmaj7 and Cmaj7',3,'major'),scale('A dorian','Use over Am7',5,'dorian'),scale('D mixolydian','Use over D7',5,'mixolydian'),scale('B half-whole diminished','Tension over B7 to E minor',2,'halfWhole')],
    modes:[['Am7','A dorian','Hold the 9 (B) and 6 (F♯).'],['D7','D mixolydian','Approach the G landing through F♯ and E.'],['Gmaj7','G Ionian','B and A are resting tones.'],['Cmaj7','C Lydian or G major','F♯ as ♯11 adds shimmer.'],['F♯m7♭5','F♯ locrian ♮2','Aim for C (♭5) and G♯ (9).'],['B7','B phrygian dominant / altered','C♮ and D♮ are upper tensions.'],['Em','E dorian / harmonic minor','Resolve to E or G chord tones.']]
  },
  {
    id:'bm-d', label:'B minor / D major', short:'Bm / D', minorKey:'B minor', majorKey:'D major', minorRoot:7, majorRoot:10,
    rationale:'A guitar-forward B minor / D major study setting tied to Eric Clapton’s 2010 recording. It preserves the tune’s functional movement while putting the minor tonic in a comfortable, singing guitar register.',
    form:makeForm({ ii:chord('E','minor7'), V:chord('A','dominant7'), I:chord('D','major7'), IV:chord('G','major7'), half:chord('C♯','halfDiminished7'), minorV:chord('F♯','dominant7'), minor:chord('B','minor'), minor7:chord('B','minor7'), flatVII:chord('G','dominant7') }),
    arpeggios:[arp(chord('E','minor7'),7,'m7'),arp(chord('A','dominant7'),5,'7'),arp(chord('D','major7'),10,'maj7'),arp(chord('C♯','halfDiminished7'),9,'m7b5'),arp(chord('F♯','dominant7'),2,'7'),arp(chord('B','minor7'),7,'m7')],
    scales:[scale('D major scale','Use over Dmaj7 and Gmaj7',10,'major'),scale('E dorian','Use over Em7',7,'dorian'),scale('A mixolydian','Use over A7',5,'mixolydian'),scale('F♯ half-whole diminished','Tension over F♯7 to B minor',2,'halfWhole')],
    modes:[['Em7','E dorian','Use F♯ (9) and C♯ (13) for lift.'],['A7','A mixolydian','Target C♯ and G on the change.'],['Dmaj7','D Ionian','F♯ and C♯ are bright landings.'],['Gmaj7','G Lydian or D major','C♯ is the reflective ♯11.'],['C♯m7♭5','C♯ locrian ♮2','Use G (♭5) and D♯ (9) to lean toward F♯7.'],['F♯7','F♯ phrygian dominant / altered','Resolve G down to F♯ or A into Bm.'],['Bm','B natural / harmonic minor','B, D, F♯ are home-base notes.']]
  }
];
