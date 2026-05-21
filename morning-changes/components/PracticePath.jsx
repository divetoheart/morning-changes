import React from 'react';

export function PracticePath({ items }) {
  return (
    <section className="mb-9 rounded-3xl border border-[#3d3026] bg-[#15110e] p-6">
      <p className="mb-4 text-xs uppercase tracking-[0.45em] text-[#d7a05b]">Practice Path</p>
      <ol className="space-y-4 text-lg leading-7 text-[#ded4c9]">
        {items.map((item, index) => (
          <li key={index}>{index + 1}. {item}</li>
        ))}
      </ol>
    </section>
  );
}
