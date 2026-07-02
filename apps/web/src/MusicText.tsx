import type { ReactNode } from 'react';
import { MusicTokenList } from './MusicNotation';
import type { MusicToken } from './lib/music';

/**
 * String content remains transitional. New content can pass an explicit token
 * list and bypass the legacy typography scanner entirely.
 */
export function MusicText({ children }: { children: string | readonly MusicToken[] }): ReactNode {
  return Array.isArray(children) ? <MusicTokenList tokens={children} /> : <>{children}</>;
}