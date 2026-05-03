"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types & Data                                                       */
/* ------------------------------------------------------------------ */

type InputMode = "spotify" | "isrc" | "audio";

interface Neighbor {
  rank: number;
  title: string;
  artist: string;
  match: number;
}

interface GenreBar {
  label: string;
  value: number;
}

const NEIGHBORS: Neighbor[] = [
  { rank: 1, title: "Harlem Shake", artist: "Future ft Young Thug", match: 87.0 },
  { rank: 2, title: "Having Our Way", artist: "Migos ft Drake", match: 86.1 },
  { rank: 3, title: "Golden Child", artist: "Lil Durk", match: 85.9 },
  { rank: 4, title: "Said Sum", artist: "Moneybagg Yo", match: 85.0 },
  { rank: 5, title: "What Happened To Virgil", artist: "Lil Durk ft Gunna", match: 85.9 },
  { rank: 6, title: "mop", artist: "Gunna, Young Thug", match: 84.8 },
  { rank: 7, title: "Sup Mate", artist: "Young Thug ft Future", match: 84.8 },
  { rank: 8, title: "poochie gown", artist: "Gunna", match: 84.7 },
  { rank: 9, title: "I'm The Plug", artist: "Drake ft Future", match: 84.3 },
  { rank: 10, title: "NC-17", artist: "Travis Scott", match: 84.1 },
];

const GENRES: GenreBar[] = [
  { label: "Trap Rap", value: 39.4 },
  { label: "Southern Hip-Hop", value: 27.5 },
  { label: "Outliers", value: 16.2 },
  { label: "Pop Rap", value: 9.2 },
  { label: "Drill", value: 7.7 },
];

const RADAR_AXES = [
  { label: "Tempo", value: 78 },
  { label: "Bass", value: 92 },
  { label: "Melody", value: 65 },
  { label: "Chord", value: 84 },
  { label: "Spectral", value: 71 },
];

/* ------------------------------------------------------------------ */
/*  Radar SVG                                                          */
/* ------------------------------------------------------------------ */

function polarToXY(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function RadarSVG({ animated }: { animated: boolean }) {
  const cx = 150;
  const cy = 150;
  const maxR = 120;
  const angleStep = 360 / RADAR_AXES.length;
  const rings = [0.25, 0.5, 0.75, 1.0];

  const dataPoints = RADAR_AXES.map((axis, i) => {
    const r = (axis.value / 100) * maxR;
    return polarToXY(cx, cy, r, i * angleStep);
  });

  const pathD =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + "Z";

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[360px] mx-auto">
      <defs>
        <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#9b51e0" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4a90e2" />
          <stop offset="100%" stopColor="#9b51e0" />
        </linearGradient>
      </defs>

      {/* Ring polygons */}
      {rings.map((r) => (
        <polygon
          key={r}
          points={RADAR_AXES.map((_, i) => polarToXY(cx, cy, maxR * r, i * angleStep).join(",")).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines + labels */}
      {RADAR_AXES.map((axis, i) => {
        const [x, y] = polarToXY(cx, cy, maxR, i * angleStep);
        const [lx, ly] = polarToXY(cx, cy, maxR + 22, i * angleStep);
        return (
          <g key={axis.label}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#94a3b8"
              fontSize="11"
              fontFamily="var(--font-sans)"
            >
              {axis.label}
            </text>
            <text
              x={lx}
              y={ly + 14}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#4a90e2"
              fontSize="10"
              fontFamily="var(--font-mono)"
            >
              {axis.value}%
            </text>
          </g>
        );
      })}

      {/* Data area */}
      <path
        d={pathD}
        fill="url(#radarFill)"
        stroke="url(#radarStroke)"
        strokeWidth="2"
        className={animated ? "animate-radar-draw" : ""}
        style={
          animated
            ? {
                strokeDasharray: 600,
                strokeDashoffset: 0,
                animation: "radar-draw 1.2s ease-out forwards",
              }
            : undefined
        }
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p[0]}
          cy={p[1]}
          r="4"
          fill="#9b51e0"
          stroke="#050507"
          strokeWidth="2"
          className={animated ? "opacity-0" : ""}
          style={
            animated
              ? {
                  animation: `fade-in 0.3s ease-out ${0.8 + i * 0.1}s forwards`,
                }
              : undefined
          }
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Apple Music Button                                                 */
/* ------------------------------------------------------------------ */

function AppleMusicButton() {
  return (
    <button
      className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center"
      style={{ backgroundColor: "var(--apple-red)" }}
      aria-label="Open in Apple Music"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
        <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.073-.005-.148-.01-.22-.015H5.988c-.073.005-.148.01-.22.015-.5.032-1 .092-1.486.196a4.812 4.812 0 00-1.564.726C1.48 1.814.73 2.814.413 4.124a9.23 9.23 0 00-.24 2.19c-.012.163-.015.327-.015.49v10.39c0 .163.003.327.015.49.032.73.1 1.46.24 2.19.317 1.31 1.067 2.31 2.18 3.043a5.022 5.022 0 001.877.726c.5.107 1 .166 1.564.196.073.005.148.01.22.015h12.123c.073-.005.148-.01.22-.015.564-.03 1.064-.09 1.564-.196a5.022 5.022 0 001.877-.726c1.117-.733 1.863-1.733 2.18-3.043.14-.73.208-1.46.24-2.19.012-.163.015-.327.015-.49V6.614c0-.163-.003-.327-.015-.49zm-6.23 5.898a.551.551 0 01-.003.08v5.687a2.927 2.927 0 01-.66 1.776c-.576.645-1.286.97-2.136 1.02-.324.018-.62-.03-.908-.152-.564-.24-.944-.666-1.093-1.27a1.867 1.867 0 01.414-1.742 2.262 2.262 0 011.23-.728c.343-.073.683-.15 1.025-.225.343-.074.564-.277.623-.62a.73.73 0 00.007-.12V9.447a.633.633 0 00-.056-.297c-.067-.148-.198-.22-.367-.186-.113.024-.225.053-.337.082l-4.998 1.2a.551.551 0 00-.39.38c-.02.093-.027.19-.027.286v7.11a4.002 4.002 0 01-.155.88 2.64 2.64 0 01-1.15 1.57c-.473.307-.996.447-1.558.434-.22-.005-.438-.04-.65-.1-.717-.205-1.17-.66-1.336-1.39a1.862 1.862 0 01.244-1.45 2.2 2.2 0 011.093-.85c.397-.147.808-.253 1.216-.36.295-.078.49-.263.56-.562.025-.108.037-.218.037-.33V7.463c0-.24.053-.466.197-.66a.896.896 0 01.484-.328l5.927-1.43c.21-.05.42-.095.634-.12.37-.04.597.18.623.551.003.06.003.118.003.177v6.07z" />
      </svg>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Demo Page                                                     */
/* ------------------------------------------------------------------ */

export default function DemoPage() {
  const [mode, setMode] = useState<InputMode>("spotify");
  const [inputValue, setInputValue] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerAnalysis = useCallback(() => {
    setAnalyzing(true);
    setShowResults(false);
    setTimeout(() => {
      setAnalyzing(false);
      setShowResults(true);
    }, 1500);
  }, []);

  const handleQuickStart = useCallback(() => {
    setMode("spotify");
    setInputValue("https://open.spotify.com/track/scarface-by-zeeky");
    triggerAnalysis();
  }, [triggerAnalysis]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (inputValue.trim()) triggerAnalysis();
    },
    [inputValue, triggerAnalysis]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.type === "audio/mpeg" || file.type === "audio/wav")) {
        setInputValue(file.name);
        triggerAnalysis();
      }
    },
    [triggerAnalysis]
  );

  return (
    <div className="min-h-screen">
      {/* ---- Hero ---- */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-[#4a90e2]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#9b51e0]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#4a90e2] mb-4">
            Interactive Demo
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">DNA Engine</span> Live
          </h1>
          <p className="text-[#94a3b8] max-w-xl mx-auto mb-10">
            Paste a track, upload audio, or try our sample -- watch the engine extract its DNA signature and find its nearest neighbors in real time.
          </p>

          {/* Quick-start */}
          <button
            onClick={handleQuickStart}
            className="mb-10 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Try &quot;Scarface&quot; by Zeeky
          </button>

          {/* ---- Tab selector ---- */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-xl border border-white/10 bg-[#0a0a0f] p-1 gap-1">
              {(
                [
                  { key: "spotify" as InputMode, label: "Paste Spotify URL" },
                  { key: "isrc" as InputMode, label: "Paste ISRC" },
                  { key: "audio" as InputMode, label: "Upload Audio" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setMode(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    mode === tab.key
                      ? "bg-white/10 text-white font-medium"
                      : "text-[#94a3b8] hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ---- Input area ---- */}
          {mode === "audio" ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`mx-auto max-w-xl border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-[#4a90e2] bg-[#4a90e2]/5"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,audio/mpeg,audio/wav"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setInputValue(file.name);
                    triggerAnalysis();
                  }
                }}
              />
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4a90e2"
                strokeWidth="1.5"
                className="mx-auto mb-4"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="text-[#94a3b8] text-sm">
                Drop an MP3 or WAV file here, or click to browse
              </p>
              {inputValue && mode === "audio" && (
                <p className="mt-3 text-xs text-[#4a90e2]">{inputValue}</p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto max-w-xl">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    mode === "spotify"
                      ? "https://open.spotify.com/track/..."
                      : "Enter ISRC code (e.g. USRC17607839)"
                  }
                  className="flex-1 bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#94a3b8]/50 focus:outline-none focus:border-[#4a90e2]/50 transition-colors"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Analyze
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ---- Analyzing state ---- */}
      {analyzing && (
        <section className="py-20 px-6">
          <div className="max-w-md mx-auto text-center">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-[#4a90e2]/20" />
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#4a90e2] border-r-[#9b51e0]"
                style={{ animation: "spin 1s linear infinite" }}
              />
              <div className="absolute inset-3 rounded-full bg-[#0a0a0f] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" strokeWidth="2">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2 gradient-text">Extracting Audio DNA</h2>
            <p className="text-[#94a3b8] text-sm">
              Analyzing 84 attributes across tempo, timbre, harmony, and spectral dimensions...
            </p>
            {/* Animated bars */}
            <div className="flex justify-center gap-1 mt-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-[#4a90e2] to-[#9b51e0] rounded-full"
                  style={{
                    height: `${20 + Math.random() * 30}px`,
                    animation: `pulse-bar 0.8s ease-in-out ${i * 0.07}s infinite alternate`,
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---- Results ---- */}
      {showResults && (
        <section className="pb-24 px-6">
          <div className="max-w-5xl mx-auto">
            {/* Track header */}
            <div className="flex items-center gap-6 mb-12">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#4a90e2]/20 to-[#9b51e0]/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" strokeWidth="1.5">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Scarface</h2>
                <p className="text-[#94a3b8]">Zeeky</p>
              </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Left: Radar */}
              <div className="glass-card p-6 md:p-8">
                <h3 className="text-lg font-bold mb-1">5-Axis DNA Signature</h3>
                <p className="text-[#94a3b8] text-sm mb-6">
                  Audio attributes extracted via signal processing
                </p>
                <RadarSVG animated />
              </div>

              {/* Right: Nearest Neighbors */}
              <div className="glass-card p-6 md:p-8">
                <h3 className="text-lg font-bold mb-1">Top 10 Nearest DNA Neighbors</h3>
                <p className="text-[#94a3b8] text-sm mb-6">
                  Ranked by cosine proximity in 84-dimensional Hilbert space
                </p>
                <div className="space-y-2">
                  {NEIGHBORS.map((n) => (
                    <div
                      key={n.rank}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors group"
                      style={{
                        animation: `slide-in 0.4s ease-out ${n.rank * 0.06}s both`,
                      }}
                    >
                      <span className="text-xs text-[#94a3b8]/50 w-5 text-right font-mono">
                        {n.rank}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        <p className="text-xs text-[#94a3b8] truncate">{n.artist}</p>
                      </div>
                      <span className="text-sm font-mono text-[#4a90e2] flex-shrink-0">
                        {n.match.toFixed(1)}%
                      </span>
                      <AppleMusicButton />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Genre Breakdown */}
            <div className="glass-card p-6 md:p-8 mb-8">
              <h3 className="text-lg font-bold mb-1">Genre Breakdown</h3>
              <p className="text-[#94a3b8] text-sm mb-6">
                Classification distribution across the DNA signature
              </p>
              <div className="space-y-4">
                {GENRES.map((genre, i) => (
                  <div key={genre.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span>{genre.label}</span>
                      <span className="font-mono text-[#4a90e2]">{genre.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${genre.value}%`,
                          background: "linear-gradient(90deg, #4a90e2, #9b51e0)",
                          animation: `bar-grow 0.8s ease-out ${i * 0.1}s both`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#94a3b8]">
                {GENRES.map((g) => (
                  <span key={g.label}>
                    {g.label} {g.value}%
                  </span>
                ))}
              </div>
            </div>

            {/* Hit Prediction */}
            <div className="glass-card p-6 md:p-8 mb-12">
              <h3 className="text-lg font-bold mb-1">Hit Prediction Score</h3>
              <p className="text-[#94a3b8] text-sm mb-6">
                Based on structural similarity to 50,000 historical Billboard hits
              </p>
              <div className="flex items-end gap-4">
                <span className="text-6xl md:text-7xl font-bold gradient-text leading-none">87%</span>
                <div className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-sm text-green-400 font-medium">High Confidence</span>
                  </div>
                  <p className="text-xs text-[#94a3b8]">Confidence band: 82% -- 91%</p>
                </div>
              </div>
              <div className="mt-6 h-3 rounded-full bg-white/5 overflow-hidden relative">
                {/* Confidence band */}
                <div
                  className="absolute h-full bg-[#4a90e2]/20 rounded-full"
                  style={{ left: "82%", width: "9%" }}
                />
                {/* Main bar */}
                <div
                  className="h-full rounded-full relative z-10"
                  style={{
                    width: "87%",
                    background: "linear-gradient(90deg, #4a90e2, #9b51e0)",
                    animation: "bar-grow 1s ease-out 0.2s both",
                  }}
                />
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link
                href="/book-demo"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] text-white font-semibold hover:opacity-90 transition-opacity"
              >
                License this engine for your DSP
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ---- Inline keyframes ---- */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-bar {
          from { transform: scaleY(1); }
          to { transform: scaleY(1.6); }
        }
        @keyframes radar-draw {
          from { stroke-dashoffset: 600; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes bar-grow {
          from { width: 0; }
        }
      `}</style>
    </div>
  );
}
