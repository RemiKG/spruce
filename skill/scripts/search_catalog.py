#!/usr/bin/env python3
"""Spruce sourcing skill — search the real product catalog (stdlib only).

Reads catalog/products.json and prints matching candidate products as JSON.
The skill proposes candidates; the deterministic budget-solver disposes.

Usage:
    python search_catalog.py --slot seating_primary --q "warm boucle" --max-price 300 --in-stock
"""
import argparse
import json
import os
import sys

CATEGORY_TO_SLOT = {
    "sofa": "seating_primary", "loveseat": "seating_primary",
    "armchair": "seating_secondary", "pouf": "seating_secondary",
    "arc_lamp": "lighting", "floor_lamp": "lighting", "table_lamp": "lighting", "pendant": "lighting",
    "coffee_table": "coffee_table", "side_table": "side_table", "rug": "rug",
    "plant": "plant", "art": "wall_art", "mirror": "wall_art",
    "sideboard": "storage", "shelf": "storage",
}


def catalog_path() -> str:
    here = os.path.dirname(os.path.abspath(__file__))
    return os.path.normpath(os.path.join(here, "..", "..", "catalog", "products.json"))


def load():
    with open(catalog_path(), "r", encoding="utf-8") as f:
        return json.load(f)


def slot_of(rec: dict) -> str:
    return rec.get("slot") or CATEGORY_TO_SLOT.get(rec.get("category", ""), "accent")


def main() -> int:
    ap = argparse.ArgumentParser(description="Search the Spruce product catalog.")
    ap.add_argument("--slot")
    ap.add_argument("--q", default="")
    ap.add_argument("--max-price", type=float, dest="max_price")
    ap.add_argument("--region")
    ap.add_argument("--in-stock", action="store_true", dest="in_stock")
    args = ap.parse_args()

    q = args.q.lower().strip()
    out = []
    for rec in load():
        if args.slot and slot_of(rec) != args.slot:
            continue
        if args.region and rec.get("region", "US") != args.region:
            continue
        if args.max_price is not None and rec.get("price", 0) > args.max_price:
            continue
        if args.in_stock and not rec.get("inStock", True):
            continue
        if q:
            hay = " ".join([
                rec.get("title", ""), rec.get("subtitle", ""),
                " ".join(rec.get("materials", [])), " ".join(rec.get("colors", [])),
                " ".join(rec.get("styleTags", [])),
            ]).lower()
            if q not in hay and not any(tok in hay for tok in q.split()):
                continue
        out.append({
            "id": rec["id"], "title": rec["title"], "subtitle": rec.get("subtitle"),
            "slot": slot_of(rec), "price": rec["price"], "currency": rec.get("currency", "USD"),
            "retailer": rec["retailer"]["name"], "url": rec["retailer"]["url"],
            "dims_cm": rec["dims"], "materials": rec.get("materials", []),
            "colors": rec.get("colors", []), "inStock": rec.get("inStock", True),
            "capturedAt": rec.get("capturedAt"),
        })

    json.dump(out, sys.stdout, indent=2, ensure_ascii=False)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
