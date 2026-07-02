import { useMemo, type ReactNode } from 'react';
import { ChordNotation, IntervalNotation, NoteNotation } from './MusicNotation';
import { displayStringOrder, noteToString, STANDARD_TUNING, type Chord, type IntervalPosition } from './lib/music';

export type DiagramLabelMode = 'interval' | 'note';

export type GuitarDiagramProps = {
  chord?: Chord;
  title?: ReactNode;
  subtitle?: ReactNode;
  tones: readonly IntervalPosition[];
  labelMode?: DiagramLabelMode;
  /** Keeps compact cards readable even when a voicing uses only one or two frets. */
  minimumFretWindow?: number;
  className?: string;
};

const DISPLAY_STRINGS = displayStringOrder(STANDARD_TUNING).map(stringIndex => ({
  stringIndex,
  label: stringIndex === STANDARD_TUNING.openStrings.length - 1 ? 'e' : noteToString(STANDARD_TUNING.openStrings[stringIndex])
}));

function positionKey(position: Pick<IntervalPosition, 'stringIndex' | 'fret'>) {
  return `${position.stringIndex}:${position.fret}`;
}

/**
 * Shared compact diagram renderer for voicings, triads, chord tones, and future
 * lesson examples. It accepts engine positions only; it has no pitch table, root
 * offsets, string-shape arrays, or display-label parsing.
 */
export function GuitarDiagram({ chord, title, subtitle, tones, labelMode = 'interval', minimumFretWindow = 5, className = '' }: GuitarDiagramProps) {
  const tonesByPosition = useMemo(() => new Map(tones.map(tone => [positionKey(tone), tone])), [tones]);
  const frets = useMemo(() => {
    const usedFrets = tones.map(tone => tone.fret);
    const minimum = Math.min(...usedFrets);
    const maximum = Math.max(...usedFrets);
    const start = minimum === 0 ? 0 : Math.max(0, minimum);
    const end = Math.max(maximum, start + minimumFretWindow - 1);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [minimumFretWindow, tones]);
  const heading = title ?? (chord ? <ChordNotation chord={chord} /> : 'Diagram');

  return <article className={`ah-port-diagram guitar-diagram ${className}`.trim()}>
    <div className="ah-port-diagram-title"><strong>{heading}</strong>{subtitle && <small>{subtitle}</small>}</div>
    <div className="ah-port-neck" aria-label={chord ? `Guitar diagram for ${noteToString(chord.root)}` : 'Guitar diagram'}>
      <div className="ah-port-frets"><span></span>{frets.map(fret => <span key={fret}>{fret}</span>)}</div>
      {DISPLAY_STRINGS.map(string => <div className="ah-port-string" key={string.stringIndex}>
        <b>{string.label}</b>
        {frets.map(fret => {
          const tone = tonesByPosition.get(`${string.stringIndex}:${fret}`);
          return <span key={fret}>{tone && <i className={tone.interval === '1' ? 'root' : ''} aria-label={`${noteToString(tone.note)}, interval ${tone.interval}`}><small>{labelMode === 'note' ? <NoteNotation note={tone.note} /> : <IntervalNotation interval={tone.interval} />}</small></i>}</span>;
        })}
      </div>)}
    </div>
  </article>;
}
