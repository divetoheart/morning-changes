import { useMemo, useState } from 'react';
import { AUTUMN_STUDIES } from './after-hours-autumn-data';
import { AutumnStudyViews, type AutumnView } from './AutumnStudyViews';
import { AutumnPortIntro, AutumnPortFooter } from './AutumnPortEditorial';

const VIEWS: Array<{ id: AutumnView; label: string }> = [
  { id:'chords',label:'Chords' }, { id:'caged',label:'CAGED' }, { id:'pentatonic',label:'Pentatonic' }, { id:'arpeggios',label:'Arpeggios' }, { id:'scales',label:'Scales' }
];

export function AfterHoursAutumnPortBody() {
  const [keyId, setKeyId] = useState('gm-bb');
  const [view, setView] = useState<AutumnView>('chords');
  const study = useMemo(() => AUTUMN_STUDIES.find(item => item.id === keyId) ?? AUTUMN_STUDIES[0], [keyId]);
  return <article className="ah-port" data-music-context="true">
    <AutumnPortIntro />
    <section className="ah-port-keybar"><div><span className="eyebrow">Choose a key</span><h2>{study.label}</h2><p>{study.rationale}</p></div><div className="ah-port-segments" role="tablist" aria-label="Autumn Leaves key studies">{AUTUMN_STUDIES.map(item => <button type="button" key={item.id} aria-selected={item.id === study.id} className={item.id === study.id ? 'active' : ''} onClick={() => setKeyId(item.id)}>{item.short}</button>)}</div></section>
    <nav className="ah-port-tabs" aria-label="Autumn Leaves study views">{VIEWS.map(item => <button type="button" key={item.id} className={item.id === view ? 'active' : ''} onClick={() => setView(item.id)}>{item.label}</button>)}</nav>
    <AutumnStudyViews study={study} view={view} />
    <AutumnPortFooter study={study} />
  </article>;
}
