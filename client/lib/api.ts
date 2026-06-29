/* Spruce client API — the client ONLY ever calls relative /api/* (no host or port
   is baked in). In dev, Vite proxies /api to the Fastify server; in prod the same
   server serves this SPA. */
import type { Design, LogEvent, Product, RoomModel } from '../../shared/types';
import type { RoomSpec } from '../../shared/render/room';

export type Config = {
  provider: 'qwen' | 'anthropic' | 'heuristic';
  models: Record<string, string>;
  catalogSize: number;
  webSearch: boolean;
  warnings: string[];
};

async function j<T>(url: string, opts?: RequestInit): Promise<T> {
  const r = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    throw new Error((body as any).error || `${r.status} ${r.statusText}`);
  }
  return r.json() as Promise<T>;
}

export const api = {
  config: () => j<Config>('/api/config'),
  health: () => j<{ ok: boolean; provider: string; catalog: number }>('/api/health'),
  demo: () => j<{ design: Design; currentRoomSpec: RoomSpec; vibe: string; budget: number }>('/api/demo'),
  ground: (body: { imageBase64?: string; mediaType?: string; vibe: string; budget: number; hasReference: boolean; demo?: boolean }) =>
    j<{ room: RoomModel; model: string; used: string; currentRoomSpec?: RoomSpec }>('/api/ground', { method: 'POST', body: JSON.stringify(body) }),
  design: (body: { room: RoomModel; vibe: string; budget: number; settings?: unknown; seeded?: boolean }) =>
    j<Design>('/api/design', { method: 'POST', body: JSON.stringify(body) }),
  share: (token: string) => j<{ design: Design }>(`/api/share/${token}`),
  catalog: () => j<{ products: Product[] }>('/api/catalog'),
  log: (id: string) => j<{ events: LogEvent[] }>(`/api/log/${id}`),
};

/** Read a File as base64 (no data: prefix) for the /api/ground call. */
export function fileToBase64(file: File): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = String(reader.result);
      const comma = res.indexOf(',');
      resolve({ base64: res.slice(comma + 1), mediaType: file.type || 'image/jpeg' });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
