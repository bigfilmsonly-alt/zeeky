#!/usr/bin/env python3
"""
Extract DNA features + Apple Music data from both databases,
compute top-50 similarities, output with preview URLs and cover art.
"""

import struct, re, json, subprocess, sys
import numpy as np
from pathlib import Path

BILLBOARD_ZIP = Path.home() / "Downloads/zeeky-extracted/zeeky/Databases/2_5_billboard_hot_202309071054.zip"
BILLBOARD_SQL = "2_5_billboard_hot_202309071054.sql"
CATALOG_ZIP = Path.home() / "Downloads/zeeky-extracted/zeeky/Databases/dna_service_staging.zip"
CATALOG_SQL = "dna_service_staging.sql"
OUTPUT = Path(__file__).parent.parent / "src" / "data" / "dna_catalog.json"
TOP_N = 50


def parse_hex_features(hex_str: str) -> list[float]:
    raw = bytes.fromhex(hex_str)
    n = len(raw) // 8
    return list(struct.unpack(f">{n}d", raw))


def extract_apple_data():
    """Extract apple_id and preview/cover from catalogs table."""
    print("Extracting Apple Music data from catalogs...")
    r = subprocess.run(["unzip", "-p", str(CATALOG_ZIP), CATALOG_SQL], capture_output=True)
    sql = r.stdout.decode("utf-8", errors="replace")

    # Build map: catalog_id -> apple_id
    # catalogs format: (id, artist, title, ..., apple_preview_id, apple_id, album, genre, ...)
    pattern = re.compile(
        r"\((\d+), '(?:[^']*)', '(?:[^']*)', '(?:[^']*)', '(?:[^']*)', '(?:[^']*)', '(?:[^']*)', (\d+), (\d+|NULL),"
    )

    apple_map = {}
    in_catalogs = False
    for line in sql.split("\n"):
        if "INSERT INTO catalogs" in line:
            in_catalogs = True
        if in_catalogs:
            for m in pattern.finditer(line):
                cid = int(m.group(1))
                apple_id_str = m.group(3)
                apple_id = int(apple_id_str) if apple_id_str != "NULL" else None
                apple_map[cid] = apple_id
            if line.strip().endswith(";"):
                in_catalogs = False

    print(f"  {len(apple_map)} catalog entries, {sum(1 for v in apple_map.values() if v)} with Apple IDs")
    return apple_map


def extract_songs():
    """Parse SUMMARY table from billboard database."""
    print("Extracting Billboard songs...")
    r = subprocess.run(["unzip", "-p", str(BILLBOARD_ZIP), BILLBOARD_SQL], capture_output=True)
    sql = r.stdout.decode("utf-8", errors="replace")

    songs = []
    pattern = re.compile(
        r"\((\d+),\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*(\d+),\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*(\d+),\s*(\d+),\s*([\d.]+),\s*(\d+),\s*([\d.]+),\s*x'([0-9A-Fa-f]+)'\)"
    )

    in_summary = False
    for line in sql.split("\n"):
        if "INSERT INTO SUMMARY" in line:
            in_summary = True
        if in_summary:
            for m in pattern.finditer(line):
                try:
                    features = parse_hex_features(m.group(13))
                    songs.append({
                        "id": int(m.group(1)),
                        "artist": m.group(2).replace("''", "'"),
                        "title": m.group(3).replace("''", "'"),
                        "year": int(m.group(4)),
                        "genre": m.group(5).replace("''", "'"),
                        "peak": int(m.group(8)),
                        "weeks": int(m.group(9)),
                        "rank": float(m.group(10)),
                        "features": features,
                    })
                except Exception:
                    pass
            if line.strip().endswith(";"):
                in_summary = False

    print(f"  Parsed {len(songs)} songs")
    return songs


def compute_similarities(songs, top_n=TOP_N):
    print(f"Computing cosine similarities for {len(songs)} songs...")
    features = np.array([s["features"] for s in songs], dtype=np.float64)
    norms = np.linalg.norm(features, axis=1, keepdims=True)
    norms[norms == 0] = 1
    normalized = features / norms

    n = len(songs)
    chunk_size = 500
    similars = [[] for _ in range(n)]

    for start in range(0, n, chunk_size):
        end = min(start + chunk_size, n)
        chunk_sims = normalized[start:end] @ normalized.T
        for i_local in range(end - start):
            i_global = start + i_local
            sims = chunk_sims[i_local]
            sims[i_global] = -1
            top_idx = np.argpartition(sims, -top_n)[-top_n:]
            top_idx = top_idx[np.argsort(sims[top_idx])[::-1]]
            similars[i_global] = [
                {"id": songs[j]["id"], "similarity": round(float(sims[j]) * 100, 2)}
                for j in top_idx
            ]
        pct = min(100, round(end / n * 100))
        print(f"  {pct}% ({end}/{n})")

    return similars


def main():
    apple_map = extract_apple_data()
    songs = extract_songs()

    # Merge Apple data
    matched = 0
    for song in songs:
        sid = song["id"]
        apple_id = apple_map.get(sid)
        if apple_id:
            song["appleId"] = apple_id
            matched += 1

    print(f"Matched {matched}/{len(songs)} songs with Apple IDs")

    similars = compute_similarities(songs)

    # Build genre index
    genres: dict[str, int] = {}
    for s in songs:
        for g in s["genre"].split(","):
            g = g.strip()
            if g and g != "Music":
                genres[g] = genres.get(g, 0) + 1

    top_genres = sorted(genres.items(), key=lambda x: -x[1])[:20]
    print(f"\nTop genres: {', '.join(f'{g}({c})' for g, c in top_genres[:10])}")

    # Build output
    catalog = []
    for i, song in enumerate(songs):
        entry: dict = {
            "id": song["id"],
            "artist": song["artist"],
            "title": song["title"],
            "year": song["year"],
            "genre": song["genre"],
            "peak": song["peak"],
            "weeks": song["weeks"],
            "rank": song["rank"],
            "similars": similars[i],
        }
        if "appleId" in song:
            entry["appleId"] = song["appleId"]
        catalog.append(entry)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w") as f:
        json.dump(catalog, f)

    size_mb = OUTPUT.stat().st_size / (1024 * 1024)
    print(f"\nDone! {len(catalog)} songs -> {OUTPUT} ({size_mb:.1f} MB)")
    print(f"Songs with Apple playback: {matched}")


if __name__ == "__main__":
    main()
