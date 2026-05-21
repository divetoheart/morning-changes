import React from 'react';

export function StandardLink({ href, title }) {
  return (
    <a href={href} className="mb-8 block rounded-3xl border border-[#3d3026] bg-[#15110e] p-5 text-[#f4eee5] no-underline">
      <p className="text-xs uppercase tracking-[0.4em] text-[#d7a05b]">Full Standard</p>
      <p className="mt-2 font-serif text-2xl">Open {title} Guide →</p>
    </a>
  );
}
