import { createRoot } from 'react-dom/client';
import App from './App';
import { MusicTypography } from './MusicTypography';
import { ThemeDock } from './ThemeDock';
import { ThemeProvider } from './ThemeProvider';
import './styles.css';
import './lesson-rendering.css';
import './notation.css';
import './themes.css';

const mountNode = document.querySelector('#root');

if (mountNode) {
  createRoot(mountNode).render(
    <ThemeProvider>
      <MusicTypography>
        <App />
        <ThemeDock />
      </MusicTypography>
    </ThemeProvider>
  );
}
