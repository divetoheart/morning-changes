import type { ArpType, FormSection, ScaleType, StudyKey } from './after-hours-types';

const bars = (labels: string[], roman?: string[]) => labels.map((label, index) => [{ label, roman: roman?.[index] }]);

function makeForm(chords: { ii: string; V: string; I: string; IV: string; half: string; minorV: string; minor: string; minor7: string; flatVII: string }): FormSection[] {
  const first = [chords.ii, chords.V, chords.I, chords.IV, chords.half, chords.minorV, chords.minor, chords.minor];
  return [
    { name: 'A', bars: bars(first, ['iiⁿ','V⁷','Iᶜ','IVᶜ','iiø','V⁷/i','i','i']) },
    { name: 'A′', bars: bars(first) },
    { name: 'B', bars: bars([chords.half,chords.minorV,chords.minor,chords.minor,chords.ii,chords.V,chords.I,chords.I]) },
    { name: 'C', bars: [[{label:chords.half}],[{label:chords.minorV}],[{label:chords.minor},{label:chords.minor7}],[{label:chords.ii},{label:chords.V}],[{label:chords.I},{label:chords.flatVII}],[{label:chords.half},{label:chords.minorV}],[{label:chords.minor}],[{label:chords.minor}]] }
  ];
}

const scale = (name: string, description: string, anchor: number, type: ScaleType) => ({ name, description, anchor, type });
const arp = (chord: string, anchor: number, type: ArpType) => ({ chord, anchor, type });

export const AUTUMN_STUDIES: StudyKey[] = [
  {
    id:'gm-bb', label:'G minor / B♭ major', short:'Gm / B♭', minorKey:'G minor', majorKey:'B♭ major', minorRoot:3, majorRoot:6,
    rationale:'Modern jazz/session standard key. Cannonball Adderley’s Somethin’ Else (1958) with Miles Davis is the canonical recording in this key, and it sits comfortably for horns and most piano players.',
    form:makeForm({ ii:'Cm7',V:'F7',I:'B♭maj7',IV:'E♭maj7',half:'Am7♭5',minorV:'D7',minor:'Gm',minor7:'Gm7',flatVII:'E♭7' }),
    arpeggios:[arp('Cm7',8,'m7'),arp('F7',8,'7'),arp('B♭maj7',6,'maj7'),arp('Am7♭5',5,'m7b5'),arp('D7',5,'7'),arp('Gm',3,'m7')],
    scales:[scale('B♭ major scale','Use over B♭maj7 and E♭maj7',6,'major'),scale('C dorian','Use over Cm7',8,'dorian'),scale('F mixolydian','Use over F7',8,'mixolydian'),scale('D half-whole diminished','Tension over D7 to G minor',5,'halfWhole')],
    modes:[['Cm7','C dorian (notes of B♭ major)','Lean on 9 (D) and 13 (A) for color.'],['F7','F mixolydian','Approach the B♭ landing through F–E♭–D.'],['B♭maj7','B♭ Ionian','Aim for 3 (D) and 9 (C) at downbeats.'],['E♭maj7','E♭ Lydian or B♭ major','Use ♯11 (A) to color this IV.'],['Am7♭5','A locrian ♮2','Highlight E♭ (♭5) and B♮ (9).'],['D7','D phrygian dominant / altered','Resolve E♭ down to D over Gm.'],['Gm','G dorian / harmonic minor','B♭, A, G are strong landings.']]
  },
  {
    id:'em-g', label:'E minor / G major', short:'Em / G', minorKey:'E minor', majorKey:'G major', minorRoot:0, majorRoot:3,
    rationale:'The common guitar-friendly Real Book key. Open-string color, every essential change reachable in first position, and a clean way to learn the form before moving to closed positions.',
    form:makeForm({ ii:'Am7',V:'D7',I:'Gmaj7',IV:'Cmaj7',half:'F♯m7♭5',minorV:'B7',minor:'Em',minor7:'Em7',flatVII:'C7' }),
    arpeggios:[arp('Am7',5,'m7'),arp('D7',5,'7'),arp('Gmaj7',3,'maj7'),arp('F♯m7♭5',2,'m7b5'),arp('B7',2,'7'),arp('Em',0,'m7')],
    scales:[scale('G major scale','Use over Gmaj7 and Cmaj7',3,'major'),scale('A dorian','Use over Am7',5,'dorian'),scale('D mixolydian','Use over D7',5,'mixolydian'),scale('B half-whole diminished','Tension over B7 to E minor',2,'halfWhole')],
    modes:[['Am7','A dorian','Hold the 9 (B) and 6 (F♯).'],['D7','D mixolydian','Approach the G landing through F♯ and E.'],['Gmaj7','G Ionian','B and A are resting tones.'],['Cmaj7','C Lydian or G major','F♯ as ♯11 adds shimmer.'],['F♯m7♭5','F♯ locrian ♮2','Aim for C (♭5) and G♯ (9).'],['B7','B phrygian dominant / altered','C♮ and D♮ are upper tensions.'],['Em','E dorian / harmonic minor','Resolve to E or G chord tones.']]
  },
  {
    id:'bm-d', label:'B minor / D major', short:'Clapton · Bm / D', minorKey:'B minor', majorKey:'D major', minorRoot:7, majorRoot:10,
    rationale:'Clapton study key. Eric Clapton included “Autumn Leaves” on his 2010 album Clapton; this Bm / D guitar study keeps the tune in a vocal, guitar-forward register while preserving its original harmonic function.',
    form:makeForm({ ii:'Em7',V:'A7',I:'Dmaj7',IV:'Gmaj7',half:'C♯m7♭5',minorV:'F♯7',minor:'Bm',minor7:'Bm7',flatVII:'G7' }),
    arpeggios:[arp('Em7',7,'m7'),arp('A7',5,'7'),arp('Dmaj7',10,'maj7'),arp('C♯m7♭5',9,'m7b5'),arp('F♯7',2,'7'),arp('Bm',7,'m7')],
    scales:[scale('D major scale','Use over Dmaj7 and Gmaj7',10,'major'),scale('E dorian','Use over Em7',7,'dorian'),scale('A mixolydian','Use over A7',5,'mixolydian'),scale('F♯ half-whole diminished','Tension over F♯7 to B minor',2,'halfWhole')],
    modes:[['Em7','E dorian','Use F♯ (9) and C♯ (13) for lift.'],['A7','A mixolydian','Target C♯ and G on the change.'],['Dmaj7','D Ionian','F♯ and C♯ are bright landings.'],['Gmaj7','G Lydian or D major','C♯ is the reflective ♯11.'],['C♯m7♭5','C♯ locrian ♮2','Use G (♭5) and D♯ (9) to lean toward F♯7.'],['F♯7','F♯ phrygian dominant / altered','Resolve G down to F♯ or A into Bm.'],['Bm','B natural / harmonic minor','B, D, F♯ are home-base notes.']]
  }
];
