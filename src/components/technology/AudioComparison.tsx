"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const tracks = {
  "Blinding Lights": {
    artist: "The Weeknd",
    attrs: { Tempo: 86, Energy: 92, Bass: 75, Melody: 68, Chroma: 88, Pitch: 71 },
  },
  "Save Your Tears": {
    artist: "The Weeknd",
    attrs: { Tempo: 82, Energy: 84, Bass: 70, Melody: 72, Chroma: 85, Pitch: 74 },
  },
  Levitating: {
    artist: "Dua Lipa",
    attrs: { Tempo: 78, Energy: 85, Bass: 88, Melody: 72, Chroma: 74, Pitch: 80 },
  },
  "Heat Waves": {
    artist: "Glass Animals",
    attrs: { Tempo: 70, Energy: 64, Bass: 78, Melody: 58, Chroma: 82, Pitch: 55 },
  },
};

type TrackName = keyof typeof tracks;
const trackNames = Object.keys(tracks) as TrackName[];

function similarity(a: Record<string, number>, b: Record<string, number>) {
  const keys = Object.keys(a);
  const diffs = keys.map((k) => Math.abs(a[k] - b[k]) / 100);
  return Math.round((1 - diffs.reduce((s, d) => s + d, 0) / keys.length) * 100);
}

export default function AudioComparison() {
  const [trackA, setTrackA] = useState<TrackName>("Blinding Lights");
  const [trackB, setTrackB] = useState<TrackName>("Save Your Tears");

  const a = tracks[trackA];
  const b = tracks[trackB];
  const attrNames = Object.keys(a.attrs) as (keyof typeof a.attrs)[];
  const matchScore = similarity(a.attrs, b.attrs);

  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-6 md:p-8">
      <h3 className="text-xl font-bold mb-2">Track Comparison</h3>
      <p className="text-text-muted text-sm mb-6">
        Compare audio DNA between two tracks to see attribute overlap.
      </p>

      {/* Track selectors */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">
            Track A
          </label>
          <select
            value={trackA}
            onChange={(e) => setTrackA(e.target.value as TrackName)}
            className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-white appearance-none cursor-pointer"
          >
            {trackNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-text-muted uppercase tracking-wider mb-2 block">
            Track B
          </label>
          <select
            value={trackB}
            onChange={(e) => setTrackB(e.target.value as TrackName)}
            className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-white appearance-none cursor-pointer"
          >
            {trackNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Match score */}
      <div className="text-center mb-6">
        <span className="text-xs text-text-muted uppercase tracking-wider">
          Similarity
        </span>
        <motion.div
          key={matchScore}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-4xl font-bold gradient-text"
        >
          {matchScore}%
        </motion.div>
      </div>

      {/* Comparison bars */}
      <div className="space-y-4">
        {attrNames.map((attr) => {
          const valA = a.attrs[attr];
          const valB = b.attrs[attr];
          return (
            <div key={attr}>
              <div className="flex justify-between text-xs text-text-muted mb-1.5">
                <span className="font-mono">{valA}</span>
                <span>{attr}</span>
                <span className="font-mono">{valB}</span>
              </div>
              <div className="relative h-3 flex gap-0.5">
                <div className="flex-1 bg-white/5 rounded-l-full overflow-hidden flex justify-end">
                  <motion.div
                    className="h-full rounded-l-full bg-accent-purple/60"
                    initial={{ width: 0 }}
                    animate={{ width: `${valA}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
                <div className="flex-1 bg-white/5 rounded-r-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-r-full bg-accent-blue/60"
                    initial={{ width: 0 }}
                    animate={{ width: `${valB}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-4 text-xs text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent-purple/60" />
          {trackA}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent-blue/60" />
          {trackB}
        </span>
      </div>
    </div>
  );
}
