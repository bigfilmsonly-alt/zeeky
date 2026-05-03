"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const songsData: Record<string, number[]> = {
  "Blinding Lights": [86, 92, 75, 68, 88, 71, 82, 79],
  Levitating: [78, 85, 88, 72, 74, 80, 65, 90],
  Peaches: [62, 58, 82, 45, 60, 65, 70, 55],
  "Heat Waves": [70, 64, 78, 58, 82, 55, 90, 68],
};

const labels = [
  "Tempo",
  "Energy",
  "Bass",
  "Melody",
  "Chroma",
  "Pitch",
  "Instruments",
  "Rolloff",
];

const songNames = Object.keys(songsData);

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angle: number
): [number, number] {
  const rad = (angle - 90) * (Math.PI / 180);
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

export default function RadarChart() {
  const [selected, setSelected] = useState(songNames[0]);
  const values = songsData[selected];

  const cx = 150;
  const cy = 150;
  const maxR = 110;
  const rings = [0.25, 0.5, 0.75, 1];
  const angleStep = 360 / labels.length;

  const points = values.map((v, i) => {
    const r = (v / 100) * maxR;
    return polarToCartesian(cx, cy, r, i * angleStep);
  });
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + "Z";

  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-6 md:p-8">
      <h3 className="text-xl font-bold mb-2">Audio DNA Profile</h3>
      <p className="text-text-muted text-sm mb-6">
        Radar visualization of a song&apos;s attribute signature. Select a track to morph the chart.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {songNames.map((name) => (
          <button
            key={name}
            onClick={() => setSelected(name)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              selected === name
                ? "bg-accent-purple/20 border border-accent-purple/50 text-white"
                : "bg-white/5 border border-white/10 text-text-muted hover:border-white/20"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 300 300" className="w-full" style={{ maxHeight: 340 }}>
        {/* Rings */}
        {rings.map((r) => (
          <polygon
            key={r}
            className="radar-ring"
            points={labels
              .map((_, i) =>
                polarToCartesian(cx, cy, maxR * r, i * angleStep).join(",")
              )
              .join(" ")}
          />
        ))}

        {/* Axes */}
        {labels.map((label, i) => {
          const [x, y] = polarToCartesian(cx, cy, maxR, i * angleStep);
          const [lx, ly] = polarToCartesian(cx, cy, maxR + 18, i * angleStep);
          return (
            <g key={label}>
              <line
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                className="radar-axis"
              />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#94a3b8"
                fontSize="9"
                fontFamily="var(--font-sans)"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Data polygon */}
        <motion.path
          d={pathD}
          className="radar-area"
          initial={false}
          animate={{ d: pathD }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />

        {/* Data points */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            r={3}
            fill="#8b5cf6"
            stroke="#050510"
            strokeWidth={2}
            animate={{ cx: p[0], cy: p[1] }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        ))}
      </svg>
    </div>
  );
}
