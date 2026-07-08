# Spruce 🌲

> **Spruce up your space — every piece real, every dollar counted.**
> *The picture is the cart.*

Snap a photo of the room you're sick of and type a budget. A little designer reads the
space, designs a direction, then — the part every other AI-decor app skips — **goes and
sources every single piece for real**: live products, live prices, in stock, that fit your
room's actual dimensions and add up to *under your number*. What it shows you is not a
render. **It's a cart** — every piece deep-links to the real retailer at the shown price.

Spruce is a **Track‑4 (Autopilot Agent)** entry for the Qwen Cloud Global AI Hackathon: a
procurement‑and‑design workflow automated end‑to‑end, with three human‑in‑the‑loop gates
(approve the direction → steer the money → approve the cart).

---

## The one mechanic

On the money‑shot screen, **drag the budget slider and the whole paper diorama re‑solves
the cart live** — pieces swap to cheaper twins, the least‑important nice‑to‑have drops, the
core stays, and the monospace tally lands *under* your number in a few milliseconds.
Click any piece → the real store opens at the shown price.

Why it can't be faked: the judge supplies their own room, budget and words; every piece
deep‑links to a real retailer page the author doesn't control; and the hard core — a
**deterministic budget‑solver** that proves `total ≤ budget` *and* every piece fits the
measured room — is plain, auditable code. The LLM proposes; the solver disposes.

---

## What is REAL (and what's a labelled convenience)

Everything below is genuinely live — real data path, real persistence, real integrations —
never mocked:

| Piece | How it's real |
|---|---|
| **The catalog** | `catalog/products.json` — real products from a real retailer (IKEA, US), each with the **real product URL** (every one verified to resolve to a live product page), captured price + date, real assembled dimensions, materials, stock. It is the one warm persistent store. |
| **Clickable retailer links** | every cart item / price‑tag opens the real product page at the shown (captured) price — the external, un‑fabricatable record. |
| **The budget‑solver gate** | `shared/solver.ts` — an exact multiple‑choice knapsack over integer dollars. Provably enforces `total ≤ budget`, one product per room slot, `leaveHeadroom`, locks, tax/shipping — **before** a human sees the cart. Deterministic: identical inputs → identical cart. |
| **The fit checker** | `shared/fit.ts` — footprint vs. the measured room, walkway clearance, fits‑through‑the‑doorway (by smallest cross‑section), assembled‑height vs. ceiling, plus a collective packing check. |
| **The live re‑solve** | the budget slider re‑runs the *same* solver in the browser over the sourced candidates in ~1 ms. The on‑screen "re‑solved in Nms" is measured, not canned. |
| **Room grounding from a photo** | `POST /api/ground` sends the photo to a vision model and returns a structured `RoomModel` (objects, metre dimensions with an honest error bar, light, doorway, one clarifying question). Runs live on **Qwen3‑VL** (with a Qwen key) or **Anthropic vision** (fallback). |
| **Brief understanding, narration, concept‑critic** | live LLM calls (Qwen or Anthropic) turn the messy vibe into structured intent, narrate the swaps, and score "does the cart achieve the concept?" |
| **Persistence** | an append‑only, hash‑stamped **NDJSON sourcing log** per design (`data/logs/*.ndjson`) — replayable. Designs are otherwise stateless: a **shareable link encodes the inputs** and re‑computes (`/api/share/:token`). No card or payment is ever stored. |
| **Every on‑screen number** | budget‑fit, catalog size searched, tool‑calls, re‑solve latency, VL objects, concept‑critic score, % in stock — all computed/counted live. |
| **The catalog MCP + custom skill** | `mcp/server.ts` (a real MCP server exposing `catalog_search`/`catalog_get`/`catalog_slots`) and `skill/` (a `SKILL.md` + a stdlib Python `search_catalog.py`) — the rubric's named surfaces. |

**Labelled conveniences (on top, never instead):** the **seeded demo room** pre‑fills a
real room grounding + budget + vibe into the same fields and runs the same live engine; and
the furniture in the diorama is the **paper‑cut rendering** of each piece — the
background‑removed real product photo + live price live one click away on the retailer page
(the honesty seam, stated in‑UI on the *limits* screen).

---

## The engine (provider‑abstracted)

The design's load‑bearing engine is **Qwen Cloud**. Because Spruce ships behind an
env‑var seam, it activates the moment a key exists and degrades honestly without one — the
UI always says which engine is live.

```
DASHSCOPE_API_KEY set   → Qwen Cloud   (qwen3-vl-plus grounding + critic, text-embedding-v4
                                        + qwen3-rerank style search, qwen3.7-max agentic loop
                                        with web_search/web_extractor + catalog MCP, qwen3.7-plus)
else ANTHROPIC_API_KEY  → Anthropic    (Claude vision + text: grounding / brief / narration / critic;
                                        style search falls back to the deterministic lexical scorer)
else                    → heuristic    (fully deterministic; solver + catalog + links still 100% live)
```

The deterministic core (solver, fit, catalog, links, share, NDJSON log, live re‑solve) runs
for real in **all three** modes. See `_NEEDS DashScope (Qwen) API key.md` (kept outside this
repo) for exactly what a Qwen key lights up.

### Data flow

```
photo + budget + vibe
   │  POST /api/ground        → RoomModel (qwen3-vl-plus | Anthropic vision | manual)
   ▼
POST /api/design
   parseBrief (LLM)           → structured brief (style tags, keeps, avoids, palette, direction)
   scoreAndFit                → candidates (lexical style score + fit) [qwen3-rerank overrides scores if keyed]
   solve()  ── the gate ──    → cart proven ≤ budget & every piece fits           ◄── deterministic
   critic (LLM)               → concept score (re-source if below threshold)
   NDJSON log (hash-stamped)  → data/logs/<id>.ndjson
   ▼
client holds the candidates → budget slider re-solves the whole cart locally in ~1 ms
   ▼
3 human gates: approve direction · steer the money · approve the cart → open the real stores
```

---

## Project structure

```
repo/
├─ index.html               # Vite entry
├─ client/                  # the SPA (React + TypeScript, plain CSS)
│  ├─ screens/              # 01 Snap · 02 Read · 03 Direction · 04 Money · 05 Steer
│  │                        # 06 Engine · 07 Checkout · 08 Settings · 09 States
│  ├─ components/           # Topbar, BudgetSlider, DioramaStage, CartRow, bits
│  ├─ lib/                  # api client, store (live re-solve), svg bridges
│  └─ styles/               # tokens.css · components.css · screens.css · app.css
├─ server/                  # Fastify API (serves the built SPA + /api)
│  ├─ index.ts              # routes
│  ├─ sourcing.ts           # the agentic sourcing orchestration
│  ├─ catalog.ts            # loads/serves the catalog
│  ├─ persistence.ts        # NDJSON sourcing log
│  ├─ demo.ts               # the seeded demo room
│  └─ ai/                   # provider seam: qwen · anthropic · heuristic
├─ shared/                  # pure TS used by BOTH server and client
│  ├─ solver.ts  fit.ts  style.ts  numbers.ts  share.ts  layout.ts  narrate.ts  types.ts
│  ├─ catalog.ts            # hydrate raw records → Product (derives slot/thumb)
│  └─ render/               # paper.ts (wordmark/sprig/mascot) · furniture.ts · room.ts
├─ catalog/products.json    # the real product catalog (verified live URLs)
├─ mcp/server.ts            # the catalog MCP server (stdio)
├─ skill/                   # the custom Qwen skill (SKILL.md + references + scripts)
└─ public/                  # manifest, service worker, icons
```

The **art is procedural hand‑authored vector** (SVG paper‑cut shapes + `feTurbulence`
grain), not a diffusion model — that's why it doesn't read as AI. The exact render harness
from the design package is ported into `shared/render/*`, so the running app is
pixel‑faithful to the approved mockups.

---

## Run it

Requires **Node ≥ 20** (developed on Node 24).

```bash
npm install

# development (two processes): Vite on :5173 proxies /api to Fastify on :8787
npm run dev

# production build + serve (the Fastify server serves the built SPA and the API)
npm run build
npm start            # → http://localhost:8787
```

The client only ever calls **relative `/api/*`** — no host or port is baked into client code.

### Configuration

Copy `.env.example` → `.env`. Nothing is required — the app runs fully offline (deterministic
mode). Each key lights up more of the real engine:

```bash
PORT=8787
DASHSCOPE_API_KEY=          # Qwen Cloud (the design's primary engine)
ANTHROPIC_API_KEY=          # fallback reasoning provider (works live without a Qwen key)
ANTHROPIC_MODEL=claude-haiku-4-5-20251001   # raise to claude-sonnet-5 / -opus for richer grounding
SPRUCE_ENABLE_WEB_SEARCH=false               # live web sourcing (Qwen path only)
```

Secrets are read from the environment only — never hardcoded, never committed.

### Other scripts

```bash
npm run mcp            # start the catalog MCP server (stdio)
npm run catalog:check  # validate the catalog data file (schema + integrity)
npm run typecheck      # tsc for client + server
```

The custom skill runs standalone too:
```bash
python skill/scripts/search_catalog.py --slot seating_primary --q "warm" --max-price 300 --in-stock
```

---

## Deploy

Any Node host works (`npm run build && npm start`). The design targets **Alibaba Cloud
ECS/SAS (Singapore)** for the hackathon eligibility gate; set `DASHSCOPE_API_KEY` +
`DASHSCOPE_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1` (a plain
pay‑as‑you‑go `sk-` key, **not** a Token‑Plan `sk-sp-` key) and the whole Qwen engine
activates. It's also a standard Vite SPA + Node server, deployable to Vercel/Render/Fly, etc.

Spruce is a **PWA** (installable, offline‑friendly): `public/manifest.webmanifest` +
`public/sw.js`. It's a responsive web app (photo capture works on mobile browsers via the
camera) — not a native app, so there is no APK.

---

## Honest limitations (also stated in‑UI, screen 09)

- One photo has error bars — dimensions carry ± until you add a reference object (calibration).
- Catalog coverage starts in one region (US) and expands; outside it, the Qwen path leans on
  live web search rather than faking local stock.
- Stock & prices move — every cart is timestamped and re‑checkable; a sold‑out piece
  auto‑swaps rather than lying about availability.
- The vision render is labelled *inspiration*; the buyable truth is the diorama built from
  real product records.
- **Spruce sources; you check out** — no card is charged here; the purchase is always yours
  on the real store.

## License

MIT — see [LICENSE](LICENSE).
