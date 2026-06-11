/* Spruce — the geometry / clearance fit checker (the deterministic trust gate,
   part 2). Plain, auditable code: does a piece fit the measured room, fit through
   the doorway, and leave a walkway? And does a whole set pack without crowding?
   Runs before a human ever sees the cart. */
import type { Product, RoomModel, SolverSettings, FitResult } from './types';

const m = (cm: number) => (cm / 100).toFixed(2);

/** Individual fit: does this one piece fit the measured room? */
export function fitProduct(p: Product, room: RoomModel, s: SolverSettings): FitResult {
  const W = room.widthM * 100;   // room width, cm
  const D = room.depthM * 100;   // room depth, cm
  const H = room.heightM * 100;  // ceiling height, cm
  const door = room.doorwayCm ?? 90;
  const margin = s.clearanceMarginCm;
  const reasons: string[] = [];

  // Wall-mounted pieces (art, mirror): need wall width, no floor footprint.
  if (p.wallMount) {
    const footprintFits = p.dims.w <= W - 20;
    reasons.push(footprintFits
      ? `hangs on the ${m(W)} m wall`
      : `too wide (${m(p.dims.w)} m) for the ${m(W)} m wall`);
    return { ok: footprintFits, footprintFits, doorwayFits: true, clearanceOk: true, reasons };
  }

  // Rugs sit under the furniture — they need floor area but not a walkway margin.
  if (p.category === 'rug') {
    const footprintFits = p.dims.w <= W - 20 && p.dims.d <= D - 20;
    reasons.push(footprintFits
      ? `${m(p.dims.w)}×${m(p.dims.d)} m — sits within the ${m(W)}×${m(D)} m floor`
      : `${m(p.dims.w)}×${m(p.dims.d)} m rug won't sit in the ${m(W)}×${m(D)} m floor`);
    return { ok: footprintFits, footprintFits, doorwayFits: true, clearanceOk: true, reasons };
  }

  // Floor pieces: footprint must fit with a walkway, fit through the door,
  // and (assembled) clear the ceiling.
  const footprintFits = p.dims.w <= W - margin && p.dims.d <= D - Math.round(margin * 0.5);
  // a piece goes through a doorway by its smallest cross-section (tilt it on its side)
  const minCross = Math.min(p.dims.w, p.dims.d, p.dims.h);
  const doorwayFits = !s.mustFitDoorway || minCross <= door;
  const heightOk = !s.assembledCheck || p.dims.h <= H - 3;
  const ok = footprintFits && doorwayFits && heightOk;

  if (footprintFits) reasons.push(`${m(p.dims.w)}×${m(p.dims.d)} m — fits your ${m(W)} m room`);
  else reasons.push(`${m(p.dims.w)}×${m(p.dims.d)} m is too big for the ${m(W)}×${m(D)} m room`);
  if (s.mustFitDoorway) reasons.push(doorwayFits
    ? `${m(minCross)} m < ${m(door)} m door ✓`
    : `${m(minCross)} m won't clear the ${m(door)} m door`);
  if (s.assembledCheck && !heightOk) reasons.push(`${m(p.dims.h)} m is taller than the ${m(H)} m ceiling`);

  return { ok, footprintFits, doorwayFits, clearanceOk: footprintFits, reasons };
}

export type PackResult = {
  ok: boolean;
  occupiedM2: number;
  capacityM2: number;
  clearanceMinM: number;
};

/** Collective packing: do all the chosen floor pieces leave a walkway?
 *  Simple, honest model — floor pieces may occupy at most `packFactor` of the
 *  floor; the rest is circulation. Rugs and wall pieces don't count. */
export function packCheck(products: Product[], room: RoomModel, s: SolverSettings): PackResult {
  const floorM2 = room.widthM * room.depthM;
  const packFactor = 0.6;
  const capacityM2 = floorM2 * packFactor;
  let occupiedM2 = 0;
  for (const p of products) {
    if (p.wallMount || p.category === 'rug' || p.category === 'plant') continue;
    occupiedM2 += (p.dims.w / 100) * (p.dims.d / 100);
  }
  const ok = occupiedM2 <= capacityM2 + 1e-6;
  return { ok, occupiedM2, capacityM2, clearanceMinM: ok ? s.clearanceMarginCm / 100 : 0 };
}
