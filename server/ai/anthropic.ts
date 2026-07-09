/* Spruce — the Anthropic reasoning provider. Used when no Qwen key is set but an
   ANTHROPIC_API_KEY is (so grounding / brief-parsing / narration / critic run
   LIVE, on the user's real photo, right now). Same contract as every provider. */
import Anthropic from '@anthropic-ai/sdk';
import { ENV } from '../env';
import { extractJson, clampNum, asArray, trimWords, cleanOptions } from './util';
import type { AiProvider, BriefInput, BriefResult, CriticInput, CriticResult, GroundInput, NarrateInput } from './types';
import type { RoomModel } from '../../shared/types';
import { money } from '../../shared/numbers';

function client() {
  return new Anthropic({ apiKey: ENV.ANTHROPIC_API_KEY });
}

async function ask(system: string, user: string, image?: { data: string; mediaType: string }): Promise<string> {
  const content: Anthropic.MessageParam['content'] = [];
  if (image) {
    content.push({ type: 'image', source: { type: 'base64', media_type: image.mediaType as any, data: image.data } });
  }
  content.push({ type: 'text', text: user });
  const msg = await client().messages.create({
    model: ENV.ANTHROPIC_MODEL,
    max_tokens: 1600,
    system,
    messages: [{ role: 'user', content }],
  });
  return msg.content.filter((b) => b.type === 'text').map((b) => (b as any).text).join('\n');
}

export const anthropicProvider: AiProvider = {
  async groundRoom(input: GroundInput): Promise<RoomModel> {
    const system =
      "You are Spruce's room-grounding vision model. Study the room PHOTO and return ONLY a JSON object (no prose, no code fence). " +
      'Estimate real-world dimensions in metres from visual cues (interior doors ~2.0 m tall, a sofa seat ~0.45 m). Be honest about uncertainty.';
    const user =
      `Ground this room for a redesign. The user's vibe: "${input.vibe}". ` +
      `A reference object for scale (credit card / A4 sheet) is ${input.hasReference ? 'PRESENT — tighten the error bar' : 'NOT present'}. ` +
      `Return JSON exactly: {"widthM":number,"depthM":number,"heightM":number,"errM":number,` +
      `"light":"short compass hint like SW or unknown","currentStyle":"short phrase","doorwayCm":number,` +
      `"objects":[{"label":"string","note":"short","keepCandidate":boolean}],` +
      `"clarify":{"question":"ONE smart question if the brief is genuinely ambiguous, else a light confirm","options":["short A","short B"]}}. ` +
      `Give 3–8 notable existing objects you can actually see. errM ~0.4 without a reference, ~0.1 with one.`;
    const raw = await ask(system, user, input.imageBase64 ? { data: input.imageBase64, mediaType: input.mediaType || 'image/jpeg' } : undefined);
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
      currentStyle: trimWords(j.currentStyle ?? 'as-is', 60),
      doorwayCm: clampNum(Number(j.doorwayCm) || 90, 60, 130),
      objects,
      clarify: j.clarify?.question
        ? { question: trimWords(j.clarify.question, 200), options: cleanOptions(j.clarify.options, ['Keep it as-is', 'Find me better']) }
        : undefined,
    };
  },

  async parseBrief(input: BriefInput): Promise<BriefResult> {
    const system = 'You turn a messy interior-design brief into structured intent. Return ONLY a JSON object.';
    const user =
      `Vibe: "${input.vibe}". Budget: ${money(input.budget)}. Current room style: ${input.room.currentStyle}. ` +
      `Return JSON: {"styleTags":[6 short style/material keywords],"mustKeep":[pieces to keep],` +
      `"avoidMaterials":[materials to avoid],"palette":[5 material/colour words],` +
      `"directionTitle":"a warm 3–6 word design direction","directionRationale":"one warm sentence"}.`;
    const j = extractJson<any>(await ask(system, user));
    return {
      styleTags: asArray(j.styleTags).slice(0, 8),
      mustKeep: asArray(j.mustKeep).slice(0, 5),
      avoidMaterials: asArray(j.avoidMaterials).slice(0, 5),
      palette: asArray(j.palette).slice(0, 6),
      directionTitle: trimWords(j.directionTitle ?? 'A calm, warm refresh.', 60),
      directionRationale: trimWords(j.directionRationale ?? '', 240),
    };
  },

  async narrate(input: NarrateInput): Promise<string> {
    const system = 'You are the little spruce sprig — a warm, concise interior-design sidekick. Reply with ONE or TWO sentences, first person, no hype, no emoji, no markdown.';
    const lines = [
      ...input.swapped.map((s) => `swapped ${s.slot} to ${s.product.title} (${money(s.product.price)}${s.prevPrice ? `, was ${money(s.prevPrice)}` : ''})`),
      ...input.dropped.map((d) => `dropped ${d.product.title} (freed ${money(d.prevPrice ?? d.product.price)})`),
      ...input.kept.slice(0, 2).map((k) => `kept ${k.product.title}`),
    ];
    const user = `Budget ${money(input.budget)}, sourced to ${money(input.total)}. Decisions: ${lines.join('; ')}. Narrate what you did and why, warmly.`;
    const text = await ask(system, user);
    return text.trim().replace(/^["']|["']$/g, '').slice(0, 260);
  },

  async critic(input: CriticInput): Promise<CriticResult> {
    const system = 'You are a concept critic (VL-as-judge). Score 0..1 how well the sourced cart achieves the approved concept. Return ONLY JSON {"score":number,"note":"short"}.';
    const user =
      `Concept: ${input.concept.title} — ${input.concept.rationale}. Palette: ${input.concept.palette.join(', ')}. ` +
      `Cart: ${input.cart.map((p) => `${p.title} (${p.materials.join('/')})`).join('; ')}. ` +
      `Brief style: ${input.brief.styleTags.join(', ')}.`;
    const j = extractJson<any>(await ask(system, user));
    return { score: clampNum(Number(j.score), 0, 1), note: String(j.note ?? '').slice(0, 120) };
  },
};
