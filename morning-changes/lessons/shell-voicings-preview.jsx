import React, { useState } from 'react';
import { LessonHero } from '../components/LessonHero.jsx';
import { StandardLink } from '../components/StandardLink.jsx';
import { HarmonicMap } from '../components/HarmonicMap.jsx';
import { ChordDiagram } from '../components/ChordDiagram.jsx';
import { PracticePath } from '../components/PracticePath.jsx';
import { ListeningCard } from '../components/ListeningCard.jsx';

export const shellVoicingsLesson = {
  title: 'Shell Voicings',
  standard: 'Autumn Leaves',
  subtitle: 'A-section survival map',
  duration: '12 min',
  progression: ['cm7', 'F7', 'Bbmaj7', 'Ebmaj7'],
  standardPath: '/standards/autumn-leaves',
  promise: 'Play the first four changes with compact shells before adding color.',
  why: 'Shell voicings teach the real voice-leading inside jazz harmony. In Autumn Leaves, the 3rds and 7ths show how the tune moves from minor tension into dominant pull, then resolves into major color.',
  practice: [
    'Play each shell once with no tempo.',
    'Move through cm7 -> F7 -> Bbmaj7 -> Ebmaj7.',
    'Repeat at 60 BPM, one chord per bar.',
    'Say the harmonic function while playing.',
    'Finish by listening to one Autumn Leaves recording.',
  ],
  listening: {
    artist: 'Cannonball Adderley',
    note: 'Listen for how the band lets the harmony breathe. Your job today is not to play more notes. It is to hear the important ones.',
  },
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

        <LessonHero lesson={shellVoicingsLesson} />
        <StandardLink href={shellVoicingsLesson.standardPath} title={shellVoicingsLesson.standard} />

        <section className="mb-9 rounded-3xl border border-[#3d3026] bg-[#15110e] p-6">
          <p className="mb-4 text-xs uppercase tracking-[0.45em] text-[#d7a05b]">Why this matters</p>
          <p className="text-lg leading-8 text-[#ded4c9]">{shellVoicingsLesson.why}</p>
        </section>

        <HarmonicMap chords={shellVoicings} selected={selected} onSelect={setSelected} />

        <section className="mb-9">
          <p className="mb-4 text-xs uppercase tracking-[0.45em] text-[#d7a05b]">Chord Grip</p>
          <ChordDiagram chord={selected} />
        </section>

        <PracticePath items={shellVoicingsLesson.practice} />
        <ListeningCard artist={shellVoicingsLesson.listening.artist} note={shellVoicingsLesson.listening.note} />

        <footer className="pt-10 text-center text-[10px] uppercase tracking-[0.45em] text-[#756a60]">After Hours - Morning Changes Preview - v0.3 draft</footer>
      </div>
    </main>
  );
}

export default ShellVoicingsPreview;
