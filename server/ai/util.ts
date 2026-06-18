/* Small helpers shared by the AI providers. */

/** Pull the first well-formed JSON object/array out of a model's prose. */
export function extractJson<T = any>(text: string): T {
  const trimmed = text.trim();
  // fenced code block?
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fence ? fence[1] : trimmed;
  const start = body.search(/[[{]/);
  if (start < 0) throw new Error('no JSON found in model output');
  // walk to the matching bracket
  const open = body[start];
  const close = open === '{' ? '}' : ']';
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < body.length; i++) {
    const ch = body[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
    } else if (ch === '"') inStr = true;
    else if (ch === open) depth++;
    else if (ch === close) { depth--; if (depth === 0) return JSON.parse(body.slice(start, i + 1)); }
  }
  return JSON.parse(body.slice(start)); // last-ditch
}

export const clampNum = (x: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, Number.isFinite(x) ? x : lo));

export const asArray = (x: unknown): string[] =>
  Array.isArray(x) ? x.map((v) => String(v)).filter(Boolean) : [];
