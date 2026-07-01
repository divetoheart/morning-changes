import { useEffect, useRef } from 'react';
import { useTheme, type ThemeName } from './ThemeProvider';

const themeCss: Record<ThemeName, string> = {
  dark: '--mc-bg:#090806;--mc-panel:#15100c;--mc-panel-raised:#1a130e;--mc-ink:#f6efe6;--mc-muted:#b9aa9a;--mc-line:#38291d;--mc-gold:#e2aa62;--mc-gold-bright:#f2c27e;',
  light: '--mc-bg:#f8f6f1;--mc-panel:#ffffff;--mc-panel-raised:#f0ede7;--mc-ink:#1b2633;--mc-muted:#5f6d7a;--mc-line:#c8cdd0;--mc-gold:#9c6116;--mc-gold-bright:#a86c1b;',
  student: '--mc-bg:#f9f8f3;--mc-panel:#ffffff;--mc-panel-raised:#edf1f6;--mc-ink:#17263e;--mc-muted:#53657d;--mc-line:#c2d0de;--mc-gold:#bd3039;--mc-gold-bright:#d6414a;',
  bluesy: '--mc-bg:#111a31;--mc-panel:#1a355a;--mc-panel-raised:#244a74;--mc-ink:#edf3f3;--mc-muted:#b8c8d2;--mc-line:#4d7198;--mc-gold:#75d1e8;--mc-gold-bright:#a4e1ef;',
  vintage: '--mc-bg:#1a0d07;--mc-panel:#35180b;--mc-panel-raised:#54260f;--mc-ink:#f7e5c6;--mc-muted:#d2b88e;--mc-line:#e3c99d;--mc-gold:#f1bd68;--mc-gold-bright:#f8d69a;'
};

function bridgeTheme(frame: HTMLIFrameElement | null, theme: ThemeName) {
  const guideDocument = frame?.contentDocument;
  if (!guideDocument) return;

  guideDocument.documentElement.dataset.morningChangesTheme = theme;
  let style = guideDocument.querySelector<HTMLStyleElement>('#morning-changes-guide-theme');
  if (!style) {
    style = guideDocument.createElement('style');
    style.id = 'morning-changes-guide-theme';
    guideDocument.head.append(style);
  }

  style.textContent = `
    html[data-morning-changes-theme] { ${themeCss[theme]} }
    html[data-morning-changes-theme] body,
    html[data-morning-changes-theme] #root {
      background: var(--mc-bg) !important;
      color: var(--mc-ink) !important;
      --bg: var(--mc-bg);
      --panel: var(--mc-panel);
      --panel2: var(--mc-panel-raised);
      --ink: var(--mc-ink);
      --muted: var(--mc-muted);
      --line: var(--mc-line);
      --gold: var(--mc-gold);
      --gold-bright: var(--mc-gold-bright);
    }
    html[data-morning-changes-theme] a { color: var(--mc-gold) !important; }
    html[data-morning-changes-theme] button,
    html[data-morning-changes-theme] select,
    html[data-morning-changes-theme] input {
      color: var(--mc-ink) !important;
      border-color: var(--mc-line) !important;
    }
    html[data-morning-changes-theme='light'] button,
    html[data-morning-changes-theme='light'] select,
    html[data-morning-changes-theme='student'] button,
    html[data-morning-changes-theme='student'] select { background: var(--mc-panel) !important; }
    html[data-morning-changes-theme] :focus-visible {
      outline: 3px solid var(--mc-gold) !important;
      outline-offset: 3px;
    }
  `;
}

function fitFrameToGuide(frame: HTMLIFrameElement | null) {
  const guideDocument = frame?.contentDocument;
  if (!frame || !guideDocument) return;
  const documentElement = guideDocument.documentElement;
  const body = guideDocument.body;
  const nextHeight = Math.max(
    documentElement.scrollHeight,
    documentElement.offsetHeight,
    body?.scrollHeight ?? 0,
    body?.offsetHeight ?? 0,
    560
  );
  frame.style.height = `${nextHeight}px`;
}

export function AfterHoursAutumnLeavesApp() {
  const { theme } = useTheme();
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    bridgeTheme(frame.current, theme);
    fitFrameToGuide(frame.current);
  }, [theme]);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    let guideObserver: ResizeObserver | undefined;

    const observeGuide = () => {
      bridgeTheme(element, theme);
      fitFrameToGuide(element);
      const guideDocument = element.contentDocument;
      if (!guideDocument?.body) return;
      guideObserver?.disconnect();
      guideObserver = new ResizeObserver(() => fitFrameToGuide(element));
      guideObserver.observe(guideDocument.body);
      guideObserver.observe(guideDocument.documentElement);
    };

    element.addEventListener('load', observeGuide);
    if (element.contentDocument?.readyState === 'complete') observeGuide();
    return () => {
      element.removeEventListener('load', observeGuide);
      guideObserver?.disconnect();
    };
  }, [theme]);

  return <section className="after-hours-route">
    <div className="after-hours-route-topline">
      <span className="eyebrow">After Hours</span>
      <span>Standards Library · Autumn Leaves</span>
    </div>
    <iframe
      ref={frame}
      className="after-hours-guide-frame"
      title="After Hours — Autumn Leaves"
      src="after-hours/autumn-leaves/guide/"
      scrolling="no"
    />
  </section>;
}
