import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { ChordNotation, IntervalNotation, NoteNotation } from './MusicNotation';
import { displayStringOrder, noteToString, STANDARD_TUNING, type Chord, type IntervalPosition } from './lib/music';

export type DiagramLabelMode = 'interval' | 'note';
export type GuitarDiagramProps = {
  chord?: Chord;
  title?: ReactNode;
  subtitle?: ReactNode;
  tones: readonly IntervalPosition[];
  labelMode?: DiagramLabelMode;
  minimumFretWindow?: number;
  className?: string;
};

const DISPLAY_STRINGS = displayStringOrder(STANDARD_TUNING).map(stringIndex => ({
  stringIndex,
  label: stringIndex === STANDARD_TUNING.openStrings.length - 1 ? 'e' : noteToString(STANDARD_TUNING.openStrings[stringIndex])
}));
function positionKey(position: Pick<IntervalPosition, 'stringIndex' | 'fret'>) { return `${position.stringIndex}:${position.fret}`; }

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
  const gridStyle: CSSProperties = { gridTemplateColumns: `28px repeat(${frets.length}, minmax(42px, 1fr))` };
  const heading = title ?? (chord ? <ChordNotation chord={chord} /> : 'Diagram');

  return <article className={`ah-port-diagram guitar-diagram ${className}`.trim()}>
    <div className="ah-port-diagram-title"><strong>{heading}</strong>{subtitle && <small>{subtitle}</small>}</div>
    <div className="ah-port-neck" aria-label={chord ? `Guitar diagram for ${noteToString(chord.root)}` : 'Guitar diagram'}>
      <div className="ah-port-frets" style={gridStyle}><span></span>{frets.map(fret => <span key={fret}>{fret}</span>)}</div>
      {DISPLAY_STRINGS.map(string => <div className="ah-port-string" style={gridStyle} key={string.stringIndex}><b>{string.label}</b>{frets.map(fret => {
        const tone = tonesByPosition.get(`${string.stringIndex}:${fret}`);
        return <span key={fret}>{tone && <i className={tone.interval === '1' ? 'root' : ''} aria-label={`${noteToString(tone.note)}, interval ${tone.interval}`}><small>{labelMode === 'note' ? <NoteNotation note={tone.note} /> : <IntervalNotation interval={tone.interval} />}</small></i>}</span>;
      })}</div>)}
    </div>
  </article>;
}