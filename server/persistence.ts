/* Spruce — the auditable, append-only NDJSON sourcing log (one file per design,
   hash-stamped, replayable). Carts are stateless and recompute from inputs; this
   log is the durable record of every step and decision. */
import { appendFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fnv1a } from '../shared/share';
import type { LogEvent } from '../shared/types';

const HERE = dirname(fileURLToPath(import.meta.url));
// On a Node host the log lives beside the app; on a read-only serverless
// filesystem (Vercel sets VERCEL=1) it falls back to the writable temp dir. The
// design response also carries every event inline, so this store is best-effort.
const LOG_DIR = process.env.VERCEL ? join(tmpdir(), 'spruce-logs') : join(HERE, '..', 'data', 'logs');

export function appendLog(designId: string, events: LogEvent[]): string {
  const lines = events.map((e) => JSON.stringify(e)).join('\n') + '\n';
  try {
    mkdirSync(LOG_DIR, { recursive: true });
    appendFileSync(join(LOG_DIR, `${designId}.ndjson`), lines, 'utf8');
  } catch {
    /* read-only filesystem — skip the durable write; events still ship inline */
  }
  return fnv1a(lines);
}

export function readLog(designId: string): LogEvent[] {
  const path = join(LOG_DIR, `${designId}.ndjson`);
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l) as LogEvent);
}
