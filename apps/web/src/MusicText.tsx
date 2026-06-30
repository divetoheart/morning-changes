import type { ReactNode } from 'react';

// MusicTypography transforms this text after render so prose, chord symbols,
// functions, and interval degrees all share one visual language.
export function MusicText({ children }: { children: string }): ReactNode {
  return <>{children}</>;
}
