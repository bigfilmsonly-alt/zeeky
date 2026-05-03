"use client";

import { useState } from "react";

const songs = [
  { id: "scarface", name: "Scarface", artist: "Zeeky" },
  { id: "patek", name: "Patek Water", artist: "Future ft Young Thug" },
  { id: "sicko", name: "Sicko Mode", artist: "Travis Scott" },
  { id: "life", name: "Life Is Good", artist: "Future ft Drake" },
  { id: "hot", name: "Hot", artist: "Young Thug ft Gunna" },
  { id: "drip", name: "Drip Too Hard", artist: "Lil Baby ft Gunna" },
];

type SongId = (typeof songs)[number]["id"];

const dnaData: Record<
  string,
  { tempo: number; bass: number; melody: number; chord: number; spectral: number; dance: number }
> = {
  scarface: { tempo: 78, bass: 92, melody: 65, chord: 84, spectral: 71, dance: 68 },
  patek: { tempo: 82, bass: 88, melody: 71, chord: 79, spectral: 75, dance: 85 },
  sicko: { tempo: 85, bass: 80, melody: 74, chord: 72, spectral: 82, dance: 90 },
  life: { tempo: 76, bass: 90, melody: 60, chord: 81, spectral: 69, dance: 78 },
  hot: { tempo: 80, bass: 86, melody: 68, chord: 77, spectral: 73, dance: 88 },
  drip: { tempo: 74, bass: 94, melody: 58, chord: 86, spectral: 66, dance: 72 },
};

const attributes = [
  { key: "tempo", label: "Tempo" },
  { key: "bass", label: "Bass Presence" },
  { key: "melody", label: "Melody Variation" },
  { key: "chord", label: "Chord Progression" },
  { key: "spectral", label: "Spectral Energy" },
  { key: "dance", label: "Danceability" },
] as const;

function computeSimilarity(a: SongId, b: SongId) {
  const da = dnaData[a];
  const db = dnaData[b];
  if (!da || !db) return 0;
  const diffs = attributes.map((attr) => {
    const va = da[attr.key];
    const vb = db[attr.key];
    return Math.abs(va - vb);
  });
  const avgDiff = diffs.reduce((sum, d) => sum + d, 0) / diffs.length;
  return Math.round(100 - avgDiff);
}

function getClosestAttributes(a: SongId, b: SongId) {
  const da = dnaData[a];
  const db = dnaData[b];
  if (!da || !db) return [];
  const pairs = attributes.map((attr) => ({
    label: attr.label,
    diff: Math.abs(da[attr.key] - db[attr.key]),
  }));
  pairs.sort((x, y) => x.diff - y.diff);
  return pairs.slice(0, 2).map((p) => p.label);
}

export default function ComparePage() {
  const [songA, setSongA] = useState<SongId>("scarface");
  const [songB, setSongB] = useState<SongId>("patek");

  const infoA = songs.find((s) => s.id === songA)!;
  const infoB = songs.find((s) => s.id === songB)!;
  const dataA = dnaData[songA];
  const dataB = dnaData[songB];
  const similarity = computeSimilarity(songA, songB);
  const closest = getClosestAttributes(songA, songB);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Compare</h1>
        <p className="text-text-muted text-xs mt-0.5">Side-by-side song DNA analysis</p>
      </div>

      {/* Song Selector Cards */}
      <div className="flex gap-2">
        {/* Song A */}
        <div className="flex-1 bg-surface border border-white/5 rounded-xl p-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-accent-purple" />
          <p className="text-[10px] text-accent-purple font-medium uppercase tracking-wider mb-1.5">Song A</p>
          <select
            value={songA}
            onChange={(e) => {
              const val = e.target.value as SongId;
              if (val === songB) setSongB(songA);
              setSongA(val);
            }}
            className="w-full bg-white/5 border border-white/5 rounded-lg px-2 py-1.5 text-xs font-medium appearance-none cursor-pointer focus:outline-none focus:border-accent-purple/40"
          >
            {songs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.artist}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-text-muted/50 mt-1 truncate">{infoA.artist}</p>
        </div>

        {/* VS badge */}
        <div className="flex items-center justify-center shrink-0">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="text-[10px] font-bold text-text-muted">VS</span>
          </div>
        </div>

        {/* Song B */}
        <div className="flex-1 bg-surface border border-white/5 rounded-xl p-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-accent-blue" />
          <p className="text-[10px] text-accent-blue font-medium uppercase tracking-wider mb-1.5">Song B</p>
          <select
            value={songB}
            onChange={(e) => {
              const val = e.target.value as SongId;
              if (val === songA) setSongA(songB);
              setSongB(val);
            }}
            className="w-full bg-white/5 border border-white/5 rounded-lg px-2 py-1.5 text-xs font-medium appearance-none cursor-pointer focus:outline-none focus:border-accent-blue/40"
          >
            {songs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.artist}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-text-muted/50 mt-1 truncate">{infoB.artist}</p>
        </div>
      </div>

      {/* Similarity Score Circle */}
      <div className="bg-surface border border-white/5 rounded-2xl p-4 text-center">
        <h3 className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Similarity Score</h3>
        <div className="relative w-20 h-20 mx-auto mb-2">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="url(#compareGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${similarity * 2.64} 264`}
            />
            <defs>
              <linearGradient id="compareGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold">{similarity}%</span>
          </div>
        </div>
        <p className="text-xs text-green-400 font-medium">
          {similarity >= 85 ? "Near Identical" : similarity >= 70 ? "Strong Match" : "Moderate Match"}
        </p>
        <p className="text-[10px] text-text-muted/50 mt-0.5">Based on 6 audio DNA attributes</p>
      </div>

      {/* DNA Comparison Bars */}
      <div className="bg-surface border border-white/5 rounded-2xl p-4">
        <h3 className="text-sm font-bold mb-0.5">DNA Comparison</h3>
        <p className="text-[10px] text-text-muted/60 mb-3">
          <span className="text-accent-purple">Purple</span> = {infoA.name}
          <span className="mx-1.5 text-text-muted/30">|</span>
          <span className="text-accent-blue">Blue</span> = {infoB.name}
        </p>

        <div className="space-y-3">
          {attributes.map((attr) => {
            const valA = dataA[attr.key];
            const valB = dataB[attr.key];
            return (
              <div key={attr.key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-text-muted/70">{attr.label}</span>
                  <div className="flex gap-2 text-[10px] font-mono">
                    <span className="text-accent-purple">{valA}</span>
                    <span className="text-text-muted/30">vs</span>
                    <span className="text-accent-blue">{valB}</span>
                  </div>
                </div>
                {/* Song A bar */}
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full rounded-full bg-accent-purple transition-all duration-500"
                    style={{ width: `${valA}%` }}
                  />
                </div>
                {/* Song B bar */}
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent-blue transition-all duration-500"
                    style={{ width: `${valB}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verdict */}
      <div className="bg-surface border border-white/5 rounded-2xl p-4">
        <h3 className="text-sm font-bold mb-1">Verdict</h3>
        <p className="text-[10px] text-text-muted/70 leading-relaxed">
          These tracks share{" "}
          <span className="text-white font-medium">{similarity}% DNA similarity</span>, with closest
          alignment in{" "}
          <span className="text-white font-medium">{closest[0]}</span> and{" "}
          <span className="text-white font-medium">{closest[1]}</span>.
        </p>
      </div>

      {/* Share Button */}
      <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-xs font-semibold active:opacity-80 transition-opacity">
        Share Comparison
      </button>
    </div>
  );
}
