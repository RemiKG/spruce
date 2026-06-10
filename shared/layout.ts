/* Spruce — diorama layout. Positions a solved cart's paper-cut pieces into the
   room shell (back-to-front) and gives each slot a price-pin anchor (as a % of
   the diorama box) so the tappable price-tags sit on their piece. Pure. */
import type { CartItem, Slot } from './types';
import type { RoomSpec, RoomPiece } from './render/room';

export const DIO = { W: 922, H: 790, horizon: 408 } as const;

type Place = { x: number; base: number; s: number };

const PLACE: Record<Slot, Place> = {
  rug: { x: 452, base: 655, s: 1.0 },
  seating_primary: { x: 452, base: 600, s: 1.25 },
  storage: { x: 748, base: 556, s: 0.92 },
  lighting: { x: 250, base: 600, s: 1.02 },
  coffee_table: { x: 452, base: 686, s: 0.96 },
  seating_secondary: { x: 660, base: 716, s: 0.9 },
  side_table: { x: 300, base: 700, s: 0.82 },
  plant: { x: 812, base: 654, s: 1.12 },
  wall_art: { x: 236, base: 250, s: 1 }, // routed to the wall (art array)
  accent: { x: 520, base: 700, s: 0.7 },
};

/** Pin anchor per slot, as a fraction of the diorama box (left%, top%). */
export const PIN_ANCHOR: Record<Slot, { left: number; top: number }> = {
  seating_primary: { left: 0.41, top: 0.60 },
  lighting: { left: 0.28, top: 0.45 },
  coffee_table: { left: 0.45, top: 0.83 },
  rug: { left: 0.34, top: 0.88 },
  seating_secondary: { left: 0.66, top: 0.85 },
  side_table: { left: 0.24, top: 0.83 },
  plant: { left: 0.86, top: 0.72 },
  wall_art: { left: 0.26, top: 0.33 },
  storage: { left: 0.80, top: 0.44 },
  accent: { left: 0.5, top: 0.8 },
};

/** Build the paper-diorama spec from a cart's items. */
export function dioramaSpec(items: CartItem[]): RoomSpec {
  const pieces: RoomPiece[] = [];
  const art: RoomSpec['art'] = [];
  for (const it of items) {
    const th = it.product.thumb;
    const pl = PLACE[it.slot] ?? PLACE.accent;
    if (it.product.wallMount || it.slot === 'wall_art') {
      art.push({ x: pl.x, y: pl.base, scene: (th.o?.scene as string) || 'arch', frame: (th.o?.frame as string) || 'walnut', w: 92, h: 120 });
    } else {
      pieces.push({ t: th.fn, x: pl.x, base: pl.base, s: pl.s, o: th.o });
    }
  }
  return {
    W: DIO.W, H: DIO.H, horizon: DIO.horizon,
    window: { x: 700, y: 306, w: 150, h: 196 },
    art,
    pieces,
  };
}

/** Ghost outlines for pieces that were dropped (faint, on the floor). */
export function ghostSvg(dropped: CartItem[]): string {
  return dropped
    .filter((d) => !d.product.wallMount)
    .map((d) => {
      const pl = PLACE[d.slot] ?? PLACE.accent;
      return `<ellipse cx="${pl.x}" cy="${pl.base}" rx="176" ry="30" fill="none" stroke="#233028" stroke-opacity=".17" stroke-width="2" stroke-dasharray="3 9"/>`;
    })
    .join('');
}
