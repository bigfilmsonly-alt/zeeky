#!/usr/bin/env python3
"""
Compute DHS (Dynamic Hit Scoring) scores for all 9,914 Billboard songs
using the patented Hitlab algorithm found in:
  C++/DNA2/Processing/src/Scoring/HitScore.cpp
  C++/DNA2/Processing/src/Scoring/RankGraph.cpp
  C++/DNA2/Processing/src/Similarity/Proximity.cpp

DHS Score = MAX_PERCENTILE × sin(MEAN_PERCENTILE × 0.9)

Where:
- Proximity = cosine similarity of 80-dim normalized feature vectors
- Week Percentile = 100 - chart_rank (rank 1 → 99%, rank 100 → 0%)
- Mean Percentile = avg(week_percentile × proximity) across top N similars
- Max Percentile = max(week_percentile × proximity) across top N similars
- Energy Normalized = 100 × sqrt(energy_total / 10000)
"""

import struct, re, json, subprocess, math
import numpy as np
from pathlib import Path

BILLBOARD_ZIP = Path.home() / "Downloads/zeeky-extracted/zeeky/Databases/2_5_billboard_hot_202309071054.zip"
BILLBOARD_SQL = "2_5_billboard_hot_202309071054.sql"
CATALOG_ZIP = Path.home() / "Downloads/zeeky-extracted/zeeky/Databases/dna_service_staging.zip"
CATALOG_SQL = "dna_service_staging.sql"
OUTPUT = Path(__file__).parent.parent / "src" / "data" / "dna_catalog.json"

TOP_N_SIMILARS = 50          # Number of similar songs to store
DHS_PROXIMITY_COUNT = 50     # Number of proximities used for DHS score


def parse_hex_features(hex_str: str) -> list[float]:
    raw = bytes.fromhex(hex_str)
    n = len(raw) // 8
    return list(struct.unpack(f">{n}d", raw))


def extract_apple_ids():
    print("Extracting Apple IDs from catalogs...")
    r = subprocess.run(["unzip", "-p", str(CATALOG_ZIP), CATALOG_SQL], capture_output=True)
    sql = r.stdout.decode("utf-8", errors="replace")
    pattern = re.compile(
        r"\((\d+), '(?:[^']*)', '(?:[^']*)', '(?:[^']*)', '(?:[^']*)', '(?:[^']*)', '(?:[^']*)', (\d+), (\d+|NULL),"
    )
    apple_map = {}
    in_cat = False
    for line in sql.split("\n"):
        if "INSERT INTO catalogs" in line:
            in_cat = True
        if in_cat:
            for m in pattern.finditer(line):
                cid = int(m.group(1))
                aid = m.group(3)
                apple_map[cid] = int(aid) if aid != "NULL" else None
            if line.strip().endswith(";"):
                in_cat = False
    return apple_map


def extract_songs():
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
                        "energy_total": int(m.group(11)),
                        "energy_normalized": float(m.group(12)),
                        "features": features,
                    })
                except Exception:
                    pass
            if line.strip().endswith(";"):
                in_summary = False
    print(f"  {len(songs)} songs extracted")
    return songs


def compute_dhs_scores(songs):
    """
    Compute DHS scores per the patent:
    1. Normalize feature vectors
    2. Compute cosine proximity to all other songs
    3. For top N proximal songs, weight their chart percentile by proximity
    4. DHS Score = max_percentile × sin(mean_percentile × 0.9)
    """
    print("Computing DHS scores for all songs...")
    n = len(songs)

    # Build feature matrix and normalize
    features = np.array([s["features"] for s in songs], dtype=np.float64)
    norms = np.linalg.norm(features, axis=1, keepdims=True)
    norms[norms == 0] = 1
    normalized = features / norms

    # Week percentile per song: 100 - peak (patent: RankGraph.cpp)
    # This is the simplified single-peak percentile
    week_percentiles = np.array([100.0 - s["peak"] for s in songs], dtype=np.float64)
    week_percentiles = np.clip(week_percentiles, 0, 100)

    # Also weight by weeks on chart (longer charting = more evidence)
    weeks = np.array([s["weeks"] for s in songs], dtype=np.float64)
    week_weight = np.clip(weeks / 20.0, 0.1, 1.0)  # Normalize: 20+ weeks = full weight

    # Compute DHS scores in chunks
    chunk_size = 500
    dhs_scores = np.zeros(n)
    similars = [[] for _ in range(n)]

    for start in range(0, n, chunk_size):
        end = min(start + chunk_size, n)
        chunk_sims = normalized[start:end] @ normalized.T  # cosine similarities

        for i_local in range(end - start):
            i_global = start + i_local
            sims = chunk_sims[i_local].copy()
            sims[i_global] = -1  # exclude self

            # Get top N by proximity
            top_idx = np.argpartition(sims, -DHS_PROXIMITY_COUNT)[-DHS_PROXIMITY_COUNT:]
            top_idx = top_idx[np.argsort(sims[top_idx])[::-1]]

            # Store similars
            similars[i_global] = [
                {"id": songs[j]["id"], "similarity": round(float(sims[j]) * 100, 2)}
                for j in top_idx[:TOP_N_SIMILARS]
            ]

            # DHS Score computation (HitScore.cpp patent formula)
            top_proximities = sims[top_idx]
            top_percentiles = week_percentiles[top_idx]
            top_week_weights = week_weight[top_idx]

            # Weight percentile by proximity and week evidence
            weighted = top_percentiles * top_proximities * top_week_weights

            max_percentile = float(np.max(weighted)) / 100.0
            mean_percentile = float(np.mean(weighted)) / 100.0

            # Patent formula: score = max_percentile × sin(mean_percentile × 0.9)
            if mean_percentile > 0:
                dhs_score = max_percentile * math.sin(mean_percentile * 0.9)
            else:
                dhs_score = 0.0

            # Scale to 0-100 range
            dhs_scores[i_global] = round(min(dhs_score * 100, 100), 2)

        pct = min(100, round(end / n * 100))
        print(f"  {pct}% ({end}/{n})")

    return dhs_scores, similars


def main():
    apple_map = extract_apple_ids()
    songs = extract_songs()
    dhs_scores, similars = compute_dhs_scores(songs)

    # Energy normalized per patent: 100 × sqrt(energy_total / 10000)
    # Already in DB as energy_normalized, but let's verify/recompute
    for s in songs:
        s["energy_norm_patent"] = round(100.0 * math.sqrt(s["energy_total"] / 10000.0), 2) if s["energy_total"] > 0 else 0

    # Stats
    scores = dhs_scores[dhs_scores > 0]
    print(f"\nDHS Score Statistics:")
    print(f"  Min: {scores.min():.2f}%")
    print(f"  Max: {scores.max():.2f}%")
    print(f"  Mean: {scores.mean():.2f}%")
    print(f"  Median: {np.median(scores):.2f}%")

    # Show top 10 highest DHS scores
    top_10_idx = np.argsort(dhs_scores)[::-1][:10]
    print(f"\nTop 10 DHS Scores:")
    for idx in top_10_idx:
        s = songs[idx]
        print(f"  {dhs_scores[idx]:6.2f}% — {s['title'][:35]:35} by {s['artist'][:30]:30} (peak #{s['peak']}, {s['weeks']}wks)")

    # Build output catalog
    catalog = []
    for i, song in enumerate(songs):
        entry = {
            "id": song["id"],
            "artist": song["artist"],
            "title": song["title"],
            "year": song["year"],
            "genre": song["genre"],
            "peak": song["peak"],
            "weeks": song["weeks"],
            "rank": song["rank"],
            "dhsScore": float(dhs_scores[i]),
            "energyTotal": song["energy_total"],
            "energyNorm": song["energy_norm_patent"],
            "similars": similars[i],
        }
        apple_id = apple_map.get(song["id"])
        if apple_id:
            entry["appleId"] = apple_id
        catalog.append(entry)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w") as f:
        json.dump(catalog, f)

    size_mb = OUTPUT.stat().st_size / (1024 * 1024)
    print(f"\nWritten {len(catalog)} songs to {OUTPUT} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    main()
