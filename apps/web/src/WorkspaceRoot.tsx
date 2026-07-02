import { useEffect, useMemo, useRef, useState } from 'react';
import { HashRouter, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AfterHoursAutumnPort } from './AfterHoursAutumnPort';
import { AfterHoursBluesApp } from './AfterHoursBluesApp';
import { ExplorerFretboard, type ExplorerSetup } from './ExplorerFretboard';
import { buildChord, chordSymbol, createKey, noteToString, type ChordQuality, type ScaleMode } from './lib/music';

const STORAGE_KEY = 'morning-changes.workspace.v2';
const ROOTS = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'] as const;
const MODES: ReadonlyArray<{ value: ScaleMode; label: string }> = [
  { value: 'major', label: 'Major' }, { value: 'naturalMinor', label: 'Natural minor' }, { value: 'harmonicMinor', label: 'Harmonic minor' },
  { value: 'melodicMinor', label: 'Melodic minor' }, { value: 'dorian', label: 'Dorian' }, { value: 'phrygian', label: 'Phrygian' },
  { value: 'lydian', label: 'Lydian' }, { value: 'mixolydian', label: 'Mixolydian' }, { value: 'locrian', label: 'Locrian' }
];
const QUALITIES: ReadonlyArray<{ value: ChordQuality; label: string }> = [
  { value: 'major', label: 'Major' }, { value: 'minor', label: 'Minor' }, { value: 'dominant7', label: 'Dominant 7' },
  { value: 'major7', label: 'Major 7' }, { value: 'minor7', label: 'Minor 7' }, { value: 'halfDiminished7', label: 'Half diminished' },
  { value: 'diminished', label: 'Diminished' }, { value: 'diminished7', label: 'Diminished 7' }, { value: 'augmented', label: 'Augmented' },
  { value: 'sus2', label: 'Sus2' }, { value: 'sus4', label: 'Sus4' }
];
const DEFAULT_SETUP: ExplorerSetup = { root: 'C', scaleMode: 'major', chordQuality: 'major7', view: 'layers' };
type RecentStandard = 'autumn-leaves' | '12-bar-blues';
type WorkspaceState = { setup: ExplorerSetup; recentStandard?: RecentStandard; updatedAt?: string };

function loadState(): WorkspaceState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { setup: DEFAULT_SETUP };
    const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
    const setup = { ...DEFAULT_SETUP, ...(parsed.setup ?? {}) };
    const validRoot = ROOTS.includes(setup.root as (typeof ROOTS)[number]);
    const validMode = MODES.some(item => item.value === setup.scaleMode);
    const validQuality = QUALITIES.some(item => item.value === setup.chordQuality);
    const validView = setup.view === 'layers' || setup.view === 'roots';
    if (!validRoot || !validMode || !validQuality || !validView) return { setup: DEFAULT_SETUP };
    return { setup, recentStandard: parsed.recentStandard, updatedAt: parsed.updatedAt };
  } catch {
    return { setup: DEFAULT_SETUP };
  }
}

function NavItem({ to, children }: { to: string; children: string }) {
  return <NavLink end={to === '/'} to={to} className={({ isActive }) => isActive ? 'active' : undefined}>{children}</NavLink>;
}

function PageHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return <header className="workspace-page-header"><span className="workspace-eyebrow">{eyebrow}</span><h1>{title}</h1>{copy && <p>{copy}</p>}</header>;
}

function AppShell() {
  const [workspace, setWorkspace] = useState<WorkspaceState>(loadState);
  useEffect(() => { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace)); }, [workspace]);
  const updateSetup = (setup: ExplorerSetup) => setWorkspace(previous => ({ ...previous, setup, updatedAt: new Date().toISOString() }));
  const openStandard = (recentStandard: RecentStandard) => setWorkspace(previous => ({ ...previous, recentStandard, updatedAt: new Date().toISOString() }));

  return <div className="workspace-app">
    <header className="workspace-topbar">
      <NavLink className="workspace-brand" to="/" aria-label="Morning Changes home"><span className="workspace-brand-mark">M</span><span><strong>Morning Changes</strong><small>guitar workspace</small></span></NavLink>
      <nav className="workspace-nav" aria-label="Primary navigation"><NavItem to="/">Home</NavItem><NavItem to="/learn">Learn</NavItem><NavItem to="/after-hours">After Hours</NavItem><NavItem to="/fretboard">Fretboard</NavItem><NavItem to="/tools">Tools</NavItem><NavItem to="/profile">Profile</NavItem></nav>
    </header>
    <main className="workspace-main"><Routes>
      <Route path="/" element={<HomePage state={workspace} />} />
      <Route path="/learn" element={<LearnPage />} />
      <Route path="/after-hours" element={<AfterHoursCatalog onOpen={openStandard} />} />
      <Route path="/after-hours/autumn-leaves" element={<StandardFrame label="After Hours · Autumn Leaves"><AfterHoursAutumnPort /></StandardFrame>} />
      <Route path="/after-hours/12-bar-blues" element={<StandardFrame label="After Hours · 12-Bar Blues"><AfterHoursBluesApp /></StandardFrame>} />
      <Route path="/fretboard" element={<FretboardPage setup={workspace.setup} onChange={updateSetup} />} />
      <Route path="/tools" element={<ToolsPage />} />
      <Route path="/profile" element={<ProfilePage state={workspace} onReset={() => setWorkspace({ setup: DEFAULT_SETUP })} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes></main>
    <nav className="workspace-bottom-nav" aria-label="Primary navigation"><NavItem to="/">Home</NavItem><NavItem to="/after-hours">After Hours</NavItem><NavItem to="/fretboard">Fretboard</NavItem><NavItem to="/tools">Tools</NavItem><NavItem to="/profile">Profile</NavItem></nav>
  </div>;
}

function HomePage({ state }: { state: WorkspaceState }) {
  const navigate = useNavigate();
  const chord = buildChord(state.setup.root, state.setup.chordQuality);
  const recent = state.recentStandard === 'autumn-leaves' ? 'Autumn Leaves' : state.recentStandard === '12-bar-blues' ? '12-Bar Blues' : 'Choose a standard';
  return <section className="workspace-page workspace-home">
    <PageHeader eyebrow="Morning Changes" title="A clear place to play." copy="Explore the neck, study a tune, or keep time. Nothing is asking you to keep up." />
    <section className="workspace-hero-card"><div><span className="workspace-eyebrow">Start here</span><h2>What are you working on?</h2><p>Use the fretboard when you want a visual answer. Open After Hours when you want to hear the idea inside music.</p></div><div className="workspace-hero-actions"><button type="button" className="workspace-primary" onClick={() => navigate('/fretboard')}>Explore the fretboard</button><button type="button" className="workspace-secondary" onClick={() => navigate('/after-hours')}>Study a standard</button><button type="button" className="workspace-secondary" onClick={() => navigate('/tools')}>Open tools</button></div></section>
    <section className="workspace-section"><div className="workspace-section-heading"><span className="workspace-eyebrow">Continue</span><h2>Right where you left it.</h2></div><div className="workspace-continue-grid"><button type="button" className="workspace-continue-card" onClick={() => navigate('/fretboard')}><span className="workspace-card-kicker">Fretboard Explorer</span><strong>{chordSymbol(chord)} · {MODES.find(item => item.value === state.setup.scaleMode)?.label}</strong><small>{state.setup.view === 'roots' ? 'Root map' : 'Shapes and positions'} · reopen setup</small></button><button type="button" className="workspace-continue-card" onClick={() => navigate('/after-hours')}><span className="workspace-card-kicker">After Hours</span><strong>{recent}</strong><small>Standards are the authored music side of the workspace.</small></button></div></section>
    <section className="workspace-section"><div className="workspace-section-heading"><span className="workspace-eyebrow">Quick starts</span><h2>Go straight to music.</h2></div><div className="workspace-quick-grid"><QuickStart title="Autumn Leaves" copy="Harmony, form, listening, and the whole neck." onClick={() => navigate('/after-hours/autumn-leaves')} /><QuickStart title="12-Bar Blues" copy="I–IV–V form, dominant language, and slow-blues space." onClick={() => navigate('/after-hours/12-bar-blues')} /><QuickStart title="Fretboard Explorer" copy="Choose a root, chord, scale, and shape layer." onClick={() => navigate('/fretboard')} /><QuickStart title="Metronome" copy="Set a tempo and leave the clutter behind." onClick={() => navigate('/tools')} /></div></section>
  </section>;
}

function QuickStart({ title, copy, onClick }: { title: string; copy: string; onClick: () => void }) {
  return <button type="button" className="workspace-quick-card" onClick={onClick}><strong>{title}</strong><small>{copy}</small><span>Open →</span></button>;
}

function LearnPage() {
  return <section className="workspace-page workspace-learn"><PageHeader eyebrow="Learn" title="Built after the tools." copy="Structured lessons return after the reusable music components are polished." /><section className="workspace-empty-state"><span className="workspace-eyebrow">In rebuild</span><h2>No filler curriculum.</h2><p>For now, use the Fretboard Explorer for hands-on study and After Hours for complete musical contexts.</p><ol><li><span>1</span>Roots and intervals</li><li><span>2</span>Triads and chord tones</li><li><span>3</span>Guide tones and voice leading</li><li><span>4</span>Standards application</li></ol></section></section>;
}

function AfterHoursCatalog({ onOpen }: { onOpen: (standard: RecentStandard) => void }) {
  const navigate = useNavigate();
  const open = (standard: RecentStandard) => { onOpen(standard); navigate(standard === 'autumn-leaves' ? '/after-hours/autumn-leaves' : '/after-hours/12-bar-blues'); };
  return <section className="workspace-page workspace-after-hours"><PageHeader eyebrow="After Hours · Standards Library" title="Music, not exercises." copy="Each study is a place to hear harmony, see it on the neck, and keep returning to the tune." /><div className="workspace-standard-grid"><article className="workspace-standard-card"><span className="workspace-card-kicker">Standard 01 · available</span><h2>Autumn Leaves</h2><p>Major and minor cadences, form awareness, arpeggio connection, and a full-neck study space in three useful key centers.</p><button type="button" className="workspace-primary" onClick={() => open('autumn-leaves')}>Open Autumn Leaves</button></article><article className="workspace-standard-card"><span className="workspace-card-kicker">Standard 02 · available</span><h2>12-Bar Blues</h2><p>One durable form. Explore dominant movement, minor blues, phrasing space, and the guitar shapes that make the cycle audible.</p><button type="button" className="workspace-primary" onClick={() => open('12-bar-blues')}>Open 12-Bar Blues</button></article></div></section>;
}

function StandardFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return <section className="workspace-standard-frame"><div className="workspace-standard-back"><NavLink to="/after-hours">← {label}</NavLink></div>{children}</section>;
}

function FretboardPage({ setup, onChange }: { setup: ExplorerSetup; onChange: (setup: ExplorerSetup) => void }) {
  const chord = useMemo(() => buildChord(setup.root, setup.chordQuality), [setup.root, setup.chordQuality]);
  const key = useMemo(() => createKey(setup.root, setup.scaleMode), [setup.root, setup.scaleMode]);
  return <section className="workspace-page workspace-fretboard"><PageHeader eyebrow="Fretboard Explorer" title="One neck. Your context." copy="Pick a root, chord, and scale context, then turn on only the information you want." />
    <section className="workspace-explorer-controls" aria-label="Fretboard controls"><label><span>Root / key</span><select value={setup.root} onChange={event => onChange({ ...setup, root: event.target.value })}>{ROOTS.map(root => <option key={root} value={root}>{root}</option>)}</select></label><label><span>Scale / mode</span><select value={setup.scaleMode} onChange={event => onChange({ ...setup, scaleMode: event.target.value as ScaleMode })}>{MODES.map(mode => <option key={mode.value} value={mode.value}>{mode.label}</option>)}</select></label><label><span>Chord quality</span><select value={setup.chordQuality} onChange={event => onChange({ ...setup, chordQuality: event.target.value as ChordQuality })}>{QUALITIES.map(quality => <option key={quality.value} value={quality.value}>{quality.label}</option>)}</select></label><fieldset className="workspace-view-toggle"><legend>View</legend><button type="button" className={setup.view === 'layers' ? 'active' : ''} aria-pressed={setup.view === 'layers'} onClick={() => onChange({ ...setup, view: 'layers' })}>Layers</button><button type="button" className={setup.view === 'roots' ? 'active' : ''} aria-pressed={setup.view === 'roots'} onClick={() => onChange({ ...setup, view: 'roots' })}>Roots</button></fieldset></section>
    <section className="workspace-explorer-summary"><div><span className="workspace-card-kicker">Current context</span><strong>{noteToString(key.tonic)} {MODES.find(item => item.value === setup.scaleMode)?.label} · {chordSymbol(chord)}</strong><small>Use the controls directly beneath the neck to turn layers on or off.</small></div><button type="button" className="workspace-secondary" onClick={() => onChange(DEFAULT_SETUP)}>Reset explorer</button></section>
    <ExplorerFretboard setup={setup} />
  </section>;
}

function ToolsPage() {
  const [tempo, setTempo] = useState(72);
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const interval = useRef<number | null>(null);
  const context = useRef<AudioContext | null>(null);
  const stop = () => { if (interval.current !== null) window.clearInterval(interval.current); interval.current = null; setPlaying(false); setBeat(0); };
  const click = (accent: boolean) => {
    const audio = context.current ?? new AudioContext();
    context.current = audio;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.frequency.value = accent ? 1180 : 840;
    gain.gain.setValueAtTime(0.0001, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.1, audio.currentTime + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.04);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.05);
  };
  const start = () => {
    stop();
    let nextBeat = 0;
    click(true);
    interval.current = window.setInterval(() => { nextBeat = (nextBeat + 1) % 4; setBeat(nextBeat); click(nextBeat === 0); }, Math.round(60000 / tempo));
    setPlaying(true);
  };
  useEffect(() => () => { if (interval.current !== null) window.clearInterval(interval.current); }, []);
  return <section className="workspace-page workspace-tools"><PageHeader eyebrow="Tools" title="Keep time." copy="Small utility. No hidden course layer, no runtime music-engine test on this page." /><section className="workspace-tool-card"><div><span className="workspace-eyebrow">Metronome</span><h2>{tempo}<small> BPM</small></h2><p>4/4 · beat {beat + 1}</p><div className="workspace-beats">{[0, 1, 2, 3].map(index => <span key={index} className={playing && beat === index ? 'active' : ''} />)}</div></div><div className="workspace-metronome-controls"><input aria-label="Tempo" type="range" min="35" max="240" value={tempo} onChange={event => setTempo(Number(event.target.value))} /><div><button className="workspace-secondary" type="button" onClick={() => setTempo(value => Math.max(35, value - 1))}>−</button><button className="workspace-primary" type="button" onClick={() => playing ? stop() : start()}>{playing ? 'Stop' : 'Start'} · {tempo} BPM</button><button className="workspace-secondary" type="button" onClick={() => setTempo(value => Math.min(240, value + 1))}>+</button></div></div></section><section className="workspace-empty-tool"><span className="workspace-card-kicker">Planned utility</span><strong>Chromatic tuner</strong><small>Pitch detection is not part of this release yet.</small></section></section>;
}

function ProfilePage({ state, onReset }: { state: WorkspaceState; onReset: () => void }) {
  const navigate = useNavigate();
  const chord = buildChord(state.setup.root, state.setup.chordQuality);
  const latest = state.updatedAt ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(state.updatedAt)) : 'Not saved yet';
  const standard = state.recentStandard === 'autumn-leaves' ? 'Autumn Leaves' : state.recentStandard === '12-bar-blues' ? '12-Bar Blues' : 'No standard opened yet';
  return <section className="workspace-page workspace-profile"><PageHeader eyebrow="Profile" title="Your musical workspace." copy="Useful state, not a scoreboard." /><section className="workspace-profile-grid"><article><span className="workspace-card-kicker">Saved fretboard setup</span><strong>{chordSymbol(chord)}</strong><small>{state.setup.view === 'roots' ? 'Root map' : 'Layer map'} · saved {latest}</small><button type="button" className="workspace-inline-link" onClick={() => navigate('/fretboard')}>Open explorer →</button></article><article><span className="workspace-card-kicker">Recent standard</span><strong>{standard}</strong><small>Return to authored music whenever you want context.</small><button type="button" className="workspace-inline-link" onClick={() => navigate('/after-hours')}>Open After Hours →</button></article></section><section className="workspace-note-card"><span className="workspace-eyebrow">Progress later</span><p>Saved presets, favorite voicings, and real practice history belong here eventually. Lesson-completion pressure does not.</p><button type="button" className="workspace-danger-link" onClick={onReset}>Reset saved workspace</button></section></section>;
}

export default function WorkspaceRoot() {
  return <HashRouter><AppShell /></HashRouter>;
}
