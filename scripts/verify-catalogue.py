"""Verify every catalogue entry against the official Steam store API and check
that its portrait library cover art resolves. Writes scripts/catalogue-verified.json."""

import json, time, urllib.request, urllib.error, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
SRC = json.loads((ROOT / "catalogue-source.json").read_text())
UA = {"User-Agent": "Mozilla/5.0 (catalogue verification)"}

COVER_TEMPLATES = [
    "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/{id}/library_600x900.jpg",
    "https://cdn.cloudflare.steamstatic.com/steam/apps/{id}/library_600x900_2x.jpg",
    "https://cdn.cloudflare.steamstatic.com/steam/apps/{id}/library_600x900.jpg",
]


def get(url, timeout=25):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.read(), r.headers


results = []
for entry in SRC:
    appid = entry["appid"]
    row = dict(entry)
    row["store_url"] = f"https://store.steampowered.com/app/{appid}/"
    try:
        status, body, _ = get(
            f"https://store.steampowered.com/api/appdetails?appids={appid}&l=english&cc=se"
        )
        payload = json.loads(body).get(str(appid), {})
        if payload.get("success") and payload.get("data"):
            d = payload["data"]
            row["steam_name"] = d.get("name")
            row["coming_soon"] = bool(d.get("release_date", {}).get("coming_soon"))
            row["release_date"] = d.get("release_date", {}).get("date")
            row["type"] = d.get("type")
            row["developers"] = d.get("developers")
            row["publishers"] = d.get("publishers")
        else:
            row["steam_name"] = None
    except Exception as e:  # noqa: BLE001
        row["steam_name"] = None
        row["error"] = str(e)

    cover = None
    for tpl in COVER_TEMPLATES:
        url = tpl.format(id=appid)
        try:
            status, body, headers = get(url)
            if status == 200 and headers.get("Content-Type", "").startswith("image") and len(body) > 5000:
                cover = {"url": url, "bytes": len(body)}
                break
        except Exception:  # noqa: BLE001
            continue
    row["cover"] = cover
    results.append(row)
    print(
        f"{appid:>8} {str(row.get('steam_name'))[:45]:<46} cover={'ok' if cover else 'MISSING'}"
    )
    time.sleep(0.4)

(ROOT / "catalogue-verified.json").write_text(json.dumps(results, indent=2))
bad = [r for r in results if not r.get("steam_name") or not r["cover"] or r.get("coming_soon")]
print("\nProblems:", len(bad))
for r in bad:
    print(" -", r["title"], r["appid"], r.get("steam_name"), r.get("coming_soon"), bool(r["cover"]))
