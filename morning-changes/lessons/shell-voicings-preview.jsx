import React, { useState } from 'react';

export const shellVoicingsLesson = {
  title: 'Shell Voicings',
  standard: 'Autumn Leaves',
  subtitle: 'A-section survival map',
  duration: '12 min',
  progression: ['cm7', 'F7', 'Bbmaj7', 'Ebmaj7'],
  standardPath: '/standards/autumn-leaves',
  promise: 'Play the first four changes with compact shells before adding color.',
};

const shellVoicings = [
  {
    symbol: 'cm7',
    role: 'ii in Bb',
    grip: 'x-3-5-3-x-x',
    strings: ['x', '3', '5', '3', 'x', 'x'],
    tones: ['mute', 'C', 'Eb', 'Bb', 'mute', 'mute'],
    function: 'R - b3 - b7',
    note: 'Start with the sound of minor color. Keep it small and clean.',
  },
  {
    symbol: 'F7',
    role: 'V7 in Bb',
    grip: 'x-8-7-8-x-x',
    strings: ['x', '8', '7', '8', 'x', 'x'],
    tones: ['mute', 'F', 'A', 'Eb', 'mute', 'mute'],
    function: 'R - 3 - b7',
    note: 'The 3rd and b7 create the dominant pull. Do not bury them.',
  },
  {
    symbol: 'Bbmaj7',
    role: 'I in Bb',
    grip: '6-x-7-7-x-x',
    strings: ['6', 'x', '7', '7', 'x', 'x'],
    tones: ['Bb', 'mute', 'A', 'D', 'mute', 'mute'],
    function: 'R - 7 - 3',
    note: 'This is the resolution. Land here like you meant it.',
  },
  {
    symbol: 'Ebmaj7',
    role: 'IV in Bb',
    grip: 'x-6-5-7-x-x',
    strings: ['x', '6', '5', '7', 'x', 'x'],
    tones: ['mute', 'Eb', 'G', 'D', 'mute', 'mute'],
    function: 'R - 3 - 7',
    note: 'The section opens here. Let the chord breathe.',
  },
];

function ChordDiagram({ chord }) {
  const labels = ['E', 'A', 'D', 'G', 'B', 'e'];

  return (
    <div className="rounded-3xl border border-[#3d3026] bg-[#120f0c] p-5">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <div>
          <h3 className="font-serif text-3xl text-[#f4eee5]">{chord.symbol}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.35em] text-[#b8aa9b]">{chord.role}</p>
        </div>
        <code className="rounded-full border border-[#3d3026] px-3 py-1 text-xs text-[#d7a05b]">{chord.grip}</code>
      </div>

      <div className="grid grid-cols-6 gap-2 text-center text-xs text-[#b8aa9b]">
        {labels.map((label) => <div key={label}>{label}</div>)}
        {chord.strings.map((fret, index) => (
          <div
            key={`${chord.symbol}-${index}`}
            className={
              fret === 'x'
                ? 'grid h-16 place-items-center rounded-2xl border border-[#3d3026] text-[#6f655b]'
                : 'grid h-16 place-items-center rounded-2xl border border-[#d7a05b] bg-[#d7a05b] text-[#120d08]'
            }
          >
            <span className="text-base font-black">{fret}</span>
            <small className="mt-1 block text-[10px] font-bold uppercase">{chord.tones[index] === 'mute' ? '' : chord.tones[index]}</small>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl bg-[#1b1511] p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-[#d7a05b]">{chord.function}</p>
        <p className="mt-2 text-base leading-7 text-[#f4eee5]">{chord.note}</p>
      </div>
    </div>
  );
}

export function ShellVoicingsPreview() {
  const [selected, setSelected] = useState(shellVoicings[0]);

  return (
    <main className="min-h-screen bg-[#080706] text-[#f4eee5]">
      <div className="mx-auto max-w-md px-5 pb-24 pt-6">
        <header className="sticky top-0 z-10 -mx-5 mb-8 border-b border-[#2f261f] bg-[#080706]/90 px-5 py-5 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="text-3xl text-[#d7a05b]">◒</div>
            <div>
              <h1 className="font-serif text-2xl">After Hours</h1>
              <p className="text-[10px] uppercase tracking-[0.45em] text-[#b8aa9b]">Morning Changes</p>
            </div>
          </div>
        </header>

        <section className="mb-9">
          <p className="mb-5 text-xs uppercase tracking-[0.5em] text-[#d7a05b]">Today's Study · {shellVoicingsLesson.duration}</p>
          <h2 className="font-serif text-5xl leading-none">{shellVoicingsLesson.title}</h2>
          <p className="mt-3 font-serif text-2xl italic text-[#b8aa9b]">{shellVoicingsLesson.standard}: {shellVoicingsLesson.subtitle}</p>
          <p className="mt-6 text-lg leading-8 text-[#ded4c9]">{shellVoicingsLesson.promise}</p>
        </section>

        <a href={shellVoicingsLesson.standardPath} className="mb-8 block rounded-3xl border border-[#3d3026] bg-[#15110e] p-5 text-[#f4eee5] no-underline">
          <p className="text-xs uppercase tracking-[0.4em] text-[#d7a05b]">Full Standard</p>
          <p className="mt-2 font-serif text-2xl">Open Autumn Leaves Guide →</p>
        </a>

        <section className="mb-9 rounded-3xl border border-[#3d3026] bg-[#15110e] p-6">
          <p className="mb-4 text-xs uppercase tracking-[0.45em] text-[#d7a05b]">Why this matters</p>
          <p className="text-lg leading-8 text-[#ded4c9]">Shell voicings teach the real voice-leading inside jazz harmony. In Autumn Leaves, the 3rds and 7ths show how the tune moves from minor tension into dominant pull, then resolves into major color.</p>
        </section>

        <section className="mb-9">
          <p className="mb-4 text-xs uppercase tracking-[0.45em] text-[#d7a05b]">Harmonic Map</p>
          <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[#3d3026]">
            {shellVoicings.map((chord) => (
              <button
                key={chord.symbol}
                onClick={() => setSelected(chord)}
                className={
                  selected.symbol === chord.symbol
                    ? 'min-h-24 border border-[#3d3026] bg-[#d7a05b] p-4 text-left text-[#120d08]'
                    : 'min-h-24 border border-[#3d3026] bg-[#120f0c] p-4 text-left text-[#f4eee5]'
                }
              >
                <strong className="block font-serif text-2xl">{chord.symbol}</strong>
                <span className="mt-2 block text-xs uppercase tracking-widest opacity-75">{chord.role}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-9">
          <p className="mb-4 text-xs uppercase tracking-[0.45em] text-[#d7a05b]">Chord Grip</p>
          <ChordDiagram chord={selected} />
        </section>

        <section className="mb-9 rounded-3xl border border-[#3d3026] bg-[#15110e] p-6">
          <p className="mb-4 text-xs uppercase tracking-[0.45em] text-[#d7a05b]">Practice Path</p>
          <ol className="space-y-4 text-lg leading-7 text-[#ded4c9]">
            <li>1. Play each shell once with no tempo.</li>
            <li>2. Move through cm7 → F7 → Bbmaj7 → Ebmaj7.</li>
            <li>3. Repeat at 60 BPM, one chord per bar.</li>
            <li>4. Say the harmonic function while playing.</li>
            <li>5. Finish by listening to one Autumn Leaves recording.</li>
          </ol>
        </section>

        <section className="mb-9 rounded-3xl border border-[#3d3026] bg-[#15110e] p-6">
          <p className="mb-4 text-xs uppercase tracking-[0.45em] text-[#d7a05b]">Listen</p>
          <h3 className="font-serif text-3xl">Cannonball Adderley</h3>
          <p className="mt-3 text-lg leading-8 text-[#ded4c9]">Listen for how the band lets the harmony breathe. Your job today is not to play more notes. It is to hear the important ones.</p>
        </section>

        <footer className="pt-10 text-center text-[10px] uppercase tracking-[0.45em] text-[#756a60]">After Hours · Morning Changes Preview · v0.3 draft</footer>
      </div>
    </main>
  );
}

export default ShellVoicingsPreview;
