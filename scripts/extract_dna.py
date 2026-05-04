#!/usr/bin/env python3
"""
Extract DNA feature vectors from the Billboard SQL dump,
compute pairwise cosine similarities, and output the top-50
most similar songs for every song in the catalog.
"""

import struct
import re
import json
import subprocess
import sys
import numpy as np
from pathlib import Path

DB_ZIP = Path.home() / "Downloads/zeeky-extracted/zeeky/Databases/2_5_billboard_hot_202309071054.zip"
SQL_FILE = "2_5_billboard_hot_202309071054.sql"
OUTPUT = Path(__file__).parent.parent / "src" / "data" / "dna_catalog.json"
TOP_N = 50

def extract_sql():
    print("Extracting SQL dump...")
    r = subprocess.run(["unzip", "-p", str(DB_ZIP), SQL_FILE], capture_output=True)
    return r.stdout.decode("utf-8", errors="replace")

def parse_hex_features(hex_str: str) -> list[float]:
    """Decode a hex blob of 80 big-endian doubles."""
    raw = bytes.fromhex(hex_str)
    n = len(raw) // 8
    return list(struct.unpack(f">{n}d", raw))

def parse_songs(sql: str):
    """Parse SUMMARY INSERT statements."""
    songs = []
    # Match each row: (id, 'artist', 'title', year, 'genre', 'url', 'cover', peak, week, rank, energy_total, energy_norm, x'HEX')
    # The SQL has multi-row INSERTs
    pattern = re.compile(
        r"\((\d+),\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*(\d+),\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*(\d+),\s*(\d+),\s*([\d.]+),\s*(\d+),\s*([\d.]+),\s*x'([0-9A-Fa-f]+)'\)"
    )

    # Only parse within SUMMARY INSERT blocks
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
                except Exception as e:
                    pass
            if line.strip().endswith(";"):
                in_summary = False

    return songs

def compute_similarities(songs, top_n=TOP_N):
    """Compute cosine similarities and find top-N neighbors for each song."""
    print(f"Building feature matrix for {len(songs)} songs...")
    features = np.array([s["features"] for s in songs], dtype=np.float64)

    # Normalize for cosine similarity
    norms = np.linalg.norm(features, axis=1, keepdims=True)
    norms[norms == 0] = 1
    normalized = features / norms

    print("Computing cosine similarity matrix (this may take a moment)...")
    # Process in chunks to avoid memory issues
    n = len(songs)
    chunk_size = 500
    similars = [[] for _ in range(n)]

    for start in range(0, n, chunk_size):
        end = min(start + chunk_size, n)
        # Compute similarities for this chunk against all songs
        chunk_sims = normalized[start:end] @ normalized.T  # (chunk, n)

        for i_local in range(end - start):
            i_global = start + i_local
            sims = chunk_sims[i_local]
            # Exclude self
            sims[i_global] = -1
            # Get top N indices
            top_indices = np.argpartition(sims, -top_n)[-top_n:]
            top_indices = top_indices[np.argsort(sims[top_indices])[::-1]]
            similars[i_global] = [
                {
                    "id": songs[j]["id"],
                    "similarity": round(float(sims[j]) * 100, 2),
                }
                for j in top_indices
            ]

        pct = min(100, round(end / n * 100))
        print(f"  {pct}% complete ({end}/{n})...")

    return similars

def main():
    sql = extract_sql()
    songs = parse_songs(sql)
    print(f"Parsed {len(songs)} songs with DNA features")

    if not songs:
        print("ERROR: No songs parsed!")
        sys.exit(1)

    similars = compute_similarities(songs)

    # Build output catalog
    catalog = []
    for i, song in enumerate(songs):
        catalog.append({
            "id": song["id"],
            "artist": song["artist"],
            "title": song["title"],
            "year": song["year"],
            "genre": song["genre"],
            "peak": song["peak"],
            "weeks": song["weeks"],
            "rank": song["rank"],
            "similars": similars[i],
        })

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w") as f:
        json.dump(catalog, f)

    size_mb = OUTPUT.stat().st_size / (1024 * 1024)
    print(f"\nDone! Written {len(catalog)} songs to {OUTPUT}")
    print(f"File size: {size_mb:.1f} MB")
    print(f"Each song has {TOP_N} similar songs ranked by DNA proximity")

if __name__ == "__main__":
    main()
