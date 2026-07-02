import { useMemo, useState } from 'react';
import { HashRouter, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { AfterHoursAutumnLeavesApp } from './AfterHoursAutumnLeavesApp';
import { AfterHoursFretboardCustomizer } from './AfterHoursFretboardCustomizer';
import { buildChord } from './lib/music';
import { KEYS, type KeyName } from './lib/theory';
import { useMetronome } from './lib/useMetronome';

type IconName = 'home' | 'paths' | 'after' | 'tools' | 'tempo' | 'arrow';
type NavItem = { to: string; label: string; mobileLabel?: string; detail?: string; icon: IconName; end?: boolean };
type StandardEntry = { title: string; subtitle: string; focus: string; href: string };

const navItems: NavItem[] = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/fretboard', label: 'Fretboard', icon: 'paths' },
  { to: '/after-hours', label: 'After Hours', mobileLabel: 'After', detail: 'Standards Library', icon: 'after' },
  { to: '/tools', label: 'Tools', icon: 'tools' }
];

const standards: readonly StandardEntry[] = [
  {
    title: 'Autumn Leaves',
    subtitle: 'Harmony map, focused ii–V–I studies, shell voicings, and an arpeggio play-along.',
    focus: 'ii–V–I voice leading and minor cadences',
    href: '#/after-hours/autumn-leaves'
  }
];

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  if (name === 'home') return <svg {...common}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" /></svg>;
  if (name === 'paths') return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="m15.5 8.5-2.1 5-4.8 2.1 2.1-4.8Z" /></svg>;
  if (name === 'after') return <svg {...common}><path d="M9 18V5l10-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></svg>;
  if (name === 'tools') return <svg {...common}><path d="M4 4v16M20 4v16M4 8h5M15 8h5M4 16h9M17 16h3" /><circle cx="11" cy="8" r="2" /><circle cx="15" cy="16" r="2" /></svg>;
  if (name === 'tempo') return <svg {...common}><path d="M12 3v18" /><path d="M7 7h10M7 17h10" /><path d="M8 7 5 17h14l-3-10" /></svg>;
  return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

function AppLayout() {
  const location = useLocation();
  const [tempo, setTempo] = useState(72);
  const metronome = useMetronome(tempo, setTempo);
  const isAfterHours = location.pathname.startsWith('/after-hours');
  const wordmarkTitle = isAfterHours ? 'After Hours' : 'Morning Changes';
  const wordmarkSubtitle = isAfterHours ? 'Standards Library' : 'Daily guitar practice';

  return <div className="app-shell">
    <header className={`app-topbar ${isAfterHours ? 'after-hours-topbar' : ''}`}>
      <NavLink className="wordmark" to="/">
        <span className={`wordmark-mark ${isAfterHours ? 'after-hours-wordmark-mark' : ''}`}>◒</span>
        <span><strong>{wordmarkTitle}</strong><small>{wordmarkSubtitle}</small></span>
      </NavLink>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.map(item => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? 'active' : ''}><span>{item.label}</span>{item.detail && <small>{item.detail}</small>}</NavLink>)}
      </nav>
      <button className="tempo-button" type="button" onClick={metronome.toggle} aria-label={`${metronome.playing ? 'Stop' : 'Start'} metronome at ${metronome.tempo} BPM`}><Icon name="tempo" size={16} /> {metronome.tempo}</button>
    </header>
    <main className="screen">
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/fretboard" element={<FretboardScreen />} />
        <Route path="/after-hours" element={<AfterHoursScreen />} />
        <Route path="/after-hours/autumn-leaves" element={<AfterHoursAutumnLeavesApp />} />
        <Route path="/after-hours/12-bar-blues" element={<Navigate replace to="/after-hours" />} />
        <Route path="/tools" element={<ToolsScreen metronome={metronome} />} />
        <Route path="/learn" element={<Navigate replace to="/" />} />
        <Route path="/lesson/:lessonId" element={<Navigate replace to="/" />} />
        <Route path="/practice/:kind/:extraId" element={<Navigate replace to="/" />} />
        <Route path="/paths" element={<Navigate replace to="/fretboard" />} />
        <Route path="/profile" element={<Navigate replace to="/" />} />
        <Route path="/progress" element={<Navigate replace to="/" />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </main>
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {navItems.map(item => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => isActive ? 'active' : ''} aria-label={item.label}><Icon name={item.icon} size={19} /><span>{item.mobileLabel ?? item.label}</span></NavLink>)}
    </nav>
  </div>;
}

function ScreenHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return <section className="screen-header"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{copy && <p>{copy}</p>}</section>;
}

function HomeScreen() {
  return <>
    <ScreenHeader eyebrow="Morning Changes" title="Keep the useful parts close." copy="After Hours, the fretboard workspace, and a metronome are the active core while the lesson library is rebuilt properly." />
    <section className="quiet-list core-space-list">
      <span className="list-heading">Core spaces</span>
      <a className="compact-row row-link" href="#/after-hours"><span className="row-icon"><Icon name="after" /></span><span className="row-content"><span className="row-label">Standards library</span><strong>After Hours</strong><small>Apply the tools inside real music, starting with Autumn Leaves.</small></span><span className="row-action">Open <Icon name="arrow" size={16} /></span></a>
      <a className="compact-row row-link" href="#/fretboard"><span className="row-icon"><Icon name="paths" /></span><span className="row-content"><span className="row-label">Shared music engine</span><strong>Fretboard</strong><small>Shapes, chord tones, triads, voicings, and focused neck windows.</small></span><span className="row-action">Open <Icon name="arrow" size={16} /></span></a>
      <a className="compact-row row-link" href="#/tools"><span className="row-icon"><Icon name="tools" /></span><span className="row-content"><span className="row-label">Practice utility</span><strong>Tools</strong><small>Set a tempo and keep time without leaving the workspace.</small></span><span className="row-action">Open <Icon name="arrow" size={16} /></span></a>
    </section>
  </>;
}

function FretboardScreen() {
  const [selectedKey, setSelectedKey] = useState<KeyName>('C');
  const selectedChord = useMemo(() => buildChord(selectedKey, 'major7'), [selectedKey]);
  return <>
    <ScreenHeader eyebrow="Fretboard" title="Explore the neck." copy="Choose a study key, then use the shared full-neck map to inspect shapes, chord tones, voicings, and overlaps." />
    <section className="interval-panel"><div className="interval-panel-head"><div><span className="eyebrow">Study key</span><h3>{selectedKey} major</h3></div><KeySelector selectedKey={selectedKey} onKeyChange={setSelectedKey} /></div></section>
    <AfterHoursFretboardCustomizer key={selectedKey} keyLabel={`${selectedKey} major`} majorRoot={selectedKey} minorRoot={selectedKey} chords={[{ chord: selectedChord, scaleMode: 'major' }]} description={<>Default layers are Pentatonic and Arpeggio. Turn on Triads, CAGED, Scale, Shell, or Drop 2 when you want that context.</>} cagedLabel={`${selectedKey} major forms`} pentatonicLabel={`${selectedKey} minor boxes`} />
  </>;
}

function AfterHoursScreen() {
  return <>
    <ScreenHeader eyebrow="After Hours · Standards Library" title="Standards, without the noise." copy="Use real tunes as the place where the fretboard and theory tools become musical." />
    <section className="standard-shelf">
      {standards.map(standard => <article className="standard-row" key={standard.title}><div><span className="eyebrow">{standard.focus}</span><h2>{standard.title}</h2><p>{standard.subtitle}</p><small>Available now</small></div><a className="secondary-button" href={standard.href}>Open <Icon name="arrow" size={16} /></a></article>)}
    </section>
  </>;
}

function ToolsScreen({ metronome }: { metronome: ReturnType<typeof useMetronome> }) {
  return <>
    <ScreenHeader eyebrow="Tools" title="Keep time. Tune up." />
    <section className="metronome-panel"><span className="eyebrow">Metronome</span><div className="tempo-number">{metronome.tempo}</div><span className="tempo-caption">beats per minute · 4/4</span><div className="beat-row">{[0, 1, 2, 3].map(index => <span className={metronome.playing && metronome.beat === index ? 'active' : ''} key={index} />)}</div><input aria-label="Tempo" type="range" min="35" max="240" value={metronome.tempo} onChange={event => metronome.setTempo(Number(event.target.value))} /><div className="metronome-controls"><button className="secondary-button" type="button" onClick={() => metronome.setTempo(metronome.tempo - 1)} aria-label="Decrease tempo">−</button><button className="primary-button" type="button" onClick={metronome.toggle}>{metronome.playing ? 'Stop' : 'Start'} · {metronome.tempo} BPM</button><button className="secondary-button" type="button" onClick={() => metronome.setTempo(metronome.tempo + 1)} aria-label="Increase tempo">+</button><button className="secondary-button" type="button" onClick={metronome.tapTempo}>Tap</button></div></section>
  </>;
}

function KeySelector({ selectedKey, onKeyChange }: { selectedKey: KeyName; onKeyChange: (key: KeyName) => void }) {
  return <label className="key-selector"><span>Key</span><select value={selectedKey} onChange={event => onKeyChange(event.target.value as KeyName)}>{KEYS.map(key => <option key={key} value={key}>{key}</option>)}</select></label>;
}

export default function App() {
  return <HashRouter><AppLayout /></HashRouter>;
}
