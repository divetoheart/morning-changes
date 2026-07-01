import { Fragment, type ReactNode } from 'react';
import {
  chordQualitySuffix,
  chordSymbol,
  functionSymbol,
  noteToString,
  parseChordSymbol,
  type Chord,
  type ChordQuality,
  type FunctionalChord,
  type IntervalName,
  type KeyContext,
  type MusicToken,
  type SpelledNote
} from './lib/music';

function qualityClass(quality: ChordQuality): string {
  if (quality === 'halfDiminished7') return 'is-half-diminished';
  if (quality === 'diminished' || quality === 'diminished7') return 'is-diminished';
  if (quality === 'augmented') return 'is-augmented';
  return '';
}

function keyModeLabel(mode: KeyContext['mode']): string {
  if (mode === 'naturalMinor') return 'minor';
  if (mode === 'harmonicMinor') return 'harmonic minor';
  if (mode === 'melodicMinor') return 'melodic minor';
  return mode;
}

export function ChordNotation({ chord, className = '' }: { chord: Chord; className?: string }) {
  const suffix = chordQualitySuffix(chord.quality);
  const styleClass = qualityClass(chord.quality);
  return <span className={`chord-symbol ${styleClass} ${className}`.trim()} data-music-token="chord" aria-label={chordSymbol(chord)}>
    <span className="chord-root">{chord.root.letter}</span>
    {chord.root.accidental !== 0 && <sup className="music-accidental">{noteToString(chord.root).slice(1)}</sup>}
    {suffix && <sup className={`chord-quality ${styleClass}`.trim()}>{suffix}</sup>}
  </span>;
}

/** Transitional adapter for existing data labels. New content should pass structured Chord data. */
export function ChordFromSymbol({ value, className }: { value: string; className?: string }) {
  return <ChordNotation chord={parseChordSymbol(value)} className={className} />;
}

export function FunctionNotation({ functional, className = '' }: { functional: FunctionalChord; className?: string }) {
  const suffix = chordQualitySuffix(functional.quality);
  const styleClass = qualityClass(functional.quality);
  return <span className={`function-symbol ${styleClass} ${className}`.trim()} data-music-token="function" aria-label={functionSymbol(functional)}>
    <em>{functional.degree}</em>
    {suffix && <sup className={styleClass}>{suffix}</sup>}
  </span>;
}

export function IntervalNotation({ interval, className = '' }: { interval: IntervalName; className?: string }) {
  const accidental = interval.startsWith('bb') ? '♭♭' : interval.startsWith('b') ? '♭' : interval.startsWith('##') ? '♯♯' : interval.startsWith('#') ? '♯' : '';
  const degree = interval.replace(/^(bb|b|##|#)/, '');
  return <span className={`interval-symbol ${className}`.trim()} data-music-token="interval" aria-label={`interval ${interval}`}>
    {accidental && <sup className="music-accidental">{accidental}</sup>}
    <b>{degree}</b>
  </span>;
}

export function KeyNotation({ context, className = '' }: { context: KeyContext; className?: string }) {
  return <strong className={`key-name ${className}`.trim()} data-music-token="key">{noteToString(context.tonic)} {keyModeLabel(context.mode)}</strong>;
}

export function NoteNotation({ note, className = '' }: { note: SpelledNote; className?: string }) {
  return <span className={`note-symbol ${className}`.trim()} data-music-token="note">{noteToString(note)}</span>;
}

export function FretNumber({ value, className = '' }: { value: number; className?: string }) {
  return <span className={`fret-number ${className}`.trim()} data-music-token="fret">{value}</span>;
}

export function BarNumber({ value, className = '' }: { value: number; className?: string }) {
  return <span className={`bar-number ${className}`.trim()} data-music-token="bar">{value}</span>;
}

export function MusicTokenList({ tokens }: { tokens: readonly MusicToken[] }): ReactNode {
  return tokens.map((token, index) => {
    if (token.kind === 'text') return <Fragment key={index}>{token.value}</Fragment>;
    if (token.kind === 'key') return <KeyNotation key={index} context={token.key} />;
    if (token.kind === 'note') return <NoteNotation key={index} note={token.note} />;
    if (token.kind === 'chord') return <ChordNotation key={index} chord={token.chord} />;
    if (token.kind === 'function') return <FunctionNotation key={index} functional={token.function} />;
    if (token.kind === 'interval') return <IntervalNotation key={index} interval={token.interval} />;
    if (token.kind === 'fret') return <FretNumber key={index} value={token.value} />;
    if (token.kind === 'bar') return <BarNumber key={index} value={token.value} />;
    return <span key={index} data-music-token="string">{token.value}</span>;
  });
}
