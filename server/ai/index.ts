/* Spruce — the AI seam. Picks the active provider (Qwen → Anthropic → heuristic)
   and falls back to the deterministic heuristic if a live call fails, always
   reporting which provider actually ran (surfaced honestly in the UI). */
import { activeProvider, MODEL_IDS, ENV, type ProviderName } from '../env';
import { heuristicProvider } from './heuristic';
import { anthropicProvider } from './anthropic';
import { qwenProvider, qwenStyleScores } from './qwen';
import type { AiProvider, BriefInput, BriefResult, CriticInput, CriticResult, GroundInput, NarrateInput } from './types';
import type { Brief, Product, RoomModel } from '../../shared/types';

const providers: Record<ProviderName, AiProvider> = {
  qwen: qwenProvider,
  anthropic: anthropicProvider,
  heuristic: heuristicProvider,
};

async function run<T>(fn: (p: AiProvider) => Promise<T>, label: string): Promise<{ value: T; used: ProviderName }> {
  const p = activeProvider();
  if (p !== 'heuristic') {
    try {
      return { value: await fn(providers[p]), used: p };
    } catch (e) {
      console.warn(`[ai] ${label} fell back to heuristic:`, (e as Error).message);
    }
  }
  return { value: await fn(heuristicProvider), used: 'heuristic' };
}

export async function groundRoom(input: GroundInput) {
  const { value, used } = await run((p) => p.groundRoom(input), 'groundRoom');
  return { room: value as RoomModel, model: MODEL_IDS[used].grounding, used };
}
export async function parseBrief(input: BriefInput) {
  const { value, used } = await run((p) => p.parseBrief(input), 'parseBrief');
  return { brief: value as BriefResult, model: MODEL_IDS[used].structured, used };
}
export async function narrate(input: NarrateInput) {
  const { value, used } = await run((p) => p.narrate(input), 'narrate');
  return { text: value as string, used };
}
export async function critic(input: CriticInput) {
  const { value, used } = await run((p) => p.critic(input), 'critic');
  return { result: value as CriticResult, model: MODEL_IDS[used].critic, used };
}

/** Neural style scores (Qwen only). Returns null if the Qwen path isn't active
 *  or the call fails → the caller keeps the deterministic lexical scores. */
export async function styleScores(brief: Brief, products: Product[]): Promise<{ scores: Map<string, number>; label: string } | null> {
  if (activeProvider() !== 'qwen') return null;
  try {
    const scores = await qwenStyleScores(brief, products);
    if (scores.size === 0) return null;
    return { scores, label: MODEL_IDS.qwen.styleSearch };
  } catch (e) {
    console.warn('[ai] styleScores fell back to lexical:', (e as Error).message);
    return null;
  }
}

export { activeProvider, MODEL_IDS, ENV };
