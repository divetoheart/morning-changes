import { buildChord, buildScale, chordSymbol, createKey, displayStringOrder, findGuitarVoicings, functionSymbol, generateVoicing, noteToString, parseChordSymbol, parseNote, positionsForIntervals, resolveLayerCells, STANDARD_TUNING } from './index';

export type MusicEngineContractCase = {
  id: string;
  passed: boolean;
  expected: string;
  actual: string;
};

export type MusicEngineContractResult = {
  passed: boolean;
  cases: MusicEngineContractCase[];
};

function addCase(cases: MusicEngineContractCase[], id: string, expected: string, actual: string) {
  cases.push({ id, expected, actual, passed: expected === actual });
}

/**
 * Contract tests are deliberately dependency-free. They run in development when
 * the shared fretboard loads and provide a stable test surface for later CI wiring.
 */
export function evaluateMusicEngineContract(): MusicEngineContractResult {
  const cases: MusicEngineContractCase[] = [];

  addCase(cases, 'B harmonic minor uses A sharp', 'B C♯ D E F♯ G A♯', buildScale(createKey('B', 'harmonicMinor')).map(item => noteToString(item.note)).join(' '));
  addCase(cases, 'B flat major uses E flat', 'B♭ C D E♭ F G A', buildScale(createKey('B♭', 'major')).map(item => noteToString(item.note)).join(' '));
  addCase(cases, 'F sharp dominant seven spelling', 'F♯ A♯ C♯ E', buildChord('F♯', 'dominant7').tones.map(tone => noteToString(tone.note)).join(' '));
  addCase(cases, 'A half diminished seven spelling', 'A C E♭ G', buildChord('A', 'halfDiminished7').tones.map(tone => noteToString(tone.note)).join(' '));
  addCase(cases, 'C diminished seven preserves theoretical seventh spelling', 'C E♭ G♭ B♭♭', buildChord('C', 'diminished7').tones.map(tone => noteToString(tone.note)).join(' '));
  addCase(cases, 'G augmented spelling', 'G B D♯', buildChord('G', 'augmented').tones.map(tone => noteToString(tone.note)).join(' '));
  addCase(cases, 'Chord parser preserves half diminished', 'Aø7', chordSymbol(parseChordSymbol('Aø7')));
  addCase(cases, 'Half diminished function is one symbol', 'iiø7', functionSymbol({ degree: 'ii', quality: 'halfDiminished7', context: 'minor' }));
  addCase(cases, 'Minor tonic omits redundant m suffix', 'i', functionSymbol({ degree: 'i', quality: 'minor', context: 'minor' }));
  addCase(cases, 'Minor seventh function preserves seventh only', 'ii7', functionSymbol({ degree: 'ii', quality: 'minor7', context: 'major' }));
  addCase(cases, 'Standard tuning display order', '5 4 3 2 1 0', displayStringOrder(STANDARD_TUNING).join(' '));

  const gRoots = positionsForIntervals(parseNote('G'), ['1'], 'root');
  addCase(cases, 'G root exists at low E fret 3', 'true', String(gRoots.some(position => position.stringIndex === 0 && position.fret === 3)));
  addCase(cases, 'G root exists at high e fret 3', 'true', String(gRoots.some(position => position.stringIndex === 5 && position.fret === 3)));
  addCase(cases, 'Root positions use interval label one only', 'true', String(gRoots.every(position => position.interval === '1' && position.role === 'root')));

  const cMajorSeven = buildChord('C', 'major7');
  const cMajorSevenDrop2 = generateVoicing(cMajorSeven, { kind: 'drop2', inversion: 0 });
  addCase(cases, 'C major seven Drop 2 voice order', '5 1 3 7', cMajorSevenDrop2.voices.map(voice => voice.interval).join(' '));
  const cMajorSevenFirstInversionDrop2 = generateVoicing(cMajorSeven, { kind: 'drop2', inversion: 1 });
  addCase(cases, 'C major seven first inversion Drop 2 voice order', '7 3 5 1', cMajorSevenFirstInversionDrop2.voices.map(voice => voice.interval).join(' '));
  const fSevenShell = generateVoicing(buildChord('F', 'dominant7'), { kind: 'shell', includeRoot: true, guideToneOrder: '3-7' });
  addCase(cases, 'F seven shell keeps root third flat seventh', '1 3 b7', fSevenShell.voices.map(voice => voice.interval).join(' '));
  const drop2Candidates = findGuitarVoicings(cMajorSevenDrop2, { stringSet: [2, 3, 4, 5], fretRange: { start: 0, end: 12 } });
  addCase(cases, 'Drop 2 guitar search finds playable D-G-B-e candidate', 'true', String(drop2Candidates.length > 0));
  addCase(cases, 'Guitar candidates ascend in actual pitch', 'true', String(drop2Candidates.every(candidate => candidate.positions.every((position, index, all) => index === 0 || position.midi > all[index - 1].midi))));

  const collision = resolveLayerCells([
    { stringIndex: 0, fret: 3, interval: '1', role: 'root', layer: 'pentatonic' },
    { stringIndex: 0, fret: 3, interval: '5', role: 'chordTone', layer: 'arpeggio' }
  ]);
  addCase(cases, 'Layer collision collapses to one visible cell', '1', String(collision.length));
  addCase(cases, 'Arpeggio focus wins collision label', '5', collision[0]?.primary.interval ?? '');
  addCase(cases, 'Disagreeing layers are marked as conflict', 'conflict', collision[0]?.marker ?? '');
  addCase(cases, 'Conflict retains both layers for detail treatment', 'arpeggio pentatonic', collision[0]?.segments.join(' ') ?? '');

  const agreement = resolveLayerCells([
    { stringIndex: 2, fret: 5, interval: '1', role: 'root', layer: 'pentatonic' },
    { stringIndex: 2, fret: 5, interval: '1', role: 'root', layer: 'arpeggio' }
  ]);
  addCase(cases, 'Agreeing layers are marked as agreement', 'agreement', agreement[0]?.marker ?? '');

  const chromaticRoots = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
  for (const root of chromaticRoots) {
    const scale = buildScale(createKey(root, 'major'));
    const letters = scale.map(item => item.note.letter);
    addCase(cases, `${root} major uses seven letter names`, '7', String(new Set(letters).size));
    addCase(cases, `${root} major begins on its tonic`, root, noteToString(scale[0].note));
  }

  return { passed: cases.every(test => test.passed), cases };
}

export function assertMusicEngineContract(): void {
  const result = evaluateMusicEngineContract();
  if (result.passed) return;
  const failures = result.cases.filter(test => !test.passed).map(test => `${test.id}: expected ${test.expected}, received ${test.actual}`).join('\n');
  throw new Error(`Music engine contract failed:\n${failures}`);
}
