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
    if (r.status === 413) throw new Error('that photo is too large to upload — try a smaller one');
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

/** Decode a File into a bitmap, with an <img> fallback for older engines. */
async function decodeImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(file);
  } catch {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('undecodable')); };
      img.src = url;
    });
  }
}

/** Read a File as a downscaled JPEG for the /api/ground call. Phone photos run
    3–8 MB and the hosted function caps request bodies well under that, so we
    decode + resize to a 1600 px long edge before shipping. Re-encoding also
    guarantees the on-screen preview is a renderable JPEG (a HEIC or non-image
    file fails loudly here instead of leaving a blank panel). */
export async function fileToBase64(file: File): Promise<{ base64: string; mediaType: string; previewUrl: string }> {
  let src: ImageBitmap | HTMLImageElement;
  try {
    src = await decodeImage(file);
  } catch {
    throw new Error("couldn't read that file as a photo — try a JPG or PNG");
  }
  const w0 = 'naturalWidth' in src ? src.naturalWidth : src.width;
  const h0 = 'naturalHeight' in src ? src.naturalHeight : src.height;
  if (!w0 || !h0) throw new Error("couldn't read that file as a photo — try a JPG or PNG");
  const MAX_EDGE = 1600;
  const scale = Math.min(1, MAX_EDGE / Math.max(w0, h0));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w0 * scale));
  canvas.height = Math.max(1, Math.round(h0 * scale));
  canvas.getContext('2d')!.drawImage(src, 0, 0, canvas.width, canvas.height);
  if ('close' in src) src.close();
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  return { base64: dataUrl.slice(dataUrl.indexOf(',') + 1), mediaType: 'image/jpeg', previewUrl: dataUrl };
}
