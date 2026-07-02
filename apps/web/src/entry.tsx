import { createRoot } from 'react-dom/client';
import WorkspaceRoot from './WorkspaceRoot';
import { ThemeDock } from './ThemeDock';
import { ThemeProvider } from './ThemeProvider';
import './styles.css';
import './notation.css';
import './themes.css';
import './theme-clarity.css';
import './after-hours.css';
import './after-hours-theme-audit.css';
import './music-contrast.css';
import './after-hours-restored.css';
import './after-hours-port.css';
import './after-hours-fixes.css';
import './after-hours-final-polish.css';
import './workspace.css';
import './explorer-alias.css';

const mountNode = document.querySelector('#root');

if (mountNode) {
  createRoot(mountNode).render(
    <ThemeProvider>
      <WorkspaceRoot />
      <ThemeDock />
    </ThemeProvider>
  );
}
