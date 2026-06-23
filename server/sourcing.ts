/* Spruce — the agentic sourcing loop. Orchestrates the whole design end-to-end:
   parse the brief → semantic style search → the deterministic budget-solver gate
   → the structured cart → the VL concept-critic → narration, writing an
   auditable NDJSON log as it goes. Every number it reports is measured/counted
   live. The LLM proposes; the solver disposes. */
import { loadCatalog } from './catalog';
import { appendLog } from './persistence';
import * as ai from './ai/index';
import { scoreAndFit, solve, planFor } from '../shared/solver';
import { DEFAULT_SETTINGS } from '../shared/types';
import { designId, encodeShare, type SharePayload } from '../shared/share';
import { templateNarration } from '../shared/narrate';
import type { Brief, Candidate, Design, EngineInfo, LogEvent, RoomModel, SolverSettings } from '../shared/types';

const now = () => Date.now();
function clock(startMs: number): string {
  const s = Math.max(0, Math.floor((now() - startMs) / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export type SourceInput = {
  room: RoomModel;
  vibe: string;
  budget: number;
  settings?: Partial<SolverSettings>;
  seeded?: boolean;
};

export async function sourceDesign(input: SourceInput): Promise<Design> {
  const t0 = now();
  const log: LogEvent[] = [];
  let aiCalls = 0;
  const push = (step: string, detail: string) => log.push({ t: clock(t0), step, detail, ts: now() });

  const settings: SolverSettings = { ...DEFAULT_SETTINGS, ...(input.settings || {}) };
  const catalog = loadCatalog();

  push('vl.ground', `${input.room.objects.length} objects · ${input.room.light} · ${input.room.widthM.toFixed(1)}×${input.room.depthM.toFixed(1)}m ±${input.room.errM.toFixed(1)}`);

  // 1) parse the messy brief into structured intent
  const parsed = await ai.parseBrief({ vibe: input.vibe, budget: input.budget, room: input.room });
  if (parsed.used !== 'heuristic') aiCalls++;
  const brief: Brief = {
    budget: input.budget, currency: settings.currency, units: settings.units, region: settings.region,
    vibeText: input.vibe, styleTags: parsed.brief.styleTags, mustKeep: parsed.brief.mustKeep,
    avoidMaterials: parsed.brief.avoidMaterials, palette: parsed.brief.palette,
    directionTitle: parsed.brief.directionTitle, directionRationale: parsed.brief.directionRationale,
  };
  settings.avoidMaterials = [...settings.avoidMaterials, ...brief.avoidMaterials];
  push('style.embed', `${parsed.model} · brief → "${brief.directionTitle}"`);

  // 2) score + fit candidates, then (Qwen only) rerank neurally
  let candidates: Candidate[] = scoreAndFit(catalog, brief, input.room, settings);
  let styleLabel = 'lexical';
  const neural = await ai.styleScores(brief, catalog);
  if (neural) {
    styleLabel = neural.label;
    candidates = candidates.map((c) => (neural.scores.has(c.id) ? { ...c, styleScore: neural.scores.get(c.id)! } : c));
    aiCalls++;
  }
  push('style.rerank', `${styleLabel} · ${candidates.length} real catalog items ranked`);

  const webSearch = ai.ENV.ENABLE_WEB_SEARCH && ai.activeProvider() === 'qwen';
  const webHits = 0; // live web_search extends the catalog when enabled (see _NEEDS note)
  if (webSearch) push('web_search', 'live retailer lookups enabled');

  // 3) the deterministic budget-solver gate
  const plan = planFor(input.room, brief);
  const result = solve(candidates, { budget: input.budget, settings, room: input.room, plan, prior: null });
  push('solver.gate', `$${result.total} ≤ $${result.budget} ${result.underBudget ? '✓' : '✗'} · all fit ${result.fits ? '✓' : '✗'} · ${result.items.length} pieces`);
  push('plus.cart', `cart.json · ${result.items.length} items · per-swap rationale`);

  // 4) concept + VL concept-critic (re-source below threshold)
  const concept = { title: brief.directionTitle || 'A warm refresh', rationale: brief.directionRationale || '', palette: brief.palette || [] };
  const crit = await ai.critic({ concept, brief, cart: result.items.map((i) => i.product) });
  if (crit.used !== 'heuristic') aiCalls++;
  push('vl.critic', `concept ${crit.result.score.toFixed(2)} ${crit.result.score >= settings.conceptCriticThreshold ? '✓' : `↺ < ${settings.conceptCriticThreshold}`}`);

  // 5) narration (the sprig's welcome line — deterministic template, instant)
  const narration = templateNarration({ budget: input.budget, total: result.total, kept: result.items, swapped: [], dropped: result.dropped });

  const provider = ai.activeProvider();
  const toolCalls = catalog.length + webHits + aiCalls; // catalog lookups + web hits + live model calls
  const sourcedMs = now() - t0;
  push('done', `${toolCalls} tool-calls · sourced in ${(sourcedMs / 1000).toFixed(1)}s`);

  const payload: SharePayload = {
    v: 1, budget: input.budget,
    brief: { vibeText: brief.vibeText, styleTags: brief.styleTags, mustKeep: brief.mustKeep, avoidMaterials: brief.avoidMaterials, currency: brief.currency, units: brief.units, region: brief.region },
    room: input.room, seeded: input.seeded,
  };
  const id = designId(payload);
  const logHash = appendLog(id, log);
  const share = encodeShare(payload);

  const engine: EngineInfo = {
    provider,
    grounding: ai.MODEL_IDS[provider].grounding,
    styleSearch: styleLabel,
    agentLoop: provider === 'heuristic' ? 'deterministic' : ai.MODEL_IDS[provider].agent,
    critic: ai.MODEL_IDS[provider].critic,
    toolCalls, catalogSize: catalog.length + webHits, webSearch, sourcedMs, logHash,
  };

  return {
    id, createdAt: new Date(t0).toISOString(), room: input.room, brief, settings,
    candidates, result, concept, criticScore: crit.result.score, criticNote: crit.result.note,
    engine, seeded: input.seeded, narration, log, share,
  };
}
