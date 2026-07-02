import type { IntervalPosition } from './types';

export type FretboardLayerId = 'caged' | 'pentatonic' | 'arpeggio' | 'scale' | 'roots';

/** The resolver needs semantic location/role data, not a duplicated note object. */
export type LayerMembership = Pick<IntervalPosition, 'stringIndex' | 'fret' | 'interval' | 'role'> & {
  layer: FretboardLayerId;
  /** Named physical-shape identity, e.g. CAGED E-form. */
  variant?: string;
  /** Stable visual identity, separate from app theme and layer membership. */
  colorId?: string;
};

export type LayerVisualSegment = {
  layer: FretboardLayerId;
  colorId?: string;
};

export type LayerCell = {
  stringIndex: number;
  fret: number;
  /** One label only. The focus layer wins when memberships disagree. */
  primary: LayerMembership;
  memberships: readonly LayerMembership[];
  marker: 'single' | 'agreement' | 'conflict';
  /** A square marker means the visible/focus label is interval 1. */
  root: boolean;
  /** Ordered membership colors for a segmented border/ring renderer. */
  segments: readonly LayerVisualSegment[];
};

export type LayerResolutionOptions = {
  focusLayer?: FretboardLayerId;
  priority?: readonly FretboardLayerId[];
};

const DEFAULT_PRIORITY: readonly FretboardLayerId[] = ['arpeggio', 'pentatonic', 'scale', 'caged', 'roots'];

function keyOf(position: Pick<LayerMembership, 'stringIndex' | 'fret'>) {
  return `${position.stringIndex}:${position.fret}`;
}

/**
 * Collapses active layer memberships into one visible fret marker per position.
 * The renderer can use `segments` for a ring/tick treatment and open a detail
 * panel from `memberships`; it never needs to render competing text labels.
 */
export function resolveLayerCells(memberships: readonly LayerMembership[], options: LayerResolutionOptions = {}): LayerCell[] {
  const focusLayer = options.focusLayer ?? 'arpeggio';
  const priority = options.priority ?? DEFAULT_PRIORITY;
  const grouped = new Map<string, LayerMembership[]>();

  for (const membership of memberships) {
    const key = keyOf(membership);
    const group = grouped.get(key) ?? [];
    group.push(membership);
    grouped.set(key, group);
  }

  return [...grouped.values()].map(group => {
    const ordered = [...group].sort((left, right) => {
      const leftFocus = left.layer === focusLayer ? -1 : priority.indexOf(left.layer);
      const rightFocus = right.layer === focusLayer ? -1 : priority.indexOf(right.layer);
      return leftFocus - rightFocus;
    });
    const primary = ordered[0];
    const uniqueIntervals = new Set(group.map(item => item.interval));
    const marker = group.length === 1 ? 'single' : uniqueIntervals.size === 1 ? 'agreement' : 'conflict';
    const segments = ordered.reduce<LayerVisualSegment[]>((result, membership) => {
      const alreadyIncluded = result.some(segment => segment.layer === membership.layer && segment.colorId === membership.colorId);
      if (!alreadyIncluded) result.push({ layer: membership.layer, colorId: membership.colorId });
      return result;
    }, []);
    return {
      stringIndex: primary.stringIndex,
      fret: primary.fret,
      primary,
      memberships: ordered,
      marker,
      root: primary.interval === '1',
      segments
    };
  }).sort((left, right) => left.stringIndex - right.stringIndex || left.fret - right.fret);
}
