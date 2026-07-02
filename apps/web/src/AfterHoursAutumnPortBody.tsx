import { useMemo, useState } from 'react';
import { AUTUMN_STUDIES } from './after-hours-autumn-data';
import { AutumnPortIntro, AutumnPortFooter } from './AutumnPortEditorial';
import { AfterHoursFretboardCustomizer } from './AfterHoursFretboardCustomizer';
import { FormMap } from './AfterHoursDiagrams';
import { KeyArrangementReference } from './AfterHoursStandardSections';
import { KeyNotation } from './MusicNotation';
import { chordSymbol, createKey, functionSymbol, type ScaleMode } from './lib/music';

const REFERENCES: Record<string, { title: string; copy: string; href: string }> = {
  'gm-bb': { title: 'Cannonball Adderley with Miles Davis · Somethin’ Else · recorded 1958', copy: 'The canonical modern-jazz arrangement: a G minor / B♭ major setting with Miles Davis’s spacious theme statement and Cannonball Adderley’s alto defining the session vocabulary for the tune.', href: 'https://www.youtube.com/watch?v=u37RF5xKNq8' },
  'em-g': { title: 'Bill Evans Trio · Portrait in Jazz · recorded 1959, released 1960', copy: 'A guitarist-friendly E minor / G major study setting paired with Evans’s trio version. The open-position landscape makes the changes easy to inspect while Evans, LaFaro, and Motian demonstrate why the form should never sound mechanical.', href: 'https://www.youtube.com/watch?v=r-Z8KuwI7Gc' },
  'bm-d': { title: 'Eric Clapton · Clapton · released 2010', copy: 'Use this B minor / D major setting as the dedicated guitar-focused study route: a lower minor center, familiar closed-position shapes, and the same major-to-minor functional movement.', href: 'https://www.youtube.com/results?search_query=Eric+Clapton+Autumn+Leaves+Clapton+2010' }
};

function scaleModeForAutumnCell(cell: { chord: { quality: string }; function?: { quality: string; context?: 'major' | 'minor'; degree: string } }): ScaleMode {
  const quality = cell.function?.quality ?? cell.chord.quality;
  if (quality === 'halfDiminished7' || quality === 'diminished' || quality === 'diminished7') return 'locrian';
  if (quality === 'dominant7' || quality === 'dominant9' || quality === 'dominant11' || quality === 'dominant13') return 'mixolydian';
  if (quality === 'minor' || quality === 'minor7' || quality === 'minor9' || quality === 'minor11' || quality === 'minor13') return cell.function?.context === 'minor' ? 'naturalMinor' : 'dorian';
  return cell.function?.degree === 'IV' ? 'lydian' : 'major';
}

export function AfterHoursAutumnPortBody() {
  const [keyId, setKeyId] = useState('gm-bb');
  const study = useMemo(() => AUTUMN_STUDIES.find(item => item.id === keyId) ?? AUTUMN_STUDIES[0], [keyId]);
  const reference = REFERENCES[study.id];
  const minorContext = useMemo(() => createKey(study.minorKey.split(' ')[0], 'naturalMinor'), [study.minorKey]);
  const majorContext = useMemo(() => createKey(study.majorKey.split(' ')[0], 'major'), [study.majorKey]);
  const keyPair = <><KeyNotation context={minorContext} /> / <KeyNotation context={majorContext} /></>;
  const formProgression = useMemo(() => study.form.flatMap(section => section.bars).flatMap(bar => bar).map(cell => ({
    chord: cell.chord,
    scaleMode: scaleModeForAutumnCell(cell),
    functionLabel: cell.function ? functionSymbol(cell.function) : undefined
  })), [study.form]);
  const formChords = useMemo(() => {
    const seen = new Set<string>();
    return formProgression.filter(option => {
      const symbol = chordSymbol(option.chord);
      if (seen.has(symbol)) return false;
      seen.add(symbol);
      return true;
    });
  }, [formProgression]);

  return <article className="ah-port ah-piece" data-music-context="true">
    <AutumnPortIntro />
    <section className="ah-port-keybar">
      <div>
        <span className="eyebrow">Choose a key</span>
        <h2>{keyPair}</h2>
        <p>{study.rationale}</p>
        <KeyArrangementReference title={reference.title} copy={reference.copy} href={reference.href} />
      </div>
      <div className="ah-port-segments" role="tablist" aria-label="Autumn Leaves key studies">{AUTUMN_STUDIES.map(item => <button type="button" key={item.id} aria-selected={item.id === study.id} className={item.id === study.id ? 'active' : ''} onClick={() => setKeyId(item.id)}>{item.short}</button>)}</div>
    </section>
    <section className="ah-piece-section ah-study-changes">
      <div className="ah-piece-section-head"><div><span className="eyebrow">Study changes</span><h2>Follow the whole form.</h2><p>Read the harmonic map before you touch the neck. The selected-key arrangement always keeps the same relative-major / relative-minor movement intact.</p></div></div>
      <FormMap form={study.form} />
    </section>
    <AfterHoursFretboardCustomizer
      key={`${study.id}-whole-form`}
      compact
      expandHref="#/fretboard"
      fretRange={{ start: 7, end: 11 }}
      keyLabel={keyPair}
      majorRoot={study.majorKey.split(' ')[0]}
      minorRoot={study.minorKey.split(' ')[0]}
      chords={formChords}
      progression={formProgression}
      defaultLayers={{ pentatonic: false, triad: false, arpeggio: true, targets: false }}
      cagedLabel={<><KeyNotation context={majorContext} /> positions</>}
      pentatonicLabel={<><KeyNotation context={minorContext} /> boxes</>}
      eyebrow="Apply this in Autumn Leaves"
      heading="Whole form at 8th position."
      description={<>Stay in one neighborhood while the form moves underneath you. Switch through every chord printed above, then use target tones to hear where the guide tones actually resolve before adding shapes or voicings.</>}
    />
    <AutumnPortFooter study={study} onSwitchKey={setKeyId} />
  </article>;
}
