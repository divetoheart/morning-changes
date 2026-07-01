import { useEffect, useRef } from 'react';
import { useTheme, type ThemeName } from './ThemeProvider';

const themeCss: Record<ThemeName, string> = {
  dark: '--mc-bg:#090806;--mc-panel:#15100c;--mc-ink:#f6efe6;--mc-muted:#b9aa9a;--mc-line:#38291d;--mc-gold:#e2aa62;',
  light: '--mc-bg:#f8f6f1;--mc-panel:#ffffff;--mc-ink:#1b2633;--mc-muted:#5f6d7a;--mc-line:#c8cdd0;--mc-gold:#9c6116;',
  student: '--mc-bg:#f9f8f3;--mc-panel:#ffffff;--mc-ink:#17263e;--mc-muted:#53657d;--mc-line:#c2d0de;--mc-gold:#bd3039;',
  bluesy: '--mc-bg:#111a31;--mc-panel:#1a355a;--mc-ink:#edf3f3;--mc-muted:#b8c8d2;--mc-line:#4d7198;--mc-gold:#75d1e8;',
  vintage: '--mc-bg:#1a0d07;--mc-panel:#35180b;--mc-ink:#f7e5c6;--mc-muted:#d2b88e;--mc-line:#e3c99d;--mc-gold:#f1bd68;'
};

function bridgeTheme(frame: HTMLIFrameElement | null, theme: ThemeName) {
  const document = frame?.contentDocument;
  if (!document) return;

  document.documentElement.dataset.morningChangesTheme = theme;
  let style = document.querySelector<HTMLStyleElement>('#morning-changes-guide-theme');
  if (!style) {
    style = document.createElement('style');
    style.id = 'morning-changes-guide-theme';
    document.head.append(style);
  }

  style.textContent = `
    html[data-morning-changes-theme] { ${themeCss[theme]} }
    html[data-morning-changes-theme] body,
    html[data-morning-changes-theme] #root { background:var(--mc-bg)!important; color:var(--mc-ink)!important; }
    html[data-morning-changes-theme] a { color:var(--mc-gold)!important; }
    html[data-morning-changes-theme] button,
    html[data-morning-changes-theme] select { color:var(--mc-ink)!important; border-color:var(--mc-line)!important; }
    html[data-morning-changes-theme='light'] button,
    html[data-morning-changes-theme='light'] select,
    html[data-morning-changes-theme='student'] button,
    html[data-morning-changes-theme='student'] select { background:#ffffff!important; }
  `;
}

export function AfterHoursAutumnLeavesApp() {
  const { theme } = useTheme();
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    bridgeTheme(frame.current, theme);
  }, [theme]);

  return <section className="after-hours-route">
    <div className="after-hours-route-topline">
      <span className="eyebrow">After Hours · Autumn Leaves</span>
      <span>Dedicated tune study</span>
    </div>
    <iframe
      ref={frame}
      className="after-hours-guide-frame"
      title="After Hours — Autumn Leaves"
      src="after-hours/autumn-leaves/guide/"
      onLoad={() => bridgeTheme(frame.current, theme)}
    />
  </section>;
}
