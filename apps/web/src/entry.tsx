import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AfterHoursAutumnLeavesApp } from './AfterHoursAutumnLeavesApp';
import { MusicTypography } from './MusicTypography';
import { ThemeDock } from './ThemeDock';
import { ThemeProvider } from './ThemeProvider';
import './styles.css';
import './lesson-rendering.css';
import './notation.css';
import './themes.css';
import './after-hours.css';
import './theme-clarity.css';

function UnifiedRoot() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    window.addEventListener('hashchange', sync);
    const bridge = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
      const href = anchor?.getAttribute('href') ?? '';
      if (href === 'after-hours/autumn-leaves/' || href.endsWith('/after-hours/autumn-leaves/')) {
        event.preventDefault();
        window.location.hash = '/after-hours/autumn-leaves';
      }
    };
    document.addEventListener('click', bridge, true);
    return () => {
      window.removeEventListener('hashchange', sync);
      document.removeEventListener('click', bridge, true);
    };
  }, []);

  return hash.replace(/\/$/, '') === '#/after-hours/autumn-leaves' ? <AfterHoursAutumnLeavesApp /> : <App />;
}

const mountNode = document.querySelector('#root');

if (mountNode) {
  createRoot(mountNode).render(
    <ThemeProvider>
      <MusicTypography>
        <UnifiedRoot />
        <ThemeDock />
      </MusicTypography>
    </ThemeProvider>
  );
}
