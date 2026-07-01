import { type ReactNode, useEffect, useRef } from 'react';

const CHORD = /\b([A-G])([b#♭♯]?)(maj7|m7b5|m7♭5|m7|7|maj|m|dim)\b/g;
const NOTE = /\b([A-G])([b#♭♯])\b/g;
const FUNCTION = /\b([ivIV]+)(m7b5|m7♭5|maj7|m7|7|maj|m|ø)?\b/g;
const INTERVAL = /(?<![A-Za-z0-9])((?:bb|b|##|#|♭|♯)?)([1-7])((?:st|nd|rd|th)s?)?(?![A-Za-z0-9])/g;

function prettyAccidental(value: string) {
  return value.replaceAll('bb', '♭♭').replaceAll('##', '♯♯').replaceAll('b', '♭').replaceAll('#', '♯');
}

function prettyQuality(value: string) { return value.replace('m7b5', 'm7♭5'); }

function shouldLeaveAsPlainNumber(text: string, end: number) {
  const after = text.slice(end);
  return /^\s*(?:min(?:ute)?s?|bpm|day(?:s)?|lesson(?:s)?|session(?:s)?|bar(?:s)?|fret(?:s)?|string(?:s)?|times?)\b/i.test(after)
    || /^[\/:]/.test(after)
    || /[\/:]$/.test(text.slice(0, end));
}

type Match = { index: number; length: number; node: Node };
function makeText(value: string) { return document.createTextNode(value); }

function makeChord(root: string, accidental: string, quality: string) {
  const chord = document.createElement('span'); chord.className = 'chord-symbol';
  const note = document.createElement('span'); note.className = 'chord-root'; note.textContent = root; chord.append(note);
  if (accidental) { const acc = document.createElement('sup'); acc.className = 'music-accidental'; acc.textContent = prettyAccidental(accidental); chord.append(acc); }
  if (quality) { const suffix = document.createElement('sup'); suffix.className = 'chord-quality'; suffix.textContent = prettyQuality(quality); chord.append(suffix); }
  return chord;
}

function makeFunction(numeral: string, quality: string) {
  const symbol = document.createElement('span'); symbol.className = 'function-symbol';
  const main = document.createElement('em'); main.textContent = numeral; symbol.append(main);
  if (quality) { const suffix = document.createElement('sup'); suffix.textContent = quality === 'ø' ? 'ø' : prettyQuality(quality); symbol.append(suffix); }
  return symbol;
}

function makeInterval(accidental: string, degree: string, ordinal: string) {
  const symbol = document.createElement('span'); symbol.className = 'interval-symbol';
  if (accidental) { const acc = document.createElement('sup'); acc.className = 'music-accidental'; acc.textContent = prettyAccidental(accidental); symbol.append(acc); }
  const number = document.createElement('b'); number.textContent = degree; symbol.append(number);
  if (ordinal) { const suffix = document.createElement('small'); suffix.textContent = ordinal; symbol.append(suffix); }
  return symbol;
}

function replaceTextNode(textNode: Text, allowIntervals: boolean) {
  const source = textNode.nodeValue ?? '';
  const matches: Match[] = [];
  const collect = (regex: RegExp, builder: (match: RegExpMatchArray) => Node, guard?: (match: RegExpMatchArray, end: number) => boolean) => {
    regex.lastIndex = 0;
    for (const match of source.matchAll(regex)) {
      const index = match.index ?? 0; const end = index + match[0].length;
      if (guard?.(match, end)) continue;
      matches.push({ index, length: match[0].length, node: builder(match) });
    }
  };
  collect(CHORD, match => makeChord(match[1], match[2] ?? '', match[3] ?? ''));
  collect(NOTE, match => makeChord(match[1], match[2] ?? '', ''));
  collect(FUNCTION, match => makeFunction(match[1], match[2] ?? ''));
  if (allowIntervals) collect(INTERVAL, match => makeInterval(match[1] ?? '', match[2], match[3] ?? ''), (_match, end) => shouldLeaveAsPlainNumber(source, end));
  const nonOverlapping = matches.sort((a, b) => a.index - b.index || b.length - a.length).filter((match, index, all) => !all.slice(0, index).some(previous => previous.index < match.index + match.length && match.index < previous.index + previous.length));
  if (!nonOverlapping.length) return;
  const fragment = document.createDocumentFragment(); let cursor = 0;
  for (const match of nonOverlapping) { if (match.index > cursor) fragment.append(makeText(source.slice(cursor, match.index))); fragment.append(match.node); cursor = match.index + match.length; }
  if (cursor < source.length) fragment.append(makeText(source.slice(cursor)));
  textNode.replaceWith(fragment);
}

function normalizeStructuredNotation(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('.chord-symbol').forEach(symbol => {
    const rootText = Array.from(symbol.children).find(child => child.tagName !== 'SUP');
    if (rootText) rootText.textContent = prettyAccidental(rootText.textContent ?? '');
    symbol.querySelectorAll('sup').forEach(suffix => { suffix.textContent = prettyQuality(suffix.textContent ?? ''); });
  });
  root.querySelectorAll<HTMLElement>('.function-symbol sup').forEach(suffix => { suffix.textContent = prettyQuality(suffix.textContent ?? ''); });
}

function applyNotation(root: HTMLElement) {
  normalizeStructuredNotation(root);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Array<{ node: Text; allowIntervals: boolean }> = [];
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const parent = node.parentElement;
    if (!parent || parent.closest('script, style, select, option, button, input, textarea, .chord-symbol, .function-symbol, .interval-symbol')) continue;
    nodes.push({ node, allowIntervals: Boolean(parent.closest('[data-music-context="true"], .lesson-page, .interval-panel, .symbol-pattern')) });
  }
  nodes.forEach(({ node, allowIntervals }) => replaceTextNode(node, allowIntervals));
}

export function MusicTypography({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let scheduled = false;
    const render = () => { scheduled = false; applyNotation(element); };
    render();
    const observer = new MutationObserver(() => { if (!scheduled) { scheduled = true; requestAnimationFrame(render); } });
    observer.observe(element, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);
  return <div ref={root} className="music-typography-root">{children}</div>;
}
