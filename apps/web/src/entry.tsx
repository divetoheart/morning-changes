import { createRoot } from 'react-dom/client';
import App from './App';
import { AppErrorBoundary } from './AppErrorBoundary';
import { BuildFooter } from './BuildFooter';
import { MusicTypography } from './MusicTypography';
import { ThemeDock } from './ThemeDock';
import { ThemeProvider } from './ThemeProvider';
import './styles.css';
import './build-footer.css';
import './lesson-rendering.css';
import './notation.css';
import './themes.css';
import './theme-clarity.css';
import './after-hours.css';
import './after-hours-wordmark.css';
import './p1-practice.css';
import './qa-polish.css';
import './after-hours-theme-audit.css';
import './music-contrast.css';
import './after-hours-restored.css';
import './after-hours-port.css';
import './after-hours-fixes.css';
import './after-hours-final-polish.css';
import './mobile-nav-guard.css';
import './fretboard-focus.css';

const mountNode = document.querySelector('#root');

if (mountNode) {
  createRoot(mountNode).render(
    <AppErrorBoundary>
      <ThemeProvider>
        <MusicTypography>
          <App />
          <BuildFooter />
          <ThemeDock />
        </MusicTypography>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
