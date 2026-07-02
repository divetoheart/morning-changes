import { buildChord, buildScale, CAGED_MAJOR_FORM_ORDER, chordSymbol, createKey, displayStringOrder, findGuitarVoicings, functionSymbol, generateCagedMajorCycle, generateCagedMajorForm, generateVoicing, noteToString, parseChordSymbol, parseNote, positionsForIntervals, resolveLayerCells, STANDARD_TUNING } from './index';

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

function doesThrow(action: () => unknown): boolean {
  try { action(); return false; } catch { return true; }
}

/**
 * Contract tests are deliberately dependency-free. They run in development and
 * CI, covering the engine's musical spelling, guitar geometry, and collision rules.
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
  addCase(cases, 'Conflict retains both layers for detail treatment', 'arpeggio pentatonic', collision[0]?.segments.map(segment => segment.layer).join(' ') ?? '');

  const agreement = resolveLayerCells([
    { stringIndex: 2, fret: 5, interval: '1', role: 'root', layer: 'pentatonic' },
    { stringIndex: 2, fret: 5, interval: '1', role: 'root', layer: 'arpeggio' }
  ]);
  addCase(cases, 'Agreeing layers are marked as agreement', 'agreement', agreement[0]?.marker ?? '');
  const cagedCollision = resolveLayerCells([
    { stringIndex: 4, fret: 5, interval: '1', role: 'root', layer: 'caged', variant: 'C-form', colorId: 'caged-c' },
    { stringIndex: 4, fret: 5, interval: '3', role: 'shapeTone', layer: 'caged', variant: 'A-form', colorId: 'caged-a' }
  ], { focusLayer: 'caged' });
  addCase(cases, 'CAGED collision retains individual form colors', 'caged-c caged-a', cagedCollision[0]?.segments.map(segment => segment.colorId).join(' ') ?? '');

  const cMajorCycle = generateCagedMajorCycle('C');
  addCase(cases, 'CAGED cycle uses C A G E D order', 'C A G E D', cMajorCycle.map(shape => shape.form).join(' '));
  addCase(cases, 'C major CAGED skeleton frets are canonical', 'C:3 2 0 1 0|A:3 5 5 5 3|G:8 7 5 5 5 8|E:8 10 10 9 8 8|D:10 12 13 12', cMajorCycle.map(shape => `${shape.form}:${shape.positions.map(position => position.fret).join(' ')}`).join('|'));
  addCase(cases, 'C major CAGED forms preserve parent string counts', '5 5 6 6 4', cMajorCycle.map(shape => shape.positions.length).join(' '));

  const chromaticRoots = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
  for (const root of chromaticRoots) {
    const scale = buildScale(createKey(root, 'major'));
    const letters = scale.map(item => item.note.letter);
    addCase(cases, `${root} major uses seven letter names`, '7', String(new Set(letters).size));
    addCase(cases, `${root} major begins on its tonic`, root, noteToString(scale[0].note));

    for (const form of CAGED_MAJOR_FORM_ORDER) {
      const shape = generateCagedMajorForm(form, root);
      addCase(cases, `${root} ${form}-form uses only 1 3 5`, 'true', String(shape.positions.every(position => ['1', '3', '5'].includes(position.interval))));
      addCase(cases, `${root} ${form}-form exposes the selected root`, 'true', String(shape.positions.some(position => position.interval === '1' && noteToString(position.note) === noteToString(parseNote(root)))));
    }
  }

  const dropDTuning = { ...STANDARD_TUNING, id: 'drop-d-contract', openMidi: [38, 45, 50, 55, 59, 64] };
  addCase(cases, 'CAGED refuses unvalidated alternate tuning geometry', 'true', String(doesThrow(() => generateCagedMajorForm('E', 'C', dropDTuning))));

  return { passed: cases.every(test => test.passed), cases };
}

export function assertMusicEngineContract(): void {
  const result = evaluateMusicEngineContract();
  if (result.passed) return;
  const failures = result.cases.filter(test => !test.passed).map(test => `${test.id}: expected ${test.expected}, received ${test.actual}`).join('\n');
  throw new Error(`Music engine contract failed:\n${failures}`);
}
