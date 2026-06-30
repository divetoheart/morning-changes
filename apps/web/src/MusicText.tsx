import type { ReactNode } from 'react';

type Piece = { kind: 'text'; value: string } | { kind: 'chord'; root: string; quality: string } | { kind: 'function'; numeral: string; quality: string };

const TOKEN = /\b([A-G])([b#]?)(maj7|m7b5|m7|7|maj|m|dim)\b|\b([ivIV]+)(m7b5|maj7|m7|7|maj|m|ø)?\b/g;

function prettyQuality(quality: string) {
  return quality === 'm7b5' ? 'm7♭5' : quality;
}

function parse(value: string): Piece[] {
  const result: Piece[] = [];
  let cursor = 0;
  for (const match of value.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > cursor) result.push({ kind: 'text', value: value.slice(cursor, index) });
    if (match[1]) result.push({ kind: 'chord', root: `${match[1]}${match[2] ?? ''}`, quality: match[3] ?? '' });
    else result.push({ kind: 'function', numeral: match[4], quality: match[5] ?? '' });
    cursor = index + match[0].length;
  }
  if (cursor < value.length) result.push({ kind: 'text', value: value.slice(cursor) });
  return result;
}

export function MusicText({ children }: { children: string }): ReactNode {
  return <>{parse(children).map((piece, index) => {
    if (piece.kind === 'text') return <span key={index}>{piece.value}</span>;
    if (piece.kind === 'chord') return <span className="chord-symbol" key={index}><span>{piece.root}</span>{piece.quality && <sup>{prettyQuality(piece.quality)}</sup>}</span>;
    return <span className="function-symbol" key={index}><em>{piece.numeral}</em>{piece.quality && <sup>{prettyQuality(piece.quality)}</sup>}</span>;
  })}</>;
}
