import { buildChord, buildScale, chordSymbol, createKey, displayStringOrder, noteToString, parseNote, positionsForIntervals, STANDARD_TUNING } from './index';

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

function notes(values: ReturnType<typeof buildScale> | ReturnType<typeof buildChord>['tones']) {
  if (Array.isArray(values) && values.length && 'note' in values[0]) return values.map(value => noteToString(value.note)).join(' ');
  return '';
}

/**
 * Contract tests are deliberately dependency-free. They run in development when
 * the shared fretboard loads and provide a stable test surface for later Vitest/CI wiring.
 */
export function evaluateMusicEngineContract(): MusicEngineContractResult {
  const cases: MusicEngineContractCase[] = [];

  addCase(
    cases,
    'B harmonic minor uses A sharp',
    'B C♯ D E F♯ G A♯',
    buildScale(createKey('B', 'harmonicMinor')).map(item => noteToString(item.note)).join(' ')
  );
  addCase(
    cases,
    'B flat major uses E flat',
    'B♭ C D E♭ F G A',
    buildScale(createKey('B♭', 'major')).map(item => noteToString(item.note)).join(' ')
  );
  addCase(
    cases,
    'F sharp dominant seven spelling',
    'F♯ A♯ C♯ E',
    buildChord('F♯', 'dominant7').tones.map(tone => noteToString(tone.note)).join(' ')
  );
  addCase(
    cases,
    'A half diminished seven spelling',
    'A C E♭ G',
    buildChord('A', 'halfDiminished7').tones.map(tone => noteToString(tone.note)).join(' ')
  );
  addCase(
    cases,
    'C diminished seven spelling',
    'C E♭ G♭ A',
    buildChord('C', 'diminished7').tones.map(tone => noteToString(tone.note)).join(' ')
  );
  addCase(
    cases,
    'G augmented spelling',
    'G B D♯',
    buildChord('G', 'augmented').tones.map(tone => noteToString(tone.note)).join(' ')
  );
  addCase(cases, 'Half diminished symbol', 'Aø7', chordSymbol(buildChord('A', 'halfDiminished7')));
  addCase(cases, 'Diminished symbol', 'C°7', chordSymbol(buildChord('C', 'diminished7')));
  addCase(cases, 'Augmented symbol', 'G+', chordSymbol(buildChord('G', 'augmented')));
  addCase(cases, 'Standard tuning display order', '5 4 3 2 1 0', displayStringOrder(STANDARD_TUNING).join(' '));

  const gRoots = positionsForIntervals(parseNote('G'), ['1'], 'root');
  addCase(
    cases,
    'G root exists at low E fret 3',
    'true',
    String(gRoots.some(position => position.stringIndex === 0 && position.fret === 3))
  );
  addCase(
    cases,
    'G root exists at high e fret 3',
    'true',
    String(gRoots.some(position => position.stringIndex === 5 && position.fret === 3))
  );
  addCase(
    cases,
    'Root positions use interval label one only',
    'true',
    String(gRoots.every(position => position.interval === '1' && position.role === 'root'))
  );

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
