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
