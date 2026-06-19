/* Spruce — the deterministic reasoning fallback (no LLM key of any kind).
   Honest degradation: it never invents what it cannot know. Room grounding
   returns editable defaults with wide error bars and asks the user to confirm;
   the brief is parsed with plain keyword rules; narration and the critic use
   transparent templates / a rubric. The load-bearing engine (solver, fit,
   catalog, links) still runs for real. */
import type { AiProvider, BriefInput, BriefResult, CriticInput, CriticResult, GroundInput, NarrateInput } from './types';
import type { RoomModel } from '../../shared/types';
import { templateNarration } from '../../shared/narrate';

const STYLE_WORDS = [
  'warm', 'cozy', 'cosy', 'minimalist', 'minimal', 'modern', 'scandi', 'scandinavian',
  'midcentury', 'mid-century', 'rustic', 'industrial', 'boho', 'coastal', 'traditional',
  'walnut', 'oak', 'wood', 'woods', 'boucle', 'linen', 'leather', 'sage', 'green', 'neutral',
  'bold', 'calm', 'airy', 'plush', 'natural',
];

export const heuristicProvider: AiProvider = {
  async groundRoom(input: GroundInput): Promise<RoomModel> {
    return {
      widthM: 4.0,
      depthM: 2.6,
      heightM: 2.5,
      errM: input.hasReference ? 0.1 : 0.4,
      calibrated: input.hasReference,
      light: 'unknown',
      currentStyle: 'your room, as-is',
      doorwayCm: 90,
      objects: [
        { label: 'your room', note: 'vision engine offline — confirm the size below' },
      ],
      clarify: {
        question: 'I could not run the vision model — does this room size look about right, or should I adjust it?',
        options: ['Looks right', 'Let me adjust'],
      },
    };
  },

  async parseBrief(input: BriefInput): Promise<BriefResult> {
    const v = input.vibe.toLowerCase();
    const styleTags = STYLE_WORDS.filter((w) => v.includes(w));
    if (styleTags.length === 0) styleTags.push('warm', 'minimalist');
    const keep: string[] = [];
    const keepRe = /keep(?:\s+my)?\s+([a-z]+(?:\s[a-z]+)?)\s*(couch|sofa|rug|lamp|table|chair|shelf)?/g;
    let mk: RegExpExecArray | null;
    while ((mk = keepRe.exec(v))) keep.push([mk[1], mk[2]].filter(Boolean).join(' ').trim());
    const avoid: string[] = [];
    const avoidRe = /(?:no|avoid|without|not)\s+([a-z]+(?:\s[a-z]+)?)/g;
    let av: RegExpExecArray | null;
    while ((av = avoidRe.exec(v))) avoid.push(av[1].trim());
    const anchor = styleTags.find((t) => ['walnut', 'oak', 'wood', 'woods'].includes(t));
    const directionTitle = anchor
      ? `Warm minimalist, anchored in ${anchor === 'woods' ? 'walnut' : anchor}.`
      : `A calm, warm refresh.`;
    const directionRationale = `${styleTags.slice(0, 3).join(', ')} — a calm, warm room to replace the tired one, every piece sourced to your number.`;
    return {
      styleTags,
      mustKeep: keep,
      avoidMaterials: avoid,
      palette: ['walnut', 'oak', 'sage', 'terracotta', 'cream'],
      directionTitle,
      directionRationale,
    };
  },

  async narrate(input: NarrateInput): Promise<string> {
    return templateNarration(input);
  },

  async critic(input: CriticInput): Promise<CriticResult> {
    const slots = new Set(input.cart.map((p) => p.slot));
    const core = ['seating_primary', 'lighting', 'coffee_table'];
    const coverage = core.filter((c) => slots.has(c as any)).length / core.length;
    const paletteHit = input.concept.palette.filter((c) =>
      input.cart.some((p) => [...p.materials, ...p.colors].join(' ').toLowerCase().includes(c))).length;
    const score = Math.max(0, Math.min(1, 0.62 + 0.28 * coverage + 0.02 * paletteHit));
    return { score: Math.round(score * 100) / 100, note: 'rubric: core coverage + palette alignment' };
  },
};
