/* Spruce — the AI-seam contract. Every provider (Qwen, Anthropic, heuristic)
   implements the same four reasoning functions, so the sourcing pipeline is
   provider-agnostic. The solver, fit-checker and catalog are NOT here — they are
   deterministic and always run for real, regardless of provider. */
import type { Brief, CartItem, Product, RoomModel } from '../../shared/types';

export type GroundInput = {
  imageBase64?: string;
  mediaType?: string;      // e.g. 'image/jpeg'
  vibe: string;
  budget: number;
  hasReference: boolean;   // a credit-card / A4 sheet dropped in for calibration
};

export type BriefInput = { vibe: string; budget: number; room: RoomModel };

export type BriefResult = {
  styleTags: string[];
  mustKeep: string[];
  avoidMaterials: string[];
  palette: string[];
  directionTitle: string;
  directionRationale: string;
};

export type NarrateInput = {
  budget: number;
  total: number;
  kept: CartItem[];
  swapped: CartItem[];
  dropped: CartItem[];
};

export type CriticInput = {
  concept: { title: string; rationale: string; palette: string[] };
  brief: Brief;
  cart: Product[];
};

export type CriticResult = { score: number; note: string };

export interface AiProvider {
  groundRoom(input: GroundInput): Promise<RoomModel>;
  parseBrief(input: BriefInput): Promise<BriefResult>;
  narrate(input: NarrateInput): Promise<string>;
  critic(input: CriticInput): Promise<CriticResult>;
}
