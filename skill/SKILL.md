---
name: spruce-sourcing
description: >-
  Source real, in-stock, in-budget furniture and decor for a room redesign.
  Given a room's measured dimensions, a style brief and a budget, search a curated
  catalog of real products (real retailer, real product URL, captured price,
  dimensions, stock) and return candidates per room slot for the deterministic
  budget-solver to assemble into a cart. Every item deep-links to the real store.
license: MIT
---

# Spruce sourcing skill

This skill packages Spruce's product sourcing so a Qwen agentic run (`qwen3.7-max`
with `preserve_thinking`) can find **real, buyable** pieces for a room, then hand
them to the deterministic budget-solver.

## When to use

Use it during the sourcing loop, after the room has been grounded (`qwen3-vl-plus`)
and the brief parsed. Call it once per room **slot** you need to fill:
`seating_primary`, `lighting`, `coffee_table`, `rug`, `seating_secondary`,
`side_table`, `plant`, `wall_art`, `storage`.

## How to use

Run the bundled script (Python 3, standard library only):

```
python scripts/search_catalog.py --slot seating_primary --q "warm boucle 2-seat" --max-price 300 --in-stock
```

It prints a JSON array of candidate products. Each candidate is a real record:

```json
{
  "id": "glostad-loveseat",
  "title": "GLOSTAD loveseat",
  "slot": "seating_primary",
  "price": 279,
  "currency": "USD",
  "retailer": "IKEA",
  "url": "https://www.ikea.com/us/en/p/glostad-loveseat-knisa-dark-gray-70489011/",
  "dims_cm": { "w": 154, "d": 77, "h": 73 },
  "materials": ["polyester", "foam"],
  "colors": ["dark gray"],
  "inStock": true,
  "capturedAt": "2026-07-08"
}
```

## Contract (important)

- **Never invent products, prices, stock or URLs.** Only return records the
  catalog actually contains. Live web results (Qwen `web_search` / `web_extractor`)
  may extend the catalog, but each must carry a real, clickable retailer URL.
- **Prices are captured snapshots** (`capturedAt`) — stock and prices move, so the
  cart is timestamped and re-checkable.
- **The skill proposes; the solver disposes.** This skill only *finds* candidates.
  The deterministic budget-solver proves `total ≤ budget` and every piece fits the
  measured room before a human sees the cart.

See `references/catalog.md` for the full schema and the slot taxonomy. The same
catalog is exposed over MCP by `mcp/server.ts` (`catalog_search`, `catalog_get`,
`catalog_slots`) for Responses-API / Slack / Telegram surfaces.
