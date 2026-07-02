import { evaluateMusicEngineContract, type MusicEngineContractCase } from './contract';
import { chordSymbol, parseChordSymbol } from './harmony';
import { noteToString } from './pitch';
import { guideToneVoiceLeading } from './voice-leading';
import { generateVoicing } from './voicings';

const baseResult = evaluateMusicEngineContract();
const extensionCases: MusicEngineContractCase[] = [];

function addCase(id: string, expected: string, actual: string) {
  extensionCases.push({ id, expected, actual, passed: expected === actual });
}

const cAdd9 = parseChordSymbol('Cadd9');
const dSus4 = parseChordSymbol('Dsus4');
const dm7 = parseChordSymbol('Dm7');
const g7 = parseChordSymbol('G7');
const cMaj7 = parseChordSymbol('Cmaj7');
addCase('C nine keeps dominant seventh and ninth spelling', 'C E G B♭ D', parseChordSymbol('C9').tones.map(tone => noteToString(tone.note)).join(' '));
addCase('F thirteen keeps dominant extension spelling', 'F A C E♭ G D', parseChordSymbol('F13').tones.map(tone => noteToString(tone.note)).join(' '));
addCase('B flat add nine preserves added ninth spelling', 'B♭ D F C', parseChordSymbol('B♭add9').tones.map(tone => noteToString(tone.note)).join(' '));
addCase('D minor eleven keeps third seventh ninth and eleventh', 'D F A C E G', parseChordSymbol('Dm11').tones.map(tone => noteToString(tone.note)).join(' '));
addCase('Generic sus resolves to sus4', 'Dsus4', chordSymbol(parseChordSymbol('Dsus')));
addCase('Sus four uses no third', 'D G A', dSus4.tones.map(tone => noteToString(tone.note)).join(' '));
addCase('Major six slash nine parses as a practical five-tone chord', 'C D E G A', parseChordSymbol('C6/9').tones.map(tone => noteToString(tone.note)).join(' '));
addCase('Minor major seven preserves its major seventh', 'C E♭ G B', parseChordSymbol('CmMaj7').tones.map(tone => noteToString(tone.note)).join(' '));
addCase('Dominant flat nine spells its altered color correctly', 'C E G B♭ D♭', parseChordSymbol('C7b9').tones.map(tone => noteToString(tone.note)).join(' '));
addCase('Dominant sharp eleven spells its raised fourth correctly', 'C E G B♭ F♯', parseChordSymbol('C7#11').tones.map(tone => noteToString(tone.note)).join(' '));
addCase('Dominant sus four keeps the seventh', 'D G A C', parseChordSymbol('D7sus4').tones.map(tone => noteToString(tone.note)).join(' '));
addCase('Add nine shell falls back to root third fifth', '1 3 5', generateVoicing(cAdd9, { kind: 'shell', includeRoot: true }).voices.map(voice => voice.interval).join(' '));
addCase('Sus four shell falls back to root suspension fifth', '1 4 5', generateVoicing(dSus4, { kind: 'shell', includeRoot: true }).voices.map(voice => voice.interval).join(' '));
addCase('ii to V keeps the common guide tone and resolves the seventh', 'b3>b7:0 b7>3:-1', guideToneVoiceLeading(dm7, g7).map(item => `${item.from.interval}>${item.to.interval}:${item.semitones}`).join(' '));
addCase('V to I resolves third up and flat seventh down', '3>1:1 b7>3:-1', guideToneVoiceLeading(g7, cMaj7).map(item => `${item.from.interval}>${item.to.interval}:${item.semitones}`).join(' '));

const cases = [...baseResult.cases, ...extensionCases];
export const musicEngineContractResult = { passed: cases.every(test => test.passed), cases };
