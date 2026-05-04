#!/usr/bin/env python3
"""Rebuild catalog with album names from the catalogs table."""

import struct, re, json, subprocess, math
import numpy as np
from pathlib import Path

BILLBOARD_ZIP = Path.home() / "Downloads/zeeky-extracted/zeeky/Databases/2_5_billboard_hot_202309071054.zip"
BILLBOARD_SQL = "2_5_billboard_hot_202309071054.sql"
CATALOG_ZIP = Path.home() / "Downloads/zeeky-extracted/zeeky/Databases/dna_service_staging.zip"
CATALOG_SQL = "dna_service_staging.sql"
OUTPUT = Path(__file__).parent.parent / "src" / "data" / "dna_catalog.json"
TOP_N = 50


def parse_hex(h: str) -> list[float]:
    raw = bytes.fromhex(h)
    return list(struct.unpack(f">{len(raw)//8}d", raw))


def extract_catalog_meta():
    """Get apple_id + album from catalogs table."""
    print("Extracting catalog metadata...")
    r = subprocess.run(["unzip", "-p", str(CATALOG_ZIP), CATALOG_SQL], capture_output=True)
    sql = r.stdout.decode("utf-8", errors="replace")
    pat = re.compile(
        r"\((\d+), '((?:[^']|'')*)', '((?:[^']|'')*)', '[^']*', '[^']*', '[^']*', '[^']*', \d+, (\d+|NULL), '((?:[^']|'')*)', '((?:[^']|'')*)',"
    )
    meta = {}
    in_cat = False
    for line in sql.split("\n"):
        if "INSERT INTO catalogs" in line:
            in_cat = True
        if in_cat:
            for m in pat.finditer(line):
                cid = int(m.group(1))
                apple_id = int(m.group(4)) if m.group(4) != "NULL" else None
                album = m.group(5).replace("''", "'")
                meta[cid] = {"appleId": apple_id, "album": album}
            if line.strip().endswith(";"):
                in_cat = False
    print(f"  {len(meta)} entries")
    return meta


def extract_songs():
    print("Extracting Billboard songs...")
    r = subprocess.run(["unzip", "-p", str(BILLBOARD_ZIP), BILLBOARD_SQL], capture_output=True)
    sql = r.stdout.decode("utf-8", errors="replace")
    songs = []
    pat = re.compile(
        r"\((\d+),\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*(\d+),\s*'((?:[^']|'')*)',\s*'[^']*',\s*'[^']*',\s*(\d+),\s*(\d+),\s*([\d.]+),\s*(\d+),\s*([\d.]+),\s*x'([0-9A-Fa-f]+)'\)"
    )
    in_sum = False
    for line in sql.split("\n"):
        if "INSERT INTO SUMMARY" in line:
            in_sum = True
        if in_sum:
            for m in pat.finditer(line):
                try:
                    songs.append({
                        "id": int(m.group(1)),
                        "artist": m.group(2).replace("''", "'"),
                        "title": m.group(3).replace("''", "'"),
                        "year": int(m.group(4)),
                        "genre": m.group(5).replace("''", "'"),
                        "peak": int(m.group(6)),
                        "weeks": int(m.group(7)),
                        "rank": float(m.group(8)),
                        "energyTotal": int(m.group(9)),
                        "energyNorm": round(100.0 * math.sqrt(int(m.group(9)) / 10000.0), 2),
                        "features": parse_hex(m.group(11)),
                    })
                except Exception:
                    pass
            if line.strip().endswith(";"):
                in_sum = False
    print(f"  {len(songs)} songs")
    return songs


def compute(songs):
    print("Computing DHS + similarities...")
    n = len(songs)
    feats = np.array([s["features"] for s in songs], dtype=np.float64)
    norms = np.linalg.norm(feats, axis=1, keepdims=True)
    norms[norms == 0] = 1
    normed = feats / norms

    pcts = np.clip(np.array([100.0 - s["peak"] for s in songs]), 0, 100)
    wks = np.clip(np.array([s["weeks"] for s in songs]) / 20.0, 0.1, 1.0)

    dhs = np.zeros(n)
    sims_out = [[] for _ in range(n)]
    chunk = 500

    for s in range(0, n, chunk):
        e = min(s + chunk, n)
        cs = normed[s:e] @ normed.T
        for il in range(e - s):
            ig = s + il
            sv = cs[il].copy()
            sv[ig] = -1
            ti = np.argpartition(sv, -TOP_N)[-TOP_N:]
            ti = ti[np.argsort(sv[ti])[::-1]]
            sims_out[ig] = [{"id": songs[j]["id"], "similarity": round(float(sv[j]) * 100, 2)} for j in ti]
            w = pcts[ti] * sv[ti] * wks[ti]
            mx = float(np.max(w)) / 100.0
            mn = float(np.mean(w)) / 100.0
            dhs[ig] = round(min((mx * math.sin(mn * 0.9)) * 100, 100), 2) if mn > 0 else 0
        print(f"  {min(100, round(e/n*100))}%")

    return dhs, sims_out


def main():
    meta = extract_catalog_meta()
    songs = extract_songs()
    dhs, sims = compute(songs)

    catalog = []
    for i, s in enumerate(songs):
        m = meta.get(s["id"], {})
        entry = {
            "id": s["id"],
            "artist": s["artist"],
            "title": s["title"],
            "album": m.get("album", ""),
            "year": s["year"],
            "genre": s["genre"],
            "peak": s["peak"],
            "weeks": s["weeks"],
            "rank": s["rank"],
            "dhsScore": float(dhs[i]),
            "energyTotal": s["energyTotal"],
            "energyNorm": s["energyNorm"],
            "similars": sims[i],
        }
        aid = m.get("appleId")
        if aid:
            entry["appleId"] = aid
        catalog.append(entry)

    with open(OUTPUT, "w") as f:
        json.dump(catalog, f)

    albums_count = sum(1 for c in catalog if c["album"])
    size = OUTPUT.stat().st_size / (1024 * 1024)
    print(f"\n{len(catalog)} songs, {albums_count} with albums -> {OUTPUT} ({size:.1f} MB)")


if __name__ == "__main__":
    main()
