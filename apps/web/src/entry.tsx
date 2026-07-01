import { createRoot } from 'react-dom/client';
import App from './App';
import { MusicTypography } from './MusicTypography';
import './styles.css';
import './lesson-rendering.css';
import './notation.css';

const mountNode = document.querySelector('#root');

if (mountNode) {
  createRoot(mountNode).render(
    <MusicTypography>
      <App />
    </MusicTypography>
  );
}
