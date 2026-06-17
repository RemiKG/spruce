# Spruce catalog — schema & slot taxonomy

The catalog is the one warm, persistent store. It lives at `catalog/products.json`
(hydrated by `shared/catalog.ts`). Each record is a **real** product.

## Record schema

| field | type | notes |
|---|---|---|
| `id` | string | stable slug |
| `title` / `subtitle` | string | product name + variant |
| `category` | enum | `sofa`, `loveseat`, `armchair`, `coffee_table`, `side_table`, `rug`, `arc_lamp`, `floor_lamp`, `pendant`, `pouf`, `plant`, `art`, `mirror`, `sideboard`, `shelf` |
| `retailer` | `{name, url}` | **real** retailer + **real** product URL (clickable, at the shown price) |
| `price` | number | captured snapshot |
| `currency` | enum | `USD` … |
| `capturedAt` | ISO date | when price/stock were captured |
| `dims` | `{w, d, h}` | assembled, **centimetres** |
| `materials` / `colors` / `styleTags` | string[] | for semantic style search |
| `inStock` | boolean | out-of-stock pieces are never silently placed — they auto-swap |
| `shipsFree` / `deliveryDays` | — | delivery info |
| `region` | string | catalog coverage starts in one region and expands |

## Slot taxonomy (one product per slot in a room)

`seating_primary` (sofa/loveseat) · `lighting` (arc/floor/pendant lamp) ·
`coffee_table` · `rug` · `seating_secondary` (armchair/pouf) · `side_table` ·
`plant` · `wall_art` (art/mirror) · `storage` (sideboard/shelf).

The room **plan** (which slots to fill) is chosen from the room size + brief. The
deterministic solver fills at most one product per slot, maximising a style- and
coverage-weighted value subject to `total ≤ budget` and per-piece fit.

## Honesty

- The buyable diorama is the **paper-cut rendering** of each piece; the real
  product photo + live price live one click away on the retailer page.
- Anything not sourced from a real record with a real URL is not shown as buyable.
