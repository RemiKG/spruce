/* Spruce — the deterministic lexical style scorer. Given a free-text brief and a
   product, return a 0..1 "does this match the vibe" score. This is the fallback
   that keeps the offline app producing a coherent, well-matched cart; when a Qwen
   key is present the server replaces these scores with text-embedding-v4 +
   qwen3-rerank neural scores (same 0..1 contract, so the solver is unchanged). */
import type { Brief, Product } from './types';

const SYN: Record<string, string[]> = {
  warm: ['warm', 'cozy', 'cosy', 'inviting', 'amber', 'terracotta', 'walnut', 'oak', 'brass', 'wood', 'wooden'],
  cool: ['cool', 'crisp', 'airy', 'slate', 'grey', 'gray', 'blue'],
  minimalist: ['minimalist', 'minimal', 'clean', 'simple', 'calm', 'uncluttered', 'pared', 'modern'],
  wood: ['wood', 'woods', 'wooden', 'walnut', 'oak', 'timber', 'ash', 'birch'],
  walnut: ['walnut', 'dark wood', 'espresso'],
  oak: ['oak', 'light wood', 'ash', 'birch', 'blond'],
  boucle: ['boucle', 'bouclé', 'textured', 'nubby', 'sherpa'],
  linen: ['linen', 'cotton', 'natural', 'woven'],
  leather: ['leather', 'tan', 'cognac'],
  sage: ['sage', 'green', 'olive', 'eucalyptus'],
  cozy: ['cozy', 'cosy', 'warm', 'soft', 'plush', 'snug'],
  bold: ['bold', 'statement', 'dramatic', 'graphic'],
  scandi: ['scandi', 'scandinavian', 'nordic', 'minimalist', 'light wood'],
  midcentury: ['midcentury', 'mid-century', 'retro', 'tapered', 'walnut'],
  rustic: ['rustic', 'farmhouse', 'reclaimed', 'rough'],
  neutral: ['neutral', 'cream', 'beige', 'oat', 'sand', 'greige', 'ecru'],
  plush: ['plush', 'soft', 'comfy', 'comfortable'],
  plants: ['plant', 'plants', 'greenery', 'leafy', 'botanical'],
  industrial: ['industrial', 'metal', 'iron', 'concrete', 'black'],
};

function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean);
}

/** Expand a set of seed tokens through the synonym map into a weighted profile. */
function profile(tokens: string[]): Map<string, number> {
  const p = new Map<string, number>();
  const add = (t: string, w: number) => p.set(t, Math.max(p.get(t) || 0, w));
  for (const t of tokens) {
    add(t, 1);
    for (const [key, syns] of Object.entries(SYN)) {
      if (t === key || syns.includes(t)) {
        add(key, 1);
        for (const s of syns) add(s, 0.7);
      }
    }
  }
  return p;
}

/** Detect "not X" / "no X" / "without X" negations in the brief. */
function negations(text: string): Set<string> {
  const neg = new Set<string>();
  const re = /(?:not|no|without|avoid|less|anti)\s+([a-z-]+)/g;
  let match: RegExpExecArray | null;
  const lower = text.toLowerCase();
  while ((match = re.exec(lower))) {
    neg.add(match[1]);
    for (const [key, syns] of Object.entries(SYN)) {
      if (match[1] === key || syns.includes(match[1])) { neg.add(key); syns.forEach(s => neg.add(s)); }
    }
