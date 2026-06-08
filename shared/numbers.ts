/* Spruce — every shipped number, computed live (never canned). Formatters + a
   single place that derives the on-screen stat grid from a finished design. */
import type { Currency, Design, SolveResult } from './types';

export const CUR: Record<Currency, string> = { USD: '$', EUR: '€', GBP: '£', CAD: '$', AUD: '$' };

export function money(n: number, currency: Currency = 'USD'): string {
  return CUR[currency] + Math.round(n).toLocaleString('en-US');
}

/** re-solve time, honest: milliseconds for the slider, seconds for a full source. */
export function fmtDur(ms: number): string {
  if (ms < 1000) return `${Math.max(1, Math.round(ms))}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function inStockPct(result: SolveResult): number {
  if (!result.items.length) return 100;
  const n = result.items.filter((i) => i.product.inStock).length;
  return Math.round((100 * n) / result.items.length);
}

export type ScreenNumbers = {
  budgetFit: number;        // $ under budget
  catalogSearched: number;  // real catalog size considered
  toolCalls: number;        // real count from the sourcing log
  reSolveMs: number;        // measured wall-clock of the last solve
  sourcedMs: number;        // measured wall-clock of the full sourcing run
  vlObjects: number;        // objects grounded from the photo
  criticScore: number;      // VL concept-critic (0..1)
  inStockPct: number;       // % of cart in stock & clickable
};

export function deriveNumbers(design: Design): ScreenNumbers {
  return {
    budgetFit: Math.max(0, design.result.budget - design.result.total),
    catalogSearched: design.engine.catalogSize,
    toolCalls: design.engine.toolCalls,
    reSolveMs: design.result.reSolveMs,
    sourcedMs: design.engine.sourcedMs,
    vlObjects: design.room.objects.length,
    criticScore: design.criticScore ?? 0,
    inStockPct: inStockPct(design.result),
  };
}
