/* Spruce — the catalog loader. The catalog is the one warm, persistent store:
   real product records (real retailer, real product URL, captured price/stock,
   real dimensions). This module hydrates the raw JSON into full Product records —
   deriving the room `slot`, the wall-mount flag and the paper-cut `thumb` from
   the category so the data file stays lean. */
import type { Category, Currency, Dimensions, Product, Slot, Thumb } from './types';

export type RawProduct = {
  id: string;
  title: string;
  subtitle?: string;
  category: Category;
  slot?: Slot;
  retailer: { name: string; url: string };
  price: number;
  currency?: Currency;
  capturedAt: string;
  dims: Dimensions;
  materials: string[];
  colors: string[];
  styleTags: string[];
  inStock?: boolean;
  shipsFree?: boolean;
  deliveryDays?: [number, number];
  region?: string;
  secondhand?: boolean;
  wallMount?: boolean;
};

export function slotForCategory(cat: Category): Slot {
  switch (cat) {
    case 'sofa': case 'loveseat': return 'seating_primary';
    case 'armchair': case 'pouf': return 'seating_secondary';
    case 'arc_lamp': case 'floor_lamp': case 'table_lamp': case 'pendant': return 'lighting';
    case 'coffee_table': return 'coffee_table';
    case 'side_table': return 'side_table';
    case 'rug': return 'rug';
    case 'plant': return 'plant';
    case 'art': case 'mirror': return 'wall_art';
    case 'sideboard': case 'shelf': return 'storage';
    default: return 'accent';
  }
}

function tone(colors: string[], materials: string[]): string {
  const s = (colors.join(' ') + ' ' + materials.join(' ')).toLowerCase();
  if (/bou[cs]l|sherpa|teddy/.test(s)) return 'boucle';
  if (/walnut|espresso|dark wood|dark-brown/.test(s)) return 'walnut';
  if (/oak|ash|birch|light wood|blond|natural wood|oak effect/.test(s)) return 'oak';
  if (/brass|gold|pewter/.test(s)) return 'brass';
  if (/sage|olive|green/.test(s)) return 'sage';
  if (/terracotta|clay|rust|cognac|tan|leather/.test(s)) return 'clay';
  if (/black|anthracite|charcoal|graphite|slate|nickel|chrome|dark gray|dark grey/.test(s)) return 'slate';
  if (/linen|beige|cream|oat|sand|natural|ecru|greige|off-white|white|light beige/.test(s)) return 'linen';
  return 'oat';
}

function woodTone(colors: string[], materials: string[]): string {
  const s = (colors.join(' ') + ' ' + materials.join(' ')).toLowerCase();
  if (/walnut|espresso|dark wood/.test(s)) return 'walnut';
  if (/oak|ash|birch|light wood|blond|oak effect/.test(s)) return 'oak';
  if (/black|anthracite|charcoal|graphite/.test(s)) return 'slate';
  if (/white/.test(s)) return 'oat';
  return 'walnut';
}

function metalTone(colors: string[], materials: string[]): string {
  const s = (colors.join(' ') + ' ' + materials.join(' ')).toLowerCase();
  if (/black|anthracite|charcoal/.test(s)) return 'slate';
  if (/nickel|chrome|silver|steel/.test(s) && !/brass|pewter|gold/.test(s)) return 'slate';
  return 'brass';
}

export function thumbFor(raw: RawProduct): Thumb {
  const uph = tone(raw.colors, raw.materials);
  const wood = woodTone(raw.colors, raw.materials);
  const metal = metalTone(raw.colors, raw.materials);
  switch (raw.category) {
    case 'sofa':
      return { fn: 'sofa', o: { seats: 3, body: uph === 'slate' ? 'slate' : uph, legs: 'walnut' }, vb: '-150 -150 300 178' };
    case 'loveseat':
      return { fn: 'sofa', o: { seats: 2, body: uph === 'slate' ? 'slate' : uph, legs: 'walnut' }, vb: '-116 -150 232 178' };
    case 'armchair':
      return { fn: 'armchair', o: { body: uph, legs: 'walnut' }, vb: '-94 -124 188 140' };
    case 'arc_lamp':
      return { fn: 'arcLamp', o: { metal, shade: 'ink' }, vb: '-46 -232 214 252' };
    case 'floor_lamp': case 'table_lamp':
      return { fn: 'floorLamp', o: { metal, shade: 'linen' }, vb: '-62 -230 132 248' };
    case 'pendant':
      return { fn: 'pendant', o: { shade: metal, drop: 18 }, vb: '-40 -8 80 118' };
    case 'coffee_table':
      return { fn: 'coffeeTable', o: { wood, styled: false }, vb: '-110 -74 220 94' };
    case 'side_table':
      return { fn: 'coffeeTable', o: { wood, styled: false }, vb: '-86 -72 172 94' };
    case 'rug':
      return { fn: 'rug', o: { base: 'oat', accent: 'clay', accent2: 'sage', w: 300, h: 72 }, vb: '-162 -48 324 96' };
    case 'pouf':
      return { fn: 'pouf', o: { body: uph === 'linen' || uph === 'oat' ? 'clay' : uph }, vb: '-60 -60 120 76' };
    case 'plant':
      return { fn: 'plant', o: { pot: 'clay' }, vb: '-60 -192 120 210' };
    case 'art': case 'mirror':
      return { fn: 'art', o: { frame: wood, scene: raw.category === 'mirror' ? 'abstract' : 'arch' }, vb: '-58 -138 116 152' };
    case 'sideboard': case 'shelf':
      return { fn: 'sideboard', o: { wood }, vb: '-116 -102 232 118' };
    default:
      return { fn: 'coffeeTable', o: { styled: false }, vb: '-110 -74 220 94' };
  }
}

export function hydrate(raw: RawProduct): Product {
  return {
    id: raw.id,
    title: raw.title,
    subtitle: raw.subtitle,
    category: raw.category,
    slot: raw.slot ?? slotForCategory(raw.category),
    retailer: raw.retailer,
    price: raw.price,
    currency: raw.currency ?? 'USD',
    capturedAt: raw.capturedAt,
    dims: raw.dims,
    wallMount: raw.wallMount ?? (raw.category === 'art' || raw.category === 'mirror'),
    materials: raw.materials,
    colors: raw.colors,
    styleTags: raw.styleTags,
    inStock: raw.inStock ?? true,
    shipsFree: raw.shipsFree,
    deliveryDays: raw.deliveryDays,
    region: raw.region ?? 'US',
    secondhand: raw.secondhand,
    thumb: thumbFor(raw),
  };
}

export type CatalogIssue = { id: string; problem: string };

/** Data-integrity checks for the shipped catalog (used by `npm run catalog:check`). */
export function validateCatalog(raws: RawProduct[]): CatalogIssue[] {
  const issues: CatalogIssue[] = [];
  const seen = new Set<string>();
  for (const r of raws) {
    if (seen.has(r.id)) issues.push({ id: r.id, problem: 'duplicate id' });
    seen.add(r.id);
    if (!(r.price > 0)) issues.push({ id: r.id, problem: `bad price ${r.price}` });
    if (!r.retailer?.url || !/^https:\/\//.test(r.retailer.url)) issues.push({ id: r.id, problem: 'missing/insecure url' });
    if (!r.dims || !(r.dims.w > 0) || !(r.dims.d >= 0) || !(r.dims.h > 0)) issues.push({ id: r.id, problem: 'bad dims' });
    if (!r.capturedAt) issues.push({ id: r.id, problem: 'no capturedAt' });
  }
  return issues;
}

export function hydrateAll(raws: RawProduct[]): Product[] {
  return raws.map(hydrate);
}
