import { type ReactNode, useEffect, useRef } from 'react';

const TOKEN = /\b([A-G])([b#]?)(maj7|m7b5|m7|7|maj|m|dim)\b|\b([ivIV]+)(m7b5|maj7|m7|7|maj|m|ø)?\b/g;
const TARGETS = 'p, li, .symbol-pattern, .row-content small, .row-content strong';

function prettyQuality(value: string) {
  return value === 'm7b5' ? 'm7♭5' : value;
}

function notationFragment(text: string) {
  const fragment = document.createDocumentFragment();
  let cursor = 0;
  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > cursor) fragment.append(text.slice(cursor, index));
    if (match[1]) {
      const chord = document.createElement('span');
      chord.className = 'chord-symbol';
      const root = document.createElement('span');
      root.textContent = `${match[1]}${match[2] ?? ''}`;
      chord.append(root);
      if (match[3]) {
        const quality = document.createElement('sup');
        quality.textContent = prettyQuality(match[3]);
        chord.append(quality);
      }
      fragment.append(chord);
    } else {
      const functionSymbol = document.createElement('span');
      functionSymbol.className = 'function-symbol';
      const numeral = document.createElement('em');
      numeral.textContent = match[4];
      functionSymbol.append(numeral);
      if (match[5]) {
        const quality = document.createElement('sup');
        quality.textContent = prettyQuality(match[5]);
        functionSymbol.append(quality);
      }
      fragment.append(functionSymbol);
    }
    cursor = index + match[0].length;
  }
  if (cursor < text.length) fragment.append(text.slice(cursor));
  return fragment;
}

function applyNotation(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(TARGETS).forEach(element => {
    if (element.closest('select, option, button, .chord-symbol, .function-symbol') || element.querySelector('.chord-symbol, .function-symbol')) return;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    for (const node of nodes) {
      const value = node.nodeValue ?? '';
      TOKEN.lastIndex = 0;
      if (!TOKEN.test(value)) continue;
      node.replaceWith(notationFragment(value));
    }
  });
}

export function MusicTypography({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let scheduled = false;
    const render = () => {
      scheduled = false;
      applyNotation(element);
    };
    render();
    const observer = new MutationObserver(() => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(render);
      }
    });
    observer.observe(element, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);
  return <div ref={root} style={{ display: 'contents' }}>{children}</div>;
}
