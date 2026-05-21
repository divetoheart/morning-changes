import React from 'react';

export function ChordDiagram({ chord }) {
  const labels = ['E','A','D','G','B','e'];

  return (
    <div className="rounded-3xl border border-[#3d3026] bg-[#120f0c] p-5">
      <div className="mb-5 flex items-baseline justify-between">
        <div>
          <h3 className="font-serif text-3xl text-[#f4eee5]">{chord.symbol}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.35em] text-[#b8aa9b]">{chord.role}</p>
        </div>
        <code className="rounded-full border border-[#3d3026] px-3 py-1 text-xs text-[#d7a05b]">{chord.grip}</code>
      </div>

      <div className="grid grid-cols-6 gap-2 text-center text-xs text-[#b8aa9b]">
        {labels.map(label => <div key={label}>{label}</div>)}
        {chord.strings.map((fret,index) => (
          <div key={index} className={fret === 'x'
            ? 'grid h-16 place-items-center rounded-2xl border border-[#3d3026] text-[#6f655b]'
            : 'grid h-16 place-items-center rounded-2xl border border-[#d7a05b] bg-[#d7a05b] text-[#120d08]'}>
            {fret}
          </div>
        ))}
      </div>
    </div>
  );
}
