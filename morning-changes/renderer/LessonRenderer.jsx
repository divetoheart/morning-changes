import React, { useState } from 'react';
import { LessonHero } from '../components/LessonHero.jsx';
import { StandardLink } from '../components/StandardLink.jsx';
import { HarmonicMap } from '../components/HarmonicMap.jsx';
import { ChordDiagram } from '../components/ChordDiagram.jsx';
import { PracticePath } from '../components/PracticePath.jsx';
import { ListeningCard } from '../components/ListeningCard.jsx';

export function LessonRenderer({ lesson }) {
  const [selected, setSelected] = useState(lesson.voicings?.[0]);

  return (
    <>
      <LessonHero lesson={lesson} />
      <StandardLink href={lesson.standardPath} title={lesson.standard} />
      <HarmonicMap chords={lesson.voicings} selected={selected} onSelect={setSelected} />
      {selected && <ChordDiagram chord={selected} />}
      <PracticePath items={lesson.practice} />
      <ListeningCard artist={lesson.listening.artist} note={lesson.listening.note} />
    </>
  );
}
