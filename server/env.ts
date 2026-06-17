/* Spruce — environment + engine selection. Keys are read from the environment
   ONLY (never hardcoded, never committed). The app runs with none of them
   (deterministic offline mode); each key lights up more of the real engine. */
import 'dotenv/config';

export const ENV = {
  PORT: Number(process.env.PORT) || 8787,

  // Qwen Cloud (the design's primary, documented engine)
  DASHSCOPE_API_KEY: process.env.DASHSCOPE_API_KEY || '',
  DASHSCOPE_BASE_URL: process.env.DASHSCOPE_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
  DASHSCOPE_RERANK_BASE_URL: process.env.DASHSCOPE_RERANK_BASE_URL || 'https://dashscope-intl.aliyuncs.com/api/v1',

  // Anthropic (fallback reasoning provider — works live without a Qwen key)
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  // Fast by default for a snappy live demo; raise to claude-sonnet-5 / claude-opus-4-8
  // via ANTHROPIC_MODEL for higher-fidelity room grounding.
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001',

  ENABLE_WEB_SEARCH: (process.env.SPRUCE_ENABLE_WEB_SEARCH || 'false') === 'true',
};

export type ProviderName = 'qwen' | 'anthropic' | 'heuristic';

/** Which reasoning engine is live right now (surfaced honestly in the UI). */
export function activeProvider(): ProviderName {
  if (ENV.DASHSCOPE_API_KEY) return 'qwen';
  if (ENV.ANTHROPIC_API_KEY) return 'anthropic';
  return 'heuristic';
}

export const MODEL_IDS = {
  qwen: { grounding: 'qwen3-vl-plus', agent: 'qwen3.7-max', structured: 'qwen3.7-plus', critic: 'qwen3-vl-plus', styleSearch: 'text-embedding-v4 + qwen3-rerank' },
  anthropic: { grounding: ENV.ANTHROPIC_MODEL, agent: ENV.ANTHROPIC_MODEL, structured: ENV.ANTHROPIC_MODEL, critic: ENV.ANTHROPIC_MODEL, styleSearch: 'lexical' },
  heuristic: { grounding: 'manual', agent: 'deterministic', structured: 'deterministic', critic: 'rubric', styleSearch: 'lexical' },
} as const;
