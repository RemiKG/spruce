/* Spruce — shared domain types. Used identically by the server (sourcing) and
   the client (live re-solve). Keep this pure and dependency-free. */

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
export type Units = 'cm' | 'in';

/** Assembled footprint + height, in centimetres (the one internal unit). */
export type Dimensions = { w: number; d: number; h: number };

export type Category =
  | 'sofa' | 'loveseat' | 'armchair'
  | 'coffee_table' | 'side_table'
  | 'rug'
  | 'arc_lamp' | 'floor_lamp' | 'table_lamp' | 'pendant'
  | 'pouf'
  | 'plant'
  | 'art' | 'mirror'
  | 'sideboard' | 'shelf'
  | 'cushion' | 'throw';

/** The role a piece plays in a room. The solver fills one product per slot. */
export type Slot =
  | 'seating_primary'
  | 'lighting'
  | 'coffee_table'
  | 'rug'
  | 'seating_secondary'
  | 'side_table'
  | 'plant'
  | 'wall_art'
  | 'storage'
  | 'accent';

/** How to draw the piece as a paper cutout (thumbnail + in the diorama). */
export type Thumb = {
  fn: string;              // furniture function name (F[fn])
  o?: Record<string, unknown>;
  vb: string;              // viewBox for the thumbnail SVG
};

/** A real, buyable product record. Prices are captured snapshots (stock/prices
 *  move) — every record deep-links to the real retailer page at `retailer.url`. */
export type Product = {
  id: string;
  title: string;
  subtitle?: string;
  category: Category;
  slot: Slot;
  retailer: { name: string; url: string };
  price: number;
  currency: Currency;
  capturedAt: string;      // ISO date the price/stock was captured
  dims: Dimensions;        // assembled, in cm
  wallMount?: boolean;     // hangs on a wall (art/mirror) — no floor footprint
  materials: string[];
  colors: string[];
  styleTags: string[];
  inStock: boolean;
  shipsFree?: boolean;
  deliveryDays?: [number, number];
  region: string;          // e.g. 'US'
  secondhand?: boolean;
  thumb: Thumb;
};

export type DetectedObject = {
  label: string;
  note?: string;
  keepCandidate?: boolean;
  box?: [number, number, number, number]; // normalized x,y,w,h in [0,1]
};

/** What Qwen3-VL (or the fallback) grounds from the room photo. */
export type RoomModel = {
  widthM: number;
  depthM: number;
  heightM: number;
  errM: number;            // ± error bar in metres
  calibrated: boolean;     // tightened by a reference object?
  light: string;           // e.g. 'SW'
  currentStyle: string;
  objects: DetectedObject[];
  doorwayCm?: number;      // for the "fits the door" check
  clarify?: { question: string; options: [string, string] };
};

/** The parsed brief — free-text vibe resolved into machine-usable intent. */
export type Brief = {
  budget: number;
  currency: Currency;
  units: Units;
  region: string;
  vibeText: string;
  styleTags: string[];
  mustKeep: string[];
  avoidMaterials: string[];
  directionTitle?: string;
  directionRationale?: string;
  palette?: string[];
};

export type SolverSettings = {
  capMode: 'hard' | 'soft';
  softPct: number;             // e.g. 0.05
  leaveHeadroomPct: number;    // e.g. 0.02
  includeTaxShipping: boolean;
  taxRate: number;             // e.g. 0.0
  clearanceMarginCm: number;   // walkway around pieces
  mustFitDoorway: boolean;
  assembledCheck: boolean;
  matchStrictness: number;     // 0 (loose) .. 1 (exact)
  reSourceAttempts: number;
  conceptCriticThreshold: number;
  region: string;
  currency: Currency;
  units: Units;
  catalogOnly: boolean;        // catalog-only vs web + catalog
  secondhandOk: boolean;
  excludeRetailers: string[];
  pinnedKeep: string[];        // product ids locked into the cart
