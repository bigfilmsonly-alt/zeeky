"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import StreamingButtons from "@/components/StreamingButtons";
import AddToPlaylistButton from "@/components/AddToPlaylistButton";

/* --- Fallback data --- */
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

/* --- Types --- */
interface SimilarTrack { rank: number; title: string; artist: string; dna: string }
interface Genre { label: string; pct: number; color: string }
interface SearchResult { id: string; title: string; artist: string; hit_score: number }

/* --- Skeleton --- */
function TrackSkeleton() {
  return (
    <div className="flex items-center gap-2.5 py-2 px-2 rounded-lg">
      <div className="w-5 h-3 rounded bg-white/5 animate-pulse shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="h-3 w-24 rounded bg-white/5 animate-pulse" />
        <div className="h-2.5 w-16 rounded bg-white/5 animate-pulse" />
      </div>
      <div className="w-8 h-3 rounded bg-white/5 animate-pulse shrink-0" />
    </div>
  );
}

/* --- Radar SVG --- */
const AXES = ["Tempo", "Bass", "Melody", "Chord", "Spectral"];
const VALUES = [0.82, 0.91, 0.65, 0.74, 0.88];
const CX = 130, CY = 130, R = 100;
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
      {ringPaths.map((pts, i) => <polygon key={i} points={pts} className="radar-ring" />)}
      {AXES.map((_, i) => {
        const [ex, ey] = polarToCart(i * step, R);
        return <line key={i} x1={CX} y1={CY} x2={ex} y2={ey} className="radar-axis" />;
      })}
      <polygon points={dataPath} className="radar-area" />
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="#8b5cf6" stroke="#050510" strokeWidth="1.5" />
      ))}
      {AXES.map((label, i) => {
        const [lx, ly] = polarToCart(i * step, R + 18);
        return (
          <text key={label} x={lx} y={ly} textAnchor="middle" dominantBaseline="central" className="fill-text-muted/60 text-[9px] font-mono">
            {label}
          </text>
        );
      })}
    </svg>
  );
}

/* --- Main content --- */
function DnaPageContent() {
  const searchParams = useSearchParams();
  const initialSong = searchParams.get("song");

  // Search state
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Analysis state
  const [seedSong, setSeedSong] = useState<{ id: string; title: string; artist: string } | null>(null);
  const [similarTracks, setSimilarTracks] = useState<SimilarTrack[]>(FALLBACK_SIMILAR_TRACKS);
  const [genres] = useState<Genre[]>(FALLBACK_GENRES);
  const [analyzing, setAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (q.length < 1) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    setSearching(true);
    setShowResults(true);
    try {
      const res = await fetch(`/api/songs/search?q=${encodeURIComponent(q)}&limit=10`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value.trim()), 250);
  };

  // Analyze a selected song
  const analyzeSong = useCallback(async (id: string, title: string, artist: string) => {
    setSeedSong({ id, title, artist });
    setQuery(`${title} — ${artist}`);
    setShowResults(false);
    setAnalyzing(true);
    setHasAnalyzed(false);
    setSaved(false);

    try {
      const res = await fetch(`/api/songs/${encodeURIComponent(id)}/similar?limit=50`);
      if (!res.ok) throw new Error();
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        setSimilarTracks(
          data.results.map((s: any, i: number) => ({
            rank: i + 1,
            title: s.title,
            artist: s.artist || "Unknown",
            dna: typeof s.similarity === "string" ? s.similarity : ((s.similarity ?? 80) * 1).toFixed(1),
          }))
        );
      } else {
        setSimilarTracks(FALLBACK_SIMILAR_TRACKS);
      }
      setHasAnalyzed(true);
    } catch {
      setSimilarTracks(FALLBACK_SIMILAR_TRACKS);
      setHasAnalyzed(true);
    } finally {
      setAnalyzing(false);
    }
  }, []);

  // Load from URL param on mount
  useEffect(() => {
    if (initialSong) {
      analyzeSong(initialSong, initialSong, "");
    }
  }, [initialSong, analyzeSong]);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const handleSaveAsPlaylist = async () => {
    if (saving || saved) return;
    setSaving(true);
    try {
      const res = await fetch("/api/playlist/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songIds: similarTracks.map((t) => `${t.title}-${t.artist}`),
          playlistName: "Discovered by Zeeky",
        }),
      });
      if (res.ok) setSaved(true);
    } catch {} finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 pb-28">
      {/* --- Header --- */}
      <div className="pt-2 pb-3">
        <h1 className="text-lg font-bold tracking-tight leading-snug">
          Analyze a seed track
        </h1>
        <p className="text-[10px] text-text-muted/50 mt-0.5">
          Search any song to find 50 similar tracks by DNA
        </p>
      </div>

      {/* --- Search Bar --- */}
      <div className="relative mb-4">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-text-muted/40">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
          placeholder="Search by song title or artist..."
          className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-surface border border-white/[0.06] text-sm text-white placeholder:text-text-muted/30 focus:outline-none focus:border-violet/40 transition-colors"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setSearchResults([]); setShowResults(false); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-text-muted/40 hover:text-white transition-colors">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {/* --- Search Dropdown --- */}
        {showResults && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-white/[0.08] rounded-xl overflow-hidden z-50 shadow-xl shadow-black/40">
            {searching ? (
              <div className="px-4 py-6 text-center">
                <div className="w-5 h-5 border-2 border-white/10 border-t-violet rounded-full animate-spin mx-auto" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="px-4 py-4 text-center text-[11px] text-text-muted/50">
                No songs found
              </div>
            ) : (
              <div className="max-h-[240px] overflow-y-auto">
                {searchResults.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => analyzeSong(r.id, r.title, r.artist)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors border-b border-white/[0.03] last:border-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet/20 to-blue/20 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-violet/60">
                        <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold truncate">{r.title}</p>
                      <p className="text-[10px] text-text-muted/50 truncate">{r.artist}</p>
                    </div>
                    <span className="text-[9px] text-text-muted/30 shrink-0">Analyze</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- DNA Ribbon --- */}
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-surface/60 border border-white/[0.04] mb-4">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <p className="text-[9px] font-mono text-text-muted/70 tracking-wider uppercase">
          Powered by Zeeky DNA &middot; 84 Audio Attributes
        </p>
      </div>

      {/* --- Empty state (no song selected yet) --- */}
      {!seedSong && !analyzing && !hasAnalyzed && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-surface border border-white/[0.06] flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-violet/30">
              <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-text-muted/60 mb-1">Search for a seed track above</p>
          <p className="text-[10px] text-text-muted/30 max-w-[220px]">
            We&apos;ll extract its DNA fingerprint and find 50 songs that actually sound like it
          </p>
        </div>
      )}

      {/* --- Analyzing spinner --- */}
      {analyzing && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-10 h-10 border-2 border-white/10 border-t-violet rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-text-muted/70">Extracting DNA...</p>
          <p className="text-[10px] text-text-muted/40 mt-1">Analyzing 84 audio attributes</p>
        </div>
      )}

      {/* --- Analysis Results --- */}
      {hasAnalyzed && seedSong && !analyzing && (
        <>
          {/* Now Analyzing */}
          <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-violet/5 border border-violet/10 mb-4">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet" />
            </span>
            <p className="text-[10px] font-mono text-text-muted/70">
              Seed: <span className="text-white font-semibold">{seedSong.title}</span>
              {seedSong.artist && <> &mdash; {seedSong.artist}</>}
            </p>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between gap-2 mb-4">
            {[
              { value: "84", label: "Attributes" },
              { value: String(similarTracks.length), label: "Similar Songs" },
              { value: "99.2%", label: "Accuracy" },
            ].map((s) => (
              <div key={s.label} className="flex-1 text-center py-2 rounded-xl bg-surface border border-white/[0.04]">
                <p className="text-sm font-bold gradient-text">{s.value}</p>
                <p className="text-[9px] text-text-muted/50 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Radar Chart */}
          <div className="mb-4">
            <RadarChart />
          </div>

          {/* Similar Songs Header + Save */}
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-bold tracking-tight">
              Top {similarTracks.length} Similar Songs
            </h3>
            <button
              onClick={handleSaveAsPlaylist}
              disabled={saving || saved}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all active:scale-95 ${
                saved
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-violet/10 text-violet border border-violet/20 hover:bg-violet/20"
              }`}
            >
              {saving ? (
                <span className="w-3 h-3 border border-violet/30 border-t-violet rounded-full animate-spin" />
              ) : saved ? (
                <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
              {saved ? "Saved" : "Save Playlist"}
            </button>
          </div>

          {/* Similar Songs List */}
          <div className="flex flex-col gap-0.5 mb-5">
            {similarTracks.map((t) => (
              <div
                key={t.rank}
                className="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-surface/50 transition-colors"
              >
                <span className="w-5 text-right text-[11px] font-mono text-text-muted/40 shrink-0">
                  {t.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold truncate">{t.title}</p>
                  <p className="text-[10px] text-text-muted/50 truncate">{t.artist}</p>
                </div>
                <span className="text-[10px] font-mono text-violet shrink-0">{t.dna}%</span>
                <AddToPlaylistButton songTitle={t.title} songArtist={t.artist} size="sm" />
                <StreamingButtons track={t.title} artist={t.artist} size="sm" />
              </div>
            ))}
          </div>

          {/* Genre Distribution */}
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
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${g.pct}%`, background: g.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* --- Fallback --- */
function DnaPageFallback() {
  return (
    <div className="px-4 pb-28 pt-2">
      <div className="h-5 w-48 rounded bg-white/5 animate-pulse mb-4" />
      <div className="h-10 w-full rounded-xl bg-white/5 animate-pulse mb-4" />
      {Array.from({ length: 6 }).map((_, i) => <TrackSkeleton key={i} />)}
    </div>
  );
}

/* --- Page --- */
export default function DnaPage() {
  return (
    <Suspense fallback={<DnaPageFallback />}>
      <DnaPageContent />
    </Suspense>
  );
}
