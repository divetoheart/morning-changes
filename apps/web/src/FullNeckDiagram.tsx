import { useMemo, type ReactNode } from 'react';
import { IntervalNotation, NoteNotation } from './MusicNotation';
import { DEFAULT_FRET_RANGE, displayStringOrder, noteToString, STANDARD_TUNING, type IntervalPosition } from './lib/music';

export type FullNeckDiagramProps = {
  title: ReactNode;
  description?: ReactNode;
  tones: readonly IntervalPosition[];
  fretStart?: number;
  fretEnd?: number;
  labelMode?: 'interval' | 'note' | 'both';
  className?: string;
};

const DISPLAY_STRINGS = displayStringOrder(STANDARD_TUNING).map(stringIndex => ({
  stringIndex,
  label: stringIndex === STANDARD_TUNING.openStrings.length - 1 ? 'e' : noteToString(STANDARD_TUNING.openStrings[stringIndex])
}));

export function FullNeckDiagram({ title, description, tones, fretStart = DEFAULT_FRET_RANGE.start, fretEnd = DEFAULT_FRET_RANGE.end, labelMode = 'both', className = '' }: FullNeckDiagramProps) {
  const frets = useMemo(() => Array.from({ length: fretEnd - fretStart + 1 }, (_, index) => fretStart + index), [fretStart, fretEnd]);
  const tonesByPosition = useMemo(() => new Map(tones.map(tone => [`${tone.stringIndex}:${tone.fret}`, tone])), [tones]);

  return <section className={`fretboard-card shared-full-neck ${className}`.trim()}>
    <div><span className="eyebrow">Fretboard visual</span><h2>{title}</h2>{description && <p>{description}</p>}</div>
    <div className="fretboard-scroll" tabIndex={0} role="region" aria-label="Full fretboard diagram"><div className="fretboard">
      <div className="fret-row fret-numbers"><span></span>{frets.map(fret => <span key={fret}>{fret}</span>)}</div>
      {DISPLAY_STRINGS.map(string => <div className="fret-row" key={string.stringIndex}><b>{string.label}</b>{frets.map(fret => {
        const tone = tonesByPosition.get(`${string.stringIndex}:${fret}`);
        return <span className={tone ? 'has-dot' : ''} key={fret}>{tone && <i className={tone.interval === '1' ? 'root' : ''}>
          {labelMode !== 'note' && <strong><IntervalNotation interval={tone.interval} /></strong>}
          {labelMode !== 'interval' && <small><NoteNotation note={tone.note} /></small>}
        </i>}</span>;
      })}</div>)}
    </div></div>
  </section>;
}