import { useMemo, useState } from 'react';
import { AUTUMN_STUDIES } from './after-hours-autumn-data';
import { AutumnPortIntro, AutumnPortFooter } from './AutumnPortEditorial';
import { AfterHoursFretboardCustomizer } from './AfterHoursFretboardCustomizer';
import { FormMap } from './AfterHoursDiagrams';
import { KeyArrangementReference } from './AfterHoursStandardSections';

const REFERENCES: Record<string, { title: string; copy: string; href: string }> = {
  'gm-bb': {
    title: 'Cannonball Adderley with Miles Davis · Somethin’ Else · recorded 1958',
    copy: 'The canonical modern-jazz arrangement: a G minor / B♭ major setting with Miles Davis’s spacious theme statement and Cannonball Adderley’s alto defining the session vocabulary for the tune.',
    href: 'https://www.youtube.com/watch?v=u37RF5xKNq8'
  },
  'em-g': {
    title: 'Bill Evans Trio · Portrait in Jazz · recorded 1959, released 1960',
    copy: 'A guitarist-friendly E minor / G major study setting paired with Evans’s trio version. The open-position landscape makes the changes easy to inspect while Evans, LaFaro, and Motian demonstrate why the form should never sound mechanical.',
    href: 'https://www.youtube.com/watch?v=r-Z8KuwI7Gc'
  },
  'bm-d': {
    title: 'Eric Clapton · Clapton · released 2010',
    copy: 'Use this B minor / D major setting as the dedicated guitar-focused study route: a lower minor center, familiar closed-position shapes, and the same major-to-minor functional movement.',
    href: 'https://www.youtube.com/results?search_query=Eric+Clapton+Autumn+Leaves+Clapton+2010'
  }
};

export function AfterHoursAutumnPortBody() {
  const [keyId, setKeyId] = useState('gm-bb');
  const study = useMemo(() => AUTUMN_STUDIES.find(item => item.id === keyId) ?? AUTUMN_STUDIES[0], [keyId]);
  const reference = REFERENCES[study.id];
  const uniqueChords = [...new Set(study.form.flatMap(section => section.bars.flat().map(cell => cell.label)))].filter(label => !label.includes('/'));

  return <article className="ah-port ah-piece" data-music-context="true">
    <AutumnPortIntro />
    <section className="ah-port-keybar">
      <div>
        <span className="eyebrow">Choose a key</span>
        <h2>{study.label}</h2>
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
      keyLabel={study.short}
      majorRoot={study.majorKey.split(' ')[0]}
      minorRoot={study.minorKey.split(' ')[0]}
      chords={uniqueChords.map(label => ({ label }))}
      cagedLabel={`${study.majorKey} positions`}
      pentatonicLabel={`${study.minorKey} boxes`}
      description="Toggle the maps you need on the same full neck. CAGED tracks the relative-major world; pentatonic tracks the minor color; arpeggio and scale layers follow the active chord."
    />
    <AutumnPortFooter study={study} onSwitchKey={setKeyId} />
  </article>;
}
