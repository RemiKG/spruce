/* Spruce — stateless sharing + hashing. A design re-runs live from its inputs,
   so a shareable link just encodes the inputs (brief + grounded room), never a
   stored blob. Isomorphic (browser + Node), dependency-free. */
import type { Brief, RoomModel } from './types';

export type SharePayload = {
  v: 1;
  budget: number;
  brief: Pick<Brief, 'vibeText' | 'styleTags' | 'mustKeep' | 'avoidMaterials' | 'currency' | 'units' | 'region'>;
  room: RoomModel;
  seeded?: boolean;
};

// --- base64url over raw bytes (avoids btoa/atob unicode pitfalls) ------------
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function bytesToB64url(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i], b1 = bytes[i + 1], b2 = bytes[i + 2];
    out += B64[b0 >> 2];
    out += B64[((b0 & 3) << 4) | ((b1 ?? 0) >> 4)];
    out += i + 1 < bytes.length ? B64[((b1 & 15) << 2) | ((b2 ?? 0) >> 6)] : '';
    out += i + 2 < bytes.length ? B64[b2 & 63] : '';
  }
  return out;
}

function b64urlToBytes(str: string): Uint8Array {
  const lookup = new Int16Array(256).fill(-1);
  for (let i = 0; i < B64.length; i++) lookup[B64.charCodeAt(i)] = i;
  const bytes: number[] = [];
  let buffer = 0, bits = 0;
  for (const ch of str) {
    const v = lookup[ch.charCodeAt(0)];
    if (v < 0) continue;
    buffer = (buffer << 6) | v;
    bits += 6;
    if (bits >= 8) { bits -= 8; bytes.push((buffer >> bits) & 0xff); }
  }
  return Uint8Array.from(bytes);
}

export function encodeShare(payload: SharePayload): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  return bytesToB64url(bytes);
}

export function decodeShare(token: string): SharePayload | null {
  try {
    const bytes = b64urlToBytes(token);
    const json = new TextDecoder().decode(bytes);
    const obj = JSON.parse(json);
    if (obj && obj.v === 1) return obj as SharePayload;
    return null;
  } catch {
    return null;
  }
}

// --- small deterministic hashes ---------------------------------------------
export function fnv1a(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/** A short, stable design id from its inputs (stateless). */
export function designId(payload: SharePayload): string {
  return 'd_' + fnv1a(JSON.stringify(payload)).slice(0, 8);
}
