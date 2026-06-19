/* Spruce — the Qwen Cloud reasoning provider (the design's primary, documented
   engine). Activates the moment DASHSCOPE_API_KEY is set. Real DashScope calls on
   the international endpoint per the event's technical reference:
     - qwen3-vl-plus   : room grounding + concept-critic (vision)
     - qwen3.7-plus    : structured brief / narration (JSON, vision-capable)
     - text-embedding-v4 + qwen3-rerank : semantic style search
   Watch-out (handled below): rate-limit errors come back as HTTP 200 with a body
   of status:"failed", not a 4xx. See "_NEEDS DashScope (Qwen) API key.md". */
import { ENV } from '../env';
import { extractJson, clampNum, asArray } from './util';
import type { AiProvider, BriefInput, BriefResult, CriticInput, CriticResult, GroundInput, NarrateInput } from './types';
import type { Brief, Product, RoomModel } from '../../shared/types';
import { money } from '../../shared/numbers';

type ChatMsg = { role: 'system' | 'user' | 'assistant'; content: any };

async function chat(model: string, messages: ChatMsg[]): Promise<string> {
  const res = await fetch(`${ENV.DASHSCOPE_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${ENV.DASHSCOPE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, temperature: 0.4 }),
  });
  const data: any = await res.json().catch(() => ({}));
  // HTTP-200-with-status:"failed" rate-limit trap
  if (!res.ok || data?.status === 'failed' || data?.code) {
    throw new Error(`qwen ${model}: ${data?.message || data?.code || res.status}`);
  }
  return data?.choices?.[0]?.message?.content ?? '';
}

function visionContent(text: string, input: GroundInput) {
  const parts: any[] = [{ type: 'text', text }];
  if (input.imageBase64) parts.push({ type: 'image_url', image_url: { url: `data:${input.mediaType || 'image/jpeg'};base64,${input.imageBase64}` } });
  return parts;
}

export const qwenProvider: AiProvider = {
  async groundRoom(input: GroundInput): Promise<RoomModel> {
    const sys =
      "You are Spruce's room-grounding vision model (qwen3-vl-plus). Study the room photo and return ONLY JSON. Estimate metres from cues (doors ~2.0 m).";
    const prompt =
      `Vibe: "${input.vibe}". Reference object present: ${input.hasReference}. ` +
      `JSON: {"widthM","depthM","heightM","errM","light","currentStyle","doorwayCm","objects":[{"label","note","keepCandidate"}],"clarify":{"question","options":["A","B"]}}.`;
    const raw = await chat('qwen3-vl-plus', [
      { role: 'system', content: sys },
      { role: 'user', content: visionContent(prompt, input) },
    ]);
    const j = extractJson<any>(raw);
    const objects = Array.isArray(j.objects) ? j.objects.slice(0, 8).map((o: any) => ({
      label: String(o.label ?? 'object'), note: o.note ? String(o.note) : undefined, keepCandidate: !!o.keepCandidate,
    })) : [];
    return {
      widthM: clampNum(Number(j.widthM), 1.8, 12),
      depthM: clampNum(Number(j.depthM), 1.8, 12),
      heightM: clampNum(Number(j.heightM), 2.0, 4),
      errM: clampNum(Number(j.errM), 0.05, 0.8),
      calibrated: input.hasReference,
      light: String(j.light ?? 'unknown').slice(0, 12),
      currentStyle: String(j.currentStyle ?? 'as-is').slice(0, 60),
      doorwayCm: clampNum(Number(j.doorwayCm) || 90, 60, 130),
      objects,
      clarify: j.clarify?.question
        ? { question: String(j.clarify.question).slice(0, 200), options: [String(j.clarify.options?.[0] ?? 'Keep it'), String(j.clarify.options?.[1] ?? 'Find me better')] as [string, string] }
        : undefined,
    };
  },

  async parseBrief(input: BriefInput): Promise<BriefResult> {
    const raw = await chat('qwen3.7-plus', [
      { role: 'system', content: 'Turn a messy interior brief into structured intent. Return ONLY JSON.' },
      { role: 'user', content: `Vibe: "${input.vibe}". Budget ${money(input.budget)}. Current style: ${input.room.currentStyle}. JSON: {"styleTags":[],"mustKeep":[],"avoidMaterials":[],"palette":[],"directionTitle":"","directionRationale":""}` },
    ]);
    const j = extractJson<any>(raw);
    return {
      styleTags: asArray(j.styleTags).slice(0, 8),
      mustKeep: asArray(j.mustKeep).slice(0, 5),
      avoidMaterials: asArray(j.avoidMaterials).slice(0, 5),
      palette: asArray(j.palette).slice(0, 6),
      directionTitle: String(j.directionTitle ?? 'A calm, warm refresh.').slice(0, 60),
      directionRationale: String(j.directionRationale ?? '').slice(0, 240),
    };
  },

  async narrate(input: NarrateInput): Promise<string> {
    const lines = [
      ...input.swapped.map((s) => `swapped ${s.slot} to ${s.product.title} (${money(s.product.price)})`),
      ...input.dropped.map((d) => `dropped ${d.product.title}`),
    ];
    const raw = await chat('qwen3.7-plus', [
      { role: 'system', content: 'You are the little spruce sprig. One or two warm sentences, first person, no hype.' },
      { role: 'user', content: `Budget ${money(input.budget)} → ${money(input.total)}. ${lines.join('; ')}. Narrate warmly.` },
    ]);
    return raw.trim().replace(/^["']|["']$/g, '').slice(0, 260);
  },

  async critic(input: CriticInput): Promise<CriticResult> {
    const raw = await chat('qwen3-vl-plus', [
      { role: 'system', content: 'Concept critic (VL-as-judge). Return ONLY JSON {"score":0..1,"note":""}.' },
      { role: 'user', content: `Concept ${input.concept.title}. Palette ${input.concept.palette.join(', ')}. Cart ${input.cart.map((p) => p.title).join('; ')}.` },
    ]);
    const j = extractJson<any>(raw);
    return { score: clampNum(Number(j.score), 0, 1), note: String(j.note ?? '').slice(0, 120) };
  },
};

/** Optional neural style search (text-embedding-v4 + qwen3-rerank). Returns a
 *  0..1 score per product id; used by the sourcing loop when the Qwen key is
 *  present, else the deterministic lexical scorer is used. */
export async function qwenStyleScores(brief: Brief, products: Product[]): Promise<Map<string, number>> {
  const query = `${brief.directionTitle ?? ''} ${brief.styleTags.join(' ')} ${brief.vibeText}`.trim();
  const docs = products.map((p) => `${p.title} ${p.subtitle ?? ''} ${p.materials.join(' ')} ${p.colors.join(' ')} ${p.styleTags.join(' ')}`);
  const res = await fetch(`${ENV.DASHSCOPE_RERANK_BASE_URL}/services/rerank/text-rerank/text-rerank`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${ENV.DASHSCOPE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'qwen3-rerank', input: { query, documents: docs }, parameters: { top_n: docs.length, return_documents: false } }),
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok || data?.status === 'failed') throw new Error(`qwen rerank: ${data?.message || res.status}`);
  const out = new Map<string, number>();
  const results = data?.output?.results ?? [];
  for (const r of results) {
    const idx = Number(r.index);
    if (products[idx]) out.set(products[idx].id, clampNum(Number(r.relevance_score), 0, 1));
  }
  return out;
}
