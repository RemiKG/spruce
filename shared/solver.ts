/* Spruce — the deterministic budget-solver gate (the un-fakeable core).
   "The LLM proposes; the solver disposes." Given scored, fit-checked candidates,
   it PROVES `total ≤ budget` and every piece fits the measured room BEFORE a
   human ever sees the cart — via an exact multiple-choice knapsack (one product
   per room slot) over integer dollars. Fully deterministic: identical inputs
   always yield the identical cart, so a design re-runs live from its inputs and
   the budget slider re-solves the whole cart in milliseconds. */
import type {
  Brief, Candidate, CartItem, Product, RoomModel, Slot, SolveResult, SolverSettings,
} from './types';
import { fitProduct, packCheck } from './fit';
import { styleScore } from './style';

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

/** Coverage priority: filling a core slot beats upgrading an accent. */
export const SLOT_WEIGHT: Record<Slot, number> = {
  seating_primary: 1000,
  lighting: 720,
  coffee_table: 660,
  storage: 360,
  seating_secondary: 300,
  rug: 280,
  side_table: 240,
  plant: 190,
  wall_art: 180,
  accent: 90,
};

const STYLE_FLOOR = 0.45;

const SLOT_WORD: Record<Slot, string> = {
  seating_primary: 'sofa', lighting: 'light', coffee_table: 'coffee table', rug: 'rug',
  seating_secondary: 'extra seat', side_table: 'side table', plant: 'plant',
  wall_art: 'wall piece', storage: 'storage', accent: 'accent',
};

/** Which slots to try to fill, given the room + brief. */
export function planFor(room: RoomModel, brief: Brief): Slot[] {
  const areaM2 = room.widthM * room.depthM;
  const plan: Slot[] = ['seating_primary', 'lighting', 'coffee_table', 'rug', 'seating_secondary', 'plant', 'wall_art'];
  const wantsStorage = /storage|shelf|book|sideboard|tv|media/i.test(brief.vibeText);
  if (areaM2 >= 14 || wantsStorage) plan.push('storage');
  return plan;
}

/** Attach a deterministic style score + fit result to each product. The server
 *  may overwrite `styleScore` with neural (embedding+rerank) scores before
 *  solving — the solver only consumes the 0..1 number, so it is unchanged. */
export function scoreAndFit(products: Product[], brief: Brief, room: RoomModel, settings: SolverSettings): Candidate[] {
  return products.map((p) => ({
    ...p,
    styleScore: styleScore(brief, p),
    slot: p.slot,
    fit: fitProduct(p, room, settings),
  }));
}

export type SolveOptions = {
  budget: number;
  settings: SolverSettings;
  room: RoomModel;
  plan: Slot[];
  prior?: SolveResult | null;
};

type Line = { cost: number; val: number; ref: Candidate };

function effCost(c: Candidate, s: SolverSettings): number {
  let base = c.price;
  if (s.includeTaxShipping) {
    base = base * (1 + s.taxRate);
    if (!c.shipsFree) base += 0; // per-item shipping estimate (0 by default → total == sum of prices)
  }
  return Math.max(0, Math.round(base));
}

function valueOf(c: Candidate, s: SolverSettings): number {
  const exp = 0.6 + s.matchStrictness * 1.4;
  const sc = STYLE_FLOOR + (1 - STYLE_FLOOR) * Math.pow(clamp(c.styleScore, 0, 1), exp);
  return Math.round(SLOT_WEIGHT[c.slot] * sc * 1000);
}

/** Deterministic ordering within a slot: best value, then cheaper, then id. */
function preferOrder(a: Line, b: Line): number {
  if (b.val !== a.val) return b.val - a.val;
  if (a.cost !== b.cost) return a.cost - b.cost;
  return a.ref.id < b.ref.id ? -1 : a.ref.id > b.ref.id ? 1 : 0;
}

export function solve(candidates: Candidate[], opts: SolveOptions): SolveResult {
  const t0 = now();
  const s = opts.settings;
  const notes: string[] = [];

  // Effective cap: soft/hard, minus the "leave headroom" — this is what lands the
  // total a little under budget (e.g. 2% of $600 → sources to ≤ $588).
  const rawCap = s.capMode === 'soft' ? Math.floor(opts.budget * (1 + s.softPct)) : opts.budget;
  const cap = Math.max(0, Math.floor(rawCap * (1 - s.leaveHeadroomPct)));

  // ---- filter the pool -------------------------------------------------------
  const avoid = new Set([...s.avoidMaterials].map((x) => x.toLowerCase()));
  // only source pieces that fit AND are in stock (out-of-stock pieces are handled
  // by the auto-swap path, never silently placed in the cart)
  let pool = candidates.filter((c) => c.fit.ok && c.inStock);
  const regionPool = pool.filter((c) => c.region === s.region);
  if (regionPool.length > 0) pool = regionPool;
  pool = pool.filter((c) => !s.excludeRetailers.includes(c.retailer.name));
  if (!s.secondhandOk) pool = pool.filter((c) => !c.secondhand);
  pool = pool.filter((c) => !c.materials.some((mtl) => avoid.has(mtl.toLowerCase())));

  // Group by slot. matchStrictness only reweights value (via the exponent in
  // valueOf) — it never removes affordable coverage, so a slot can always be
  // filled with a cheaper piece when the budget is tight.
  const planSet = new Set(opts.plan);
  const grouped = new Map<Slot, Line[]>();
  for (const c of pool) {
    if (!planSet.has(c.slot)) continue;
    const line: Line = { cost: effCost(c, s), val: valueOf(c, s), ref: c };
    const arr = grouped.get(c.slot);
    if (arr) arr.push(line); else grouped.set(c.slot, [line]);
  }
  for (const arr of grouped.values()) arr.sort(preferOrder);

  // ---- locks (pinned "keep" pieces) -----------------------------------------
  const lockedItems: CartItem[] = [];
  const lockedSlots = new Set<Slot>();
  let lockedCost = 0;
  for (const id of s.pinnedKeep) {
    const c = candidates.find((x) => x.id === id);
    if (!c || lockedSlots.has(c.slot)) continue;
    lockedSlots.add(c.slot);
    lockedCost += effCost(c, s);
    lockedItems.push({ product: c, slot: c.slot, state: 'kept', reason: 'pinned — you asked to keep this', fit: c.fit });
  }
  const capR = cap - lockedCost;
  const dpSlots = opts.plan.filter((slot) => grouped.has(slot) && !lockedSlots.has(slot));

  // ---- exact multiple-choice knapsack (choose ≤1 per slot) ------------------
  let feasibleDP = capR >= 0;
  const chosen: CartItem[] = [];
  if (feasibleDP && dpSlots.length) {
    let dp = new Float64Array(capR + 1);
    const choice: Int16Array[] = [];
    for (const slot of dpSlots) {
      const items = grouped.get(slot)!;
      const cur = new Float64Array(capR + 1);
      const ch = new Int16Array(capR + 1).fill(-1);
      for (let b = 0; b <= capR; b++) {
