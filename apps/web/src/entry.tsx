import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import './lesson-rendering.css';

const mountNode = document.querySelector('#root');

if (mountNode) {
  createRoot(mountNode).render(<App />);
}
