"use client";

import AppleMusicButton from "@/components/AppleMusicButton";

/* ─── Data ─── */
const SIMILAR_TRACKS = [
  { rank: 1, title: "Scarface", artist: "Zeeky", dna: "87.0" },
  { rank: 2, title: "Harlem Shake", artist: "Future ft Young Thug", dna: "87.0" },
  { rank: 3, title: "Having Our Way", artist: "Migos ft Drake", dna: "86.1" },
  { rank: 4, title: "Golden Child", artist: "Lil Durk", dna: "85.9" },
  { rank: 5, title: "Said Sum", artist: "Moneybagg Yo", dna: "85.0" },
  { rank: 6, title: "What Happened To Virgil", artist: "Lil Durk ft Gunna", dna: "85.9" },
  { rank: 7, title: "mop", artist: "Gunna, Young Thug", dna: "84.8" },
  { rank: 8, title: "Sup Mate", artist: "Young Thug ft Future", dna: "84.8" },
  { rank: 9, title: "poochie gown", artist: "Gunna", dna: "84.7" },
  { rank: 10, title: "NC-17", artist: "Travis Scott", dna: "84.1" },
];

const GENRES = [
  { label: "Trap", pct: 39.4, color: "#8b5cf6" },
  { label: "Southern Hip-Hop", pct: 27.5, color: "#3b82f6" },
  { label: "Outliers", pct: 16.2, color: "#06b6d4" },
  { label: "Pop Rap", pct: 9.2, color: "#f59e0b" },
  { label: "Drill", pct: 7.7, color: "#ef4444" },
];

/* ─── Radar SVG ─── */
const AXES = ["Tempo", "Bass", "Melody", "Chord", "Spectral"];
const VALUES = [0.82, 0.91, 0.65, 0.74, 0.88]; // example values for visual
const CX = 130;
const CY = 130;
const R = 100;
const RINGS = [0.25, 0.5, 0.75, 1.0];

function polarToCart(angle: number, radius: number): [number, number] {
  const rad = (Math.PI / 180) * (angle - 90);
  return [CX + radius * Math.cos(rad), CY + radius * Math.sin(rad)];
}

function RadarChart() {
  const step = 360 / AXES.length;

  const ringPaths = RINGS.map((r) => {
    const pts = AXES.map((_, i) => polarToCart(i * step, R * r));
    return pts.map((p) => `${p[0]},${p[1]}`).join(" ");
  });

  const dataPoints = VALUES.map((v, i) => polarToCart(i * step, R * v));
  const dataPath = dataPoints.map((p) => `${p[0]},${p[1]}`).join(" ");

  return (
    <svg viewBox="0 0 260 260" className="w-full max-w-[240px] mx-auto">
      {/* Rings */}
      {ringPaths.map((pts, i) => (
        <polygon key={i} points={pts} className="radar-ring" />
      ))}
      {/* Axes */}
      {AXES.map((_, i) => {
        const [ex, ey] = polarToCart(i * step, R);
        return <line key={i} x1={CX} y1={CY} x2={ex} y2={ey} className="radar-axis" />;
      })}
      {/* Data area */}
      <polygon points={dataPath} className="radar-area" />
      {/* Data points */}
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="#8b5cf6" stroke="#050510" strokeWidth="1.5" />
      ))}
      {/* Labels */}
      {AXES.map((label, i) => {
        const [lx, ly] = polarToCart(i * step, R + 18);
        return (
          <text
            key={label}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-text-muted/60 text-[9px] font-mono"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

/* ─── Page ─── */
export default function DnaPage() {
  return (
    <div className="px-4 pb-28">
      {/* ── Headline ── */}
      <div className="pt-2 pb-4">
        <h1 className="text-lg font-bold tracking-tight leading-snug">
          Every song has a signature.
          <br />
          <span className="gradient-text">We extract it.</span>
        </h1>
      </div>

      {/* ── Stats row ── */}
      <div className="flex items-center justify-between gap-2 mb-5">
        {[
          { value: "84", label: "Attributes" },
          { value: "100M", label: "Indexed Songs" },
          { value: "99.2%", label: "Accuracy" },
        ].map((s) => (
          <div key={s.label} className="flex-1 text-center py-2.5 rounded-xl bg-surface border border-white/[0.04]">
            <p className="text-sm font-bold gradient-text">{s.value}</p>
            <p className="text-[9px] text-text-muted/50 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Now Analyzing ── */}
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-surface/60 border border-white/[0.04] mb-4">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-purple opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-purple" />
        </span>
        <p className="text-[10px] font-mono text-text-muted/70">
          Now Analyzing: <span className="text-white font-semibold">Scarface</span> &mdash; by Zeeky
        </p>
      </div>

      {/* ── Radar Chart ── */}
      <div className="mb-5">
        <RadarChart />
      </div>

      {/* ── Top 10 Similar Songs ── */}
      <div className="mb-5">
        <h3 className="text-sm font-bold mb-2.5 tracking-tight">Top 10 Similar Songs</h3>
        <div className="flex flex-col gap-0.5">
          {SIMILAR_TRACKS.map((t) => (
            <div
              key={t.rank}
              className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-surface/50 transition-colors"
            >
              {/* Rank */}
              <span className="w-5 text-right text-[11px] font-mono text-text-muted/40 shrink-0">
                {t.rank}
              </span>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold truncate">{t.title}</p>
                <p className="text-[10px] text-text-muted/50 truncate">{t.artist}</p>
              </div>
              {/* DNA % */}
              <span className="text-[10px] font-mono text-accent-purple shrink-0">{t.dna}%</span>
              {/* Apple Music */}
              <AppleMusicButton track={t.title} artist={t.artist} size="neighbor" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Genre Distribution ── */}
      <div>
        <h3 className="text-sm font-bold mb-2.5 tracking-tight">Genre Distribution</h3>
        <div className="space-y-2">
          {GENRES.map((g) => (
            <div key={g.label}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] text-text-muted/70">{g.label}</span>
                <span className="text-[10px] font-mono text-text-muted/50">{g.pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${g.pct}%`, background: g.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
