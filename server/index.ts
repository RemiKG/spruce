/* Spruce — the API server. Serves the built SPA and the JSON API. All keys are
   read from the environment server-side; the client only ever calls relative
   /api/* (no host/port is baked into client code). Deployable on any Node host
   (the design targets Alibaba Cloud ECS/SAS, Singapore). */
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ENV, activeProvider, MODEL_IDS } from './env';
import { loadCatalog, catalogSize, findProduct, searchCatalog } from './catalog';
import { readLog } from './persistence';
import { sourceDesign } from './sourcing';
import { groundRoom } from './ai/index';
import { demoRoom, demoCurrentRoomSpec, DEMO_VIBE, DEMO_BUDGET } from './demo';
import { solve, planFor, scoreAndFit } from '../shared/solver';
import { decodeShare } from '../shared/share';
import { DEFAULT_SETTINGS } from '../shared/types';
import type { Candidate, RoomModel, SolverSettings } from '../shared/types';

const HERE = dirname(fileURLToPath(import.meta.url));
const CLIENT_DIR = join(HERE, '..', 'dist', 'client');

// maxParamLength: share tokens (base64 of the brief + grounded room) ride in the
// /api/share/:token path param and comfortably exceed Fastify's 100-char default.
const app = Fastify({ logger: false, bodyLimit: 28 * 1024 * 1024, maxParamLength: 16384 });
await app.register(cors, { origin: true });

// ---- API -------------------------------------------------------------------
app.get('/api/health', async () => ({ ok: true, provider: activeProvider(), catalog: catalogSize() }));

app.get('/api/config', async () => {
  const provider = activeProvider();
  const warnings: string[] = [];
  if (provider === 'heuristic') warnings.push('No DASHSCOPE_API_KEY or ANTHROPIC_API_KEY set — running deterministic offline mode (solver + real catalog still fully live).');
  if (provider === 'anthropic') warnings.push('Running on the Anthropic fallback engine — set DASHSCOPE_API_KEY for the Qwen path (embeddings/rerank + web_search).');
  return {
    provider,
    models: MODEL_IDS[provider],
    catalogSize: catalogSize(),
    webSearch: ENV.ENABLE_WEB_SEARCH && provider === 'qwen',
    warnings,
  };
});

app.get('/api/catalog', async () => ({ products: loadCatalog() }));

app.get('/api/product/:id', async (req, reply) => {
  const p = findProduct((req.params as any).id);
  if (!p) return reply.code(404).send({ error: 'not found' });
  return p;
});

// ground a room from a photo (base64 in JSON — no host/port, no multipart)
app.post('/api/ground', async (req) => {
  const b = (req.body || {}) as any;
  if (b.demo) return { room: demoRoom(), model: 'seeded', used: 'seeded', currentRoomSpec: demoCurrentRoomSpec() };
  const out = await groundRoom({
    imageBase64: b.imageBase64, mediaType: b.mediaType || 'image/jpeg',
    vibe: String(b.vibe || ''), budget: Number(b.budget) || 0, hasReference: !!b.hasReference,
  });
  return out;
});

// source a full design from a grounded room + brief
app.post('/api/design', async (req) => {
  const b = (req.body || {}) as any;
  const room = b.room as RoomModel;
  if (!room) throw new Error('room required (ground first)');
  const design = await sourceDesign({
    room, vibe: String(b.vibe || ''), budget: Number(b.budget) || 800,
    settings: b.settings as Partial<SolverSettings> | undefined, seeded: !!b.seeded,
  });
  return design;
});

// the seeded demo — same engine, pre-filled inputs
app.get('/api/demo', async () => {
  const design = await sourceDesign({ room: demoRoom(), vibe: DEMO_VIBE, budget: DEMO_BUDGET, seeded: true });
  return { design, currentRoomSpec: demoCurrentRoomSpec(), vibe: DEMO_VIBE, budget: DEMO_BUDGET };
});

// server-side mirror of the live re-solve (client normally does this locally)
app.post('/api/resolve', async (req) => {
  const b = (req.body || {}) as any;
  const settings: SolverSettings = { ...DEFAULT_SETTINGS, ...(b.settings || {}) };
  const room = b.room as RoomModel;
  const candidates = b.candidates as Candidate[];
  const plan = b.plan || planFor(room, b.brief || ({ vibeText: '', styleTags: [] } as any));
  return solve(candidates, { budget: Number(b.budget), settings, room, plan, prior: b.prior || null });
});

// stateless share: decode inputs, recompute the design live
app.get('/api/share/:token', async (req, reply) => {
  const payload = decodeShare((req.params as any).token);
  if (!payload) return reply.code(400).send({ error: 'bad share token' });
  const design = await sourceDesign({ room: payload.room, vibe: payload.brief.vibeText, budget: payload.budget, seeded: payload.seeded });
  return { design };
});

// the raw auditable NDJSON sourcing log
app.get('/api/log/:id', async (req) => ({ events: readLog((req.params as any).id) }));

// ---- static SPA (prod) + SPA fallback --------------------------------------
if (existsSync(CLIENT_DIR)) {
  await app.register(fastifyStatic, { root: CLIENT_DIR, wildcard: false });
  app.setNotFoundHandler((req, reply) => {
    if (req.raw.url?.startsWith('/api')) return reply.code(404).send({ error: 'not found' });
    return reply.sendFile('index.html');
  });
  console.log(`[spruce] serving built client from ${CLIENT_DIR}`);
} else {
  console.log('[spruce] no dist/client yet — run `npm run dev` (Vite serves the client and proxies /api here)');
}

await app.listen({ port: ENV.PORT, host: '0.0.0.0' });
console.log(`[spruce] API on http://localhost:${ENV.PORT}  ·  engine: ${activeProvider()}  ·  catalog: ${catalogSize()} products`);
