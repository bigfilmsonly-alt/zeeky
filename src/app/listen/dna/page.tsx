"use client";

import { useState, useEffect } from "react";
import AppleMusicButton from "@/components/AppleMusicButton";
import AddToPlaylistButton from "@/components/AddToPlaylistButton";

/* ─── Fallback data ─── */
const FALLBACK_SIMILAR_TRACKS = [
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

const FALLBACK_GENRES = [
  { label: "Trap", pct: 39.4, color: "#8b5cf6" },
  { label: "Southern Hip-Hop", pct: 27.5, color: "#3b82f6" },
  { label: "Outliers", pct: 16.2, color: "#06b6d4" },
  { label: "Pop Rap", pct: 9.2, color: "#f59e0b" },
  { label: "Drill", pct: 7.7, color: "#ef4444" },
];

/* ─── Types ─── */
interface SimilarTrack {
  rank: number;
  title: string;
  artist: string;
  dna: string;
}

interface Genre {
  label: string;
  pct: number;
  color: string;
}

/* ─── Skeleton ─── */
function TrackSkeleton() {
  return (
    <div className="flex items-center gap-2.5 py-2 px-2 rounded-lg">
      <div className="w-5 h-3 rounded bg-white/5 animate-pulse shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="h-3 w-24 rounded bg-white/5 animate-pulse" />
        <div className="h-2.5 w-16 rounded bg-white/5 animate-pulse" />
      </div>
      <div className="w-8 h-3 rounded bg-white/5 animate-pulse shrink-0" />
      <div className="w-7 h-7 rounded-full bg-white/5 animate-pulse shrink-0" />
      <div className="w-7 h-7 rounded-md bg-white/5 animate-pulse shrink-0" />
    </div>
  );
}

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
  const [similarTracks, setSimilarTracks] = useState<SimilarTrack[]>(FALLBACK_SIMILAR_TRACKS);
  const [genres] = useState<Genre[]>(FALLBACK_GENRES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchSimilar() {
      try {
        // Use a default song ID — "scarface" as the seed track
        const res = await fetch("/api/songs/scarface/similar?limit=50");
        if (!res.ok) throw new Error("API unavailable");
        const data = await res.json();

        if (!cancelled && data.results && data.results.length > 0) {
          const tracks: SimilarTrack[] = data.results.map(
            (s: { title: string; artist: string; similarity?: number; dna_score?: number }, i: number) => ({
              rank: i + 1,
              title: s.title,
              artist: s.artist,
              dna: (s.similarity ?? s.dna_score ?? 80 + Math.random() * 10).toFixed(1),
            })
          );
          setSimilarTracks(tracks);
        }
        // If no results, fallback data stays
      } catch {
        // API not available — keep fallback data
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSimilar();
    return () => { cancelled = true; };
  }, []);

  const handleSaveAsPlaylist = async () => {
    if (saving || saved) return;
    setSaving(true);

    try {
      // Attempt to save all tracks as a "Discovered by Zeeky" playlist
      const res = await fetch("/api/playlist/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songIds: similarTracks.map((t) => `${t.title}-${t.artist}`),
          playlistName: "Discovered by Zeeky",
        }),
      });
      if (res.ok) {
        setSaved(true);
      }
    } catch {
      // Silently fail — user not authenticated or API unavailable
    } finally {
      setSaving(false);
    }
  };

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

      {/* ── Save as Playlist + Section Header ── */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-bold tracking-tight">
            {similarTracks.length > 10 ? `Top ${similarTracks.length} Similar Songs` : "Top 10 Similar Songs"}
          </h3>
          <button
            onClick={handleSaveAsPlaylist}
            disabled={saving || saved}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all active:scale-95 ${
              saved
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-accent-purple/10 text-accent-purple border border-accent-purple/20 hover:bg-accent-purple/20"
            }`}
          >
            {saving ? (
              <span className="w-3 h-3 border border-accent-purple/30 border-t-accent-purple rounded-full animate-spin" />
            ) : saved ? (
              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="7,3 7,8 15,8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {saved ? "Playlist Saved" : "Save as Playlist"}
          </button>
        </div>

        {/* ── Similar Songs List ── */}
        <div className="flex flex-col gap-0.5 max-h-[60vh] overflow-y-auto scrollbar-none">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => <TrackSkeleton key={i} />)
            : similarTracks.map((t) => (
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
                  {/* Add to Playlist */}
                  <AddToPlaylistButton songTitle={t.title} songArtist={t.artist} size="sm" />
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
          {genres.map((g) => (
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
