/* Spruce — the server-side catalog store (the one warm, persistent store).
   Loads the real product records from catalog/products.json, hydrates them once,
   and serves filtered queries to the sourcing loop and the MCP server. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { hydrateAll, validateCatalog, type RawProduct } from '../shared/catalog';
import type { Product, Slot } from '../shared/types';

const HERE = dirname(fileURLToPath(import.meta.url));
export const CATALOG_PATH = join(HERE, '..', 'catalog', 'products.json');

let CACHE: Product[] | null = null;
let RAW: RawProduct[] | null = null;

export function loadCatalog(): Product[] {
  if (!CACHE) {
    RAW = JSON.parse(readFileSync(CATALOG_PATH, 'utf8')) as RawProduct[];
    const issues = validateCatalog(RAW);
    if (issues.length) console.warn('[catalog] integrity issues:', issues);
    CACHE = hydrateAll(RAW);
    console.log(`[catalog] loaded ${CACHE.length} real product records`);
  }
  return CACHE;
}

export function catalogSize(): number {
  return loadCatalog().length;
}

export function findProduct(id: string): Product | undefined {
  return loadCatalog().find((p) => p.id === id);
}

export type CatalogQuery = { slot?: Slot; q?: string; maxPrice?: number; region?: string; inStockOnly?: boolean };

export function searchCatalog(query: CatalogQuery = {}): Product[] {
  let list = loadCatalog();
  if (query.slot) list = list.filter((p) => p.slot === query.slot);
  if (query.region) list = list.filter((p) => p.region === query.region);
  if (typeof query.maxPrice === 'number') list = list.filter((p) => p.price <= query.maxPrice!);
  if (query.inStockOnly) list = list.filter((p) => p.inStock);
  if (query.q) {
    const q = query.q.toLowerCase();
    list = list.filter((p) =>
      [p.title, p.subtitle, ...p.materials, ...p.colors, ...p.styleTags].join(' ').toLowerCase().includes(q));
  }
  return list;
}
