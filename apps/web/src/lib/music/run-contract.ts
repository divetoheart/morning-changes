import { evaluateMusicEngineContract, type MusicEngineContractCase } from './contract';
import { chordSymbol, parseChordSymbol } from './harmony';
import { noteToString } from './pitch';
import { generateVoicing } from './voicings';

const baseResult = evaluateMusicEngineContract();
const extensionCases: MusicEngineContractCase[] = [];

function addCase(id: string, expected: string, actual: string) {
  extensionCases.push({ id, expected, actual, passed: expected === actual });
}

const cAdd9 = parseChordSymbol('Cadd9');
const dSus4 = parseChordSymbol('Dsus4');
addCase('C nine keeps dominant seventh and ninth spelling', 'C E G B♭ D', parseChordSymbol('C9').tones.map(tone => noteToString(tone.note)).join(' '));
addCase('F thirteen keeps dominant extension spelling', 'F A C E♭ G D', parseChordSymbol('F13').tones.map(tone => noteToString(tone.note)).join(' '));
addCase('B flat add nine preserves added ninth spelling', 'B♭ D F C', parseChordSymbol('B♭add9').tones.map(tone => noteToString(tone.note)).join(' '));
addCase('D minor eleven keeps third seventh ninth and eleventh', 'D F A C E G', parseChordSymbol('Dm11').tones.map(tone => noteToString(tone.note)).join(' '));
addCase('Generic sus resolves to sus4', 'Dsus4', chordSymbol(parseChordSymbol('Dsus')));
addCase('Sus four uses no third', 'D G A', dSus4.tones.map(tone => noteToString(tone.note)).join(' '));
addCase('Add nine shell falls back to root third fifth', '1 3 5', generateVoicing(cAdd9, { kind: 'shell', includeRoot: true }).voices.map(voice => voice.interval).join(' '));
addCase('Sus four shell falls back to root suspension fifth', '1 4 5', generateVoicing(dSus4, { kind: 'shell', includeRoot: true }).voices.map(voice => voice.interval).join(' '));

const cases = [...baseResult.cases, ...extensionCases];
export const musicEngineContractResult = { passed: cases.every(test => test.passed), cases };
