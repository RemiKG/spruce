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
