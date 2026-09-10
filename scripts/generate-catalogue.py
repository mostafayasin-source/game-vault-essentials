"""Generate the real-catalogue migration SQL and the source manifest from the
verified Steam data plus the hand-written per-title details."""

import json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent
PROJECT = ROOT.parent
verified = {r["key"]: r for r in json.loads((ROOT / "catalogue-verified.json").read_text())}
details = json.loads((ROOT / "catalogue-details.json").read_text())

LEGACY_SKUS = [
    "PS5-NEB-PHY", "PS5-NEB-DIG", "PS5-ASH-PHY", "PS5-TIDE-DIG", "PS5-IRON-DIG", "PS5-HOLL-PHY",
    "XSX-NEB-DIG", "XSX-ASH-PHY", "XSX-GRID-DIG", "XSX-SOLR-DIG", "XSX-PITCH-PHY", "XSX-HOLL-DIG",
    "PC-ASH-DIG", "PC-GRID-DIG", "PC-VOID-DIG", "PC-IRON-DIG", "PC-APEX-DIG", "PC-LAST-DIG",
]

FEATURED = {
    "elden-ring", "baldurs-gate-3", "spider-man-2", "ac-shadows", "forza-horizon-5",
    "monster-hunter-wilds", "silent-hill-2", "civ-7", "split-fiction", "starfield",
    "ea-fc-25", "doom-dark-ages",
}

PS5_COMPAT = (
    "Disc edition for PlayStation 5. Requires a PS5 console with a disc drive — the Standard "
    "model, or a PS5 Digital Edition with the official Disc Drive attached."
)
XBOX_COMPAT = (
    "Disc edition for Xbox Series X. Requires an Xbox Series X with a disc drive. Not playable on "
    "Xbox Series S or the all-digital Xbox Series X."
)


def price_for(year: int, platform: str) -> int:
    if year >= 2025:
        base = 79900
    elif year >= 2023:
        base = 64900
    elif year >= 2021:
        base = 44900
    else:
        base = 29900
    if platform == "pc":
        base -= 10000
    return base


def year_of(entry) -> int:
    m = re.search(r"(19|20)\d{2}", entry.get("release_date") or "")
    return int(m.group(0)) if m else 2020


def sku_key(key: str) -> str:
    return re.sub(r"[^A-Z0-9]+", "-", key.upper()).strip("-")


def q(text: str) -> str:
    return "'" + text.replace("'", "''") + "'"


rows = []
manifest = []
for key, det in details.items():
    v = verified[key]
    cover_file = PROJECT / "src" / "assets" / "covers" / f"{key}.jpg.asset.json"
    cover_url = json.loads(cover_file.read_text())["url"]
    year = year_of(v)
    title = v["title"]
    genre = v["genre"]
    desc = det["desc"]
    store_url = v["store_url"]
    art_url = v["cover"]["url"]
    listings = []
    if det["disc_ps5"]:
        listings.append(("ps5", "physical", PS5_COMPAT, f"GV-PS5-{sku_key(key)}-DISC"))
    if det["disc_xbox"]:
        listings.append(("xbox", "physical", XBOX_COMPAT, f"GV-XSX-{sku_key(key)}-DISC"))
    pc_compat = (
        "Digital PC download code. Activates on Steam for Windows; a free Battle.net account is "
        "also required to play."
        if key == "diablo-iv"
        else "Digital PC download code. Activates on Steam for Windows."
    )
    listings.append(("pc", "digital", pc_compat, f"GV-PC-{sku_key(key)}-STEAM"))

    for platform, fmt, compat, sku in listings:
        rows.append(
            "("
            + ", ".join(
                [
                    q(sku),
                    q(title),
                    q(platform),
                    q(fmt),
                    str(price_for(year, platform)),
                    q(cover_url),
                    q(art_url),
                    q(store_url),
                    q(f"{desc} Released {year}."),
                    q(compat),
                    q(genre),
                    "true",
                    "5",
                    "true" if (key in FEATURED and platform == "ps5") or (key in FEATURED and platform == "pc" and not det["disc_ps5"]) else "false",
                    "true",
                ]
            )
            + ")"
        )
        manifest.append(
            {
                "sku": sku,
                "title": title,
                "platform": platform,
                "format": fmt,
                "steam_app_id": v["appid"],
                "verification_url": store_url,
                "cover_source_url": art_url,
                "cover_cdn_url": cover_url,
                "release_date": v.get("release_date"),
                "publishers": v.get("publishers"),
            }
        )

sql = f"""-- Real-game catalogue for GameVault.
-- Idempotent: safe to re-run. Fictional demo SKUs are retired (unlisted), never deleted,
-- so existing order history keeps referring to them.

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cover_url text NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cover_source_url text NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS source_url text NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS listed boolean NOT NULL DEFAULT true;
ALTER TABLE public.products ALTER COLUMN image_key SET DEFAULT 'action';
ALTER TABLE public.products ALTER COLUMN max_quantity SET DEFAULT 5;

CREATE INDEX IF NOT EXISTS products_listed_idx ON public.products(listed);

-- Retire the fictional demo listings from the visible catalogue.
UPDATE public.products
SET listed = false, available = false, featured = false
WHERE sku IN ({", ".join(q(s) for s in LEGACY_SKUS)});

INSERT INTO public.products
  (sku, title, platform, format, price_minor, cover_url, cover_source_url, source_url,
   description, compatibility, genre, available, max_quantity, featured, listed)
VALUES
{",\n".join(rows)}
ON CONFLICT (sku) DO UPDATE SET
  title = EXCLUDED.title,
  platform = EXCLUDED.platform,
  format = EXCLUDED.format,
  price_minor = EXCLUDED.price_minor,
  cover_url = EXCLUDED.cover_url,
  cover_source_url = EXCLUDED.cover_source_url,
  source_url = EXCLUDED.source_url,
  description = EXCLUDED.description,
  compatibility = EXCLUDED.compatibility,
  genre = EXCLUDED.genre,
  available = EXCLUDED.available,
  max_quantity = EXCLUDED.max_quantity,
  featured = EXCLUDED.featured,
  listed = EXCLUDED.listed;
"""

(PROJECT / "supabase" / "migrations" / "20260910130000_real_game_catalogue.sql").write_text(sql)
(ROOT / "catalogue-manifest.json").write_text(json.dumps(manifest, indent=2))

counts = {}
for m in manifest:
    counts[m["platform"]] = counts.get(m["platform"], 0) + 1
print("listings:", len(manifest), counts, "titles:", len(details))
