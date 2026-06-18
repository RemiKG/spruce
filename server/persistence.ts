/* Spruce — the auditable, append-only NDJSON sourcing log (one file per design,
   hash-stamped, replayable). Carts are stateless and recompute from inputs; this
   log is the durable record of every step and decision. */
import { appendFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { fnv1a } from '../shared/share';
import type { LogEvent } from '../shared/types';

const HERE = dirname(fileURLToPath(import.meta.url));
const LOG_DIR = join(HERE, '..', 'data', 'logs');

export function appendLog(designId: string, events: LogEvent[]): string {
  mkdirSync(LOG_DIR, { recursive: true });
  const path = join(LOG_DIR, `${designId}.ndjson`);
  const lines = events.map((e) => JSON.stringify(e)).join('\n') + '\n';
  appendFileSync(path, lines, 'utf8');
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
