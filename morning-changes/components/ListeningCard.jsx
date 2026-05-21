import React from 'react';

export function ListeningCard({ artist, note }) {
  return (
    <section className="mb-9 rounded-3xl border border-[#3d3026] bg-[#15110e] p-6">
      <p className="mb-4 text-xs uppercase tracking-[0.45em] text-[#d7a05b]">Listen</p>
      <h3 className="font-serif text-3xl">{artist}</h3>
      <p className="mt-3 text-lg leading-8 text-[#ded4c9]">{note}</p>
    </section>
  );
}
