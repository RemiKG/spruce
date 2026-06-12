/* Spruce — the sprig's narration. A deterministic, instant template used by both
   the server (the initial welcome line) and the client (live slider re-solves, so
   the sprig narrates the swaps in the same millisecond the cart re-solves). Warm,
   first person, no hype. */
import type { CartItem, Slot } from './types';
import { money } from './numbers';

const NOUN: Record<Slot, string> = {
  seating_primary: 'sofa', lighting: 'lamp', coffee_table: 'coffee table', rug: 'rug',
  seating_secondary: 'extra seat', side_table: 'side table', plant: 'plant',
  wall_art: 'wall piece', storage: 'shelf', accent: 'accent',
};

export function templateNarration(x: { budget: number; total: number; kept: CartItem[]; swapped: CartItem[]; dropped: CartItem[] }): string {
  const drop = x.dropped[0];
  const swap = x.swapped.find((s) => s.slot === 'seating_primary') || x.swapped[0];
  const lamp = x.kept.find((k) => k.slot === 'lighting') || x.kept.find((k) => k.slot === 'coffee_table');
  const parts: string[] = [];
  if (drop) {
    const beneficiary = lamp ? `${NOUN[lamp.slot]} you loved` : 'pieces you kept';
    parts.push(`Dropped the ${NOUN[drop.slot]} to make room for the ${beneficiary}`);
  }
  if (swap) {
    parts.push(`found the same look in a ${money(swap.product.price)} ${NOUN[swap.slot]}, in stock near you`);
  }
  if (parts.length === 0) {
    return `Sourced the whole room to ${money(x.total)} — under your ${money(x.budget)}, every piece in stock and clickable.`;
  }
  const s = parts.join(' — and ');
  return s.charAt(0).toUpperCase() + s.slice(1) + '.';
}
