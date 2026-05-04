"use client";

import { useState } from "react";

const radarArtists = [
  { name: "Drake", value: 0.95 },
  { name: "Future", value: 0.92 },
  { name: "Lil Uzi Vert", value: 0.78 },
  { name: "21 Savage", value: 0.85 },
  { name: "Travis Scott", value: 0.72 },
  { name: "Lil Baby", value: 0.88 },
  { name: "Young Thug", value: 0.82 },
  { name: "Gunna", value: 0.75 },
  { name: "Kodak Black", value: 0.55 },
  { name: "Rod Wave", value: 0.48 },
  { name: "Post Malone", value: 0.45 },
  { name: "Kendrick Lamar", value: 0.58 },
];

const targetMarket = [
  { demographic: "Male 18-24", pct: 34, color: "from-purple-500 to-purple-700" },
  { demographic: "Male 25-34", pct: 28, color: "from-blue-500 to-blue-700" },
  { demographic: "Female 18-24", pct: 18, color: "from-cyan-500 to-cyan-700" },
  { demographic: "Female 25-34", pct: 12, color: "from-pink-500 to-pink-700" },
  { demographic: "Other", pct: 8, color: "from-yellow-500 to-yellow-700" },
];

const topCities = [
  { city: "Atlanta", listeners: "32K" },
  { city: "Houston", listeners: "28K" },
  { city: "Los Angeles", listeners: "25K" },
  { city: "New York", listeners: "22K" },
  { city: "Chicago", listeners: "19K" },
];

const proximityResultsScarface = [
  { song: "Scarface", artist: "Zeeky", proximity: 100.0, isSelf: true },
  { song: "Harlem Shake", artist: "Future ft Young Thug", proximity: 87.0, isSelf: false },
  { song: "Having Our Way", artist: "Migos ft Drake", proximity: 86.12, isSelf: false },
  { song: "Golden Child", artist: "Lil Durk", proximity: 85.93, isSelf: false },
  { song: "Said Sum", artist: "Moneybagg Yo", proximity: 85.02, isSelf: false },
  { song: "What Happened To Virgil", artist: "Lil Durk ft Gunna", proximity: 84.82, isSelf: false },
  { song: "Mop", artist: "Gunna ft Young Thug", proximity: 84.82, isSelf: false },
  { song: "Sup Mate", artist: "Young Thug ft Future", proximity: 84.76, isSelf: false },
  { song: "Poochie Gown", artist: "Gunna", proximity: 84.67, isSelf: false },
  { song: "I'm The Plug", artist: "Drake & Future", proximity: 84.32, isSelf: false },
];

const proximityResultsGold = [
  { song: "Gold", artist: "Zeeky", proximity: 100.0, isSelf: true },
  { song: "Praise The Lord (Da Shine)", artist: "A$AP Rocky ft Skepta", proximity: 94.72, isSelf: false },
  { song: "Walk Em Down", artist: "Metro Boomin & 21 Savage", proximity: 94.52, isSelf: false },
  { song: "War Bout It", artist: "Lil Durk ft 21 Savage", proximity: 94.27, isSelf: false },
  { song: "Love Sosa", artist: "Chief Keef", proximity: 94.09, isSelf: false },
  { song: "Better", artist: "Khalid", proximity: 93.79, isSelf: false },
  { song: "U-Digg", artist: "Lil Baby, 42 Dugg & Veeze", proximity: 93.66, isSelf: false },
  { song: "Split", artist: "Yeat", proximity: 93.53, isSelf: false },
  { song: "Poland", artist: "Lil Yachty", proximity: 93.43, isSelf: false },
  { song: "Liability", artist: "Drake", proximity: 93.3, isSelf: false },
];

export default function StudioPage() {
  const [activeTrack, setActiveTrack] = useState<"scarface" | "gold">("scarface");
  const score = activeTrack === "scarface" ? 86.76 : 80.96;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Studio</h1>
        <p className="text-text-muted text-xs mt-0.5">Analyze, predict, and optimize</p>
      </div>

      {/* Upload CTA */}
      <div className="border-2 border-dashed border-white/10 rounded-2xl p-3 text-center active:border-accent-purple/30 transition-colors">
        <div className="w-10 h-10 mx-auto rounded-full bg-accent-purple/10 flex items-center justify-center mb-1.5">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-accent-purple">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-sm font-bold">Drop a Track. Get Your Score.</h3>
        <p className="text-[10px] text-text-muted/60 mt-0.5">MP3, WAV, FLAC — instant AI analysis</p>
      </div>

      {/* Track selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTrack("scarface")}
          className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTrack === "scarface" ? "bg-accent-purple text-white" : "bg-white/5 text-text-muted"
          }`}
        >
          Scarface
        </button>
        <button
          onClick={() => setActiveTrack("gold")}
          className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTrack === "gold" ? "bg-accent-blue text-white" : "bg-white/5 text-text-muted"
          }`}
        >
          Gold
        </button>
      </div>

      {/* Hit Prediction Score */}
      <div className="bg-surface border border-white/5 rounded-2xl p-4 text-center">
        <h3 className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Hit Prediction Score</h3>
        <div className="flex items-center justify-center gap-1 mb-2">
          <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3 text-text-muted/50">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 7v4M8 5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-[10px] text-text-muted/50">Based on 50 similar songs</span>
        </div>
        <div className="relative w-20 h-20 mx-auto mb-2">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42" fill="none" stroke="url(#scoreGrad)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${score * 2.64} 264`}
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold">{score.toFixed(1)}%</span>
          </div>
        </div>
        <p className="text-xs text-green-400 font-medium">{score >= 85 ? "High Hit Potential" : "Strong Potential"}</p>
        <p className="text-[10px] text-text-muted/50 mt-0.5">Calculated from proximity to Billboard-charting songs in our 50K+ database</p>
      </div>

      {/* DNA Proximity Results */}
      <div className="bg-surface border border-white/5 rounded-2xl p-4">
        <h3 className="text-sm font-bold mb-0.5">DNA Proximity Results</h3>
        <p className="text-[10px] text-text-muted/60 mb-3">Closest matches in our database sorted by proximity</p>
        <div className="space-y-1.5">
          {(activeTrack === "scarface" ? proximityResultsScarface : proximityResultsGold).map((item, i) => (
            <div key={i} className="flex items-center gap-2 py-1 border-b border-white/5 last:border-0">
              <span className="w-4 text-[10px] text-text-muted/50 font-mono">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <span className="text-xs truncate block">{item.song} - {item.artist}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className={`text-xs font-mono ${item.isSelf ? "text-green-400" : "text-accent-purple"}`}>
                  {item.proximity.toFixed(2)}%
                </span>
                {item.isSelf && (
                  <span className="text-[9px] text-green-400/70 bg-green-400/10 px-1 rounded">Self</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-text-muted/40 mt-2 text-center">Showing top 10 of 50 total matches</p>
      </div>

      {/* Similar Artists Radar */}
      <div className="bg-surface border border-white/5 rounded-2xl p-4">
        <h3 className="text-sm font-bold mb-0.5">Similar Artists</h3>
        <p className="text-[10px] text-text-muted/60 mb-2">Your sound mapped against top artists</p>
        <MiniRadar artists={radarArtists} />
      </div>

      {/* Target Market */}
      <div className="bg-surface border border-white/5 rounded-2xl p-4">
        <h3 className="text-sm font-bold mb-0.5">Target Market</h3>
        <p className="text-[10px] text-text-muted/60 mb-3">AI-identified audience for &quot;{activeTrack === "scarface" ? "Scarface" : "Gold"}&quot;</p>
        <div className="space-y-2.5">
          {targetMarket.map((seg) => (
            <div key={seg.demographic}>
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-text-muted/70">{seg.demographic}</span>
                <span className="font-mono text-text-muted">{seg.pct}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${seg.color}`} style={{ width: `${seg.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Cities */}
      <div className="bg-surface border border-white/5 rounded-2xl p-4">
        <h3 className="text-sm font-bold mb-2">Top Cities</h3>
        <div className="space-y-1.5">
          {topCities.map((city, i) => (
            <div key={city.city} className="flex items-center gap-2.5 py-1">
              <span className="w-4 text-[10px] text-text-muted/50 font-mono">{i + 1}</span>
              <span className="flex-1 text-xs">{city.city}</span>
              <span className="text-xs font-mono text-accent-purple">{city.listeners}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Genre Distribution */}
      <div className="bg-surface border border-white/5 rounded-2xl p-4">
        <h3 className="text-sm font-bold mb-3">Genre Distribution</h3>
        <div className="flex gap-3 justify-center">
          {[
            { genre: "Trap", pct: "36%", color: "from-purple-500 to-purple-700" },
            { genre: "Hip Hop", pct: "27%", color: "from-blue-500 to-blue-700" },
            { genre: "Pop", pct: "17%", color: "from-cyan-500 to-cyan-700" },
            { genre: "Other", pct: "20%", color: "from-pink-500 to-pink-700" },
          ].map((g) => (
            <div key={g.genre} className="text-center">
              <div className={`w-10 h-10 mx-auto rounded-full bg-gradient-to-br ${g.color} flex items-center justify-center mb-1`}>
                <span className="text-[10px] font-bold text-white">{g.pct}</span>
              </div>
              <span className="text-[9px] text-text-muted">{g.genre}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniRadar({ artists }: { artists: { name: string; value: number }[] }) {
  const cx = 150, cy = 150, maxR = 100, rings = 4;
  const n = artists.length;
  const angleStep = (2 * Math.PI) / n;
  const round = (v: number) => Math.round(v * 100) / 100;

  const points = artists.map((a, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = a.value * maxR;
    return {
      x: round(cx + r * Math.cos(angle)),
      y: round(cy + r * Math.sin(angle)),
      lx: round(cx + (maxR + 20) * Math.cos(angle)),
      ly: round(cy + (maxR + 20) * Math.sin(angle)),
      name: a.name,
    };
  });

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[160px] mx-auto">
      <defs>
        <linearGradient id="mrf" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      {Array.from({ length: rings }, (_, i) => (
        <circle key={i} cx={cx} cy={cy} r={(maxR / rings) * (i + 1)} className="radar-ring" />
      ))}
      {artists.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={round(cx + maxR * Math.cos(angle))} y2={round(cy + maxR * Math.sin(angle))} className="radar-axis" />;
      })}
      <polygon points={points.map((p) => `${p.x},${p.y}`).join(" ")} fill="url(#mrf)" stroke="#8b5cf6" strokeWidth="1.5" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#8b5cf6" stroke="#fff" strokeWidth="0.5" />
      ))}
      {points.map((p, i) => (
        <text key={i} x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle" className="fill-text-muted" fontSize="6.5">{p.name}</text>
      ))}
    </svg>
  );
}
