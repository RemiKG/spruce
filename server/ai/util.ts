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

/** Cap a string at `max` chars WITHOUT cutting mid-word ("eclectic fram." → "eclectic"). */
export function trimWords(x: unknown, max: number): string {
  const t = String(x ?? '').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const sp = cut.lastIndexOf(' ');
  return (sp > max * 0.5 ? cut.slice(0, sp) : cut).replace(/[\s,;:·—-]+$/, '');
}

/** Cap a string at ~`max` chars, preferring to end at a sentence boundary so
 *  nothing ships cut mid-thought ("…the room feels" → full previous sentence). */
export function trimSentence(x: unknown, max: number): string {
  const t = String(x ?? '').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const end = Math.max(cut.lastIndexOf('.'), cut.lastIndexOf('!'), cut.lastIndexOf('?'));
  if (end > max * 0.4) return cut.slice(0, end + 1);
  return trimWords(t, max) + '…';
}

/** Models sometimes echo the placeholder option labels ("A", "B", "short A")
 *  instead of writing real answers — swap those for usable defaults. */
export function cleanOptions(raw: unknown, fallback: [string, string]): [string, string] {
  const opts = [0, 1].map((i) => String((raw as any)?.[i] ?? '').trim());
  return [0, 1].map((i) => {
    const o = opts[i];
    const placeholder = o.length < 3 || /^(option|answer|choice|short)?\s*[ab12]\.?$/i.test(o) || /^short\s+(answer|option)/i.test(o);
    return placeholder ? fallback[i] : trimWords(o, 60);
  }) as [string, string];
}
