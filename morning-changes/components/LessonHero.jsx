import React from 'react';

export function LessonHero({ lesson }) {
  return (
    <section className="mb-9">
      <p className="mb-5 text-xs uppercase tracking-[0.5em] text-[#d7a05b]">
        Today's Study · {lesson.duration}
      </p>
      <h2 className="font-serif text-5xl leading-none">{lesson.title}</h2>
      <p className="mt-3 font-serif text-2xl italic text-[#b8aa9b]">
        {lesson.standard}: {lesson.subtitle}
      </p>
      <p className="mt-6 text-lg leading-8 text-[#ded4c9]">{lesson.promise}</p>
    </section>
  );
}
