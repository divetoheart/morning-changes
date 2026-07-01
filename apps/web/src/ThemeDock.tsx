import { useState } from 'react';
import { useTheme, type ThemeName } from './ThemeProvider';

const choices: Array<{ id: ThemeName; name: string; description: string }> = [
  { id: 'dark', name: 'Dark', description: 'Warm midnight and brass' },
  { id: 'light', name: 'Light', description: 'Clean paper and soft ink' },
  { id: 'student', name: 'Student', description: 'Paper, red marks, blue ink' },
  { id: 'bluesy', name: 'Bluesy', description: 'Electric blue, walnut, smoke' },
  { id: 'vintage', name: 'Vintage Burst', description: 'Cream, tobacco, black hardware' }
];

export function ThemeDock() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return <aside className="theme-dock">
    {open && <div className="theme-menu" role="dialog" aria-label="Choose theme">
      <span className="theme-menu-label">Appearance</span>
      {choices.map(choice => <button key={choice.id} type="button" className={theme === choice.id ? 'active' : ''} onClick={() => { setTheme(choice.id); setOpen(false); }}>
        <i className={`theme-swatch ${choice.id}`} aria-hidden="true" />
        <span><strong>{choice.name}</strong><small>{choice.description}</small></span>
      </button>)}
    </div>}
    <button className="theme-dock-trigger" type="button" onClick={() => setOpen(previous => !previous)} aria-expanded={open} aria-label="Change theme">
      <span aria-hidden="true">◐</span><small>Theme</small>
    </button>
  </aside>;
}
