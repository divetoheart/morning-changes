import React from 'react';

export function HarmonicMap({ chords, selected, onSelect }) {
  return (
    <section className="mb-9">
      <p className="mb-4 text-xs uppercase tracking-[0.45em] text-[#d7a05b]">Harmonic Map</p>
      <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[#3d3026]">
        {chords.map((chord) => (
          <button
            key={chord.symbol}
            onClick={() => onSelect(chord)}
            className={selected.symbol === chord.symbol
              ? 'min-h-24 border border-[#3d3026] bg-[#d7a05b] p-4 text-left text-[#120d08]'
              : 'min-h-24 border border-[#3d3026] bg-[#120f0c] p-4 text-left text-[#f4eee5]'}
          >
            <strong className="block font-serif text-2xl">{chord.symbol}</strong>
            <span className="mt-2 block text-xs uppercase tracking-widest opacity-75">{chord.role}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
