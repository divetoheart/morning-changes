import { useEffect, useRef, useState } from 'react';
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
  const dock = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (dock.current && !dock.current.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  useEffect(() => {
    const keepInsideMorningChanges = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
      const href = link?.getAttribute('href');
      if (href === 'after-hours/autumn-leaves/' || href === './after-hours/autumn-leaves/') {
        event.preventDefault();
        window.location.hash = '/after-hours/autumn-leaves';
      }
    };
    document.addEventListener('click', keepInsideMorningChanges, true);
    return () => document.removeEventListener('click', keepInsideMorningChanges, true);
  }, []);

  return <aside className="theme-dock" ref={dock}>
    {open && <div id="theme-menu" className="theme-menu" role="dialog" aria-label="Choose theme">
      <span className="theme-menu-label">Appearance</span>
      {choices.map(choice => <button key={choice.id} type="button" className={theme === choice.id ? 'active' : ''} onClick={() => { setTheme(choice.id); setOpen(false); trigger.current?.focus(); }}>
        <i className={`theme-swatch ${choice.id}`} aria-hidden="true" />
        <span><strong>{choice.name}</strong><small>{choice.description}</small></span>
      </button>)}
    </div>}
    <button ref={trigger} className="theme-dock-trigger" type="button" onClick={() => setOpen(previous => !previous)} aria-expanded={open} aria-controls="theme-menu" aria-label="Change theme">
      <span aria-hidden="true">◐</span><small>Theme</small>
    </button>
  </aside>;
}
