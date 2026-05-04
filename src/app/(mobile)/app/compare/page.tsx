"use client";

import { useState, useEffect, useRef } from "react";

interface Song {
  id: number;
  artist: string;
  title: string;
  year: number;
  genre: string;
  peak: number;
  weeks: number;
  rank: number;
  dhsScore: number;
  energyTotal: number;
  energyNorm: number;
  appleId?: number;
}

function getVerdict(score: number): string {
  if (score > 90) return "Nearly identical DNA";
  if (score > 80) return "Very strong match";
  if (score > 70) return "Strong similarity";
  if (score > 60) return "Moderate similarity";
  return "Different DNA profiles";
}

function getVerdictColor(score: number): string {
  if (score > 90) return "text-green-400";
  if (score > 80) return "text-emerald-400";
  if (score > 70) return "text-blue-400";
  if (score > 60) return "text-yellow-400";
  return "text-red-400";
}

export default function ComparePage() {
  const [queryA, setQueryA] = useState("");
  const [queryB, setQueryB] = useState("");
  const [resultsA, setResultsA] = useState<Song[]>([]);
  const [resultsB, setResultsB] = useState<Song[]>([]);
  const [songA, setSongA] = useState<Song | null>(null);
  const [songB, setSongB] = useState<Song | null>(null);
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [noMatch, setNoMatch] = useState(false);

  const searchTimeoutA = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTimeoutB = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search for Song A
  useEffect(() => {
    if (!queryA.trim()) {
      setResultsA([]);
      return;
    }
    if (searchTimeoutA.current) clearTimeout(searchTimeoutA.current);
    searchTimeoutA.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/dna/search?q=${encodeURIComponent(queryA)}&limit=6`);
        if (res.ok) {
          const data: Song[] = await res.json();
          setResultsA(data);
        }
      } catch {
        // Silently fail
      }
    }, 300);
    return () => {
      if (searchTimeoutA.current) clearTimeout(searchTimeoutA.current);
    };
  }, [queryA]);

  // Debounced search for Song B
  useEffect(() => {
    if (!queryB.trim()) {
      setResultsB([]);
      return;
    }
    if (searchTimeoutB.current) clearTimeout(searchTimeoutB.current);
    searchTimeoutB.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/dna/search?q=${encodeURIComponent(queryB)}&limit=6`);
        if (res.ok) {
          const data: Song[] = await res.json();
          setResultsB(data);
        }
      } catch {
        // Silently fail
      }
    }, 300);
    return () => {
      if (searchTimeoutB.current) clearTimeout(searchTimeoutB.current);
    };
  }, [queryB]);

  // When both songs are selected, fetch similarity
  useEffect(() => {
    if (!songA || !songB) {
      setSimilarity(null);
      setNoMatch(false);
      return;
    }

    async function fetchSimilarity() {
      setLoading(true);
      setNoMatch(false);
      setSimilarity(null);
      try {
        const res = await fetch(`/api/dna/similars?id=${songA!.id}`);
        if (!res.ok) {
          setNoMatch(true);
          setLoading(false);
          return;
        }
        const data = await res.json();
        const match = data.similars.find(
          (s: { id: number; similarity: number }) => s.id === songB!.id
        );
        if (match) {
          setSimilarity(match.similarity);
        } else {
          setNoMatch(true);
        }
      } catch {
        setNoMatch(true);
      } finally {
        setLoading(false);
      }
    }

    fetchSimilarity();
  }, [songA, songB]);

  function selectSongA(song: Song) {
    setSongA(song);
    setQueryA("");
    setResultsA([]);
  }

  function selectSongB(song: Song) {
    setSongB(song);
    setQueryB("");
    setResultsB([]);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Compare</h1>
        <p className="text-text-muted text-xs mt-0.5">Search and compare any two songs from the catalog</p>
      </div>

      {/* Song Selector Cards */}
      <div className="flex gap-2">
        {/* Song A */}
        <div className="flex-1 bg-surface border border-white/5 rounded-xl p-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-accent-purple" />
          <p className="text-[10px] text-accent-purple font-medium uppercase tracking-wider mb-1.5">Song A</p>

          {songA ? (
            <div>
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h4 className="text-[11px] font-medium text-white truncate">{songA.title}</h4>
                  <p className="text-[9px] text-text-muted truncate">{songA.artist}</p>
                </div>
                <button
                  onClick={() => setSongA(null)}
                  className="ml-1 shrink-0 w-5 h-5 rounded-full bg-white/5 flex items-center justify-center"
                >
                  <span className="text-[9px] text-text-muted">x</span>
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/5 text-text-muted/60">{songA.genre.split(",")[0]}</span>
                <span className="text-[8px] font-mono text-purple-400">Hit: {songA.dhsScore}%</span>
              </div>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={queryA}
                onChange={(e) => setQueryA(e.target.value)}
                placeholder="Search song..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-white placeholder:text-text-muted/50 outline-none focus:border-purple-500/50"
              />
              {resultsA.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-white/10 rounded-lg overflow-hidden z-20 max-h-48 overflow-y-auto shadow-xl">
                  {resultsA.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => selectSongA(result)}
                      className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-white/5 active:bg-white/10 transition-colors text-left border-b border-white/5 last:border-b-0"
                    >
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500/15 to-blue-500/15 flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 text-purple-400">
                          <circle cx="12" cy="12" r="10" opacity="0.3" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[10px] font-medium text-white truncate">{result.title}</h4>
                        <p className="text-[8px] text-text-muted truncate">{result.artist}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
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

          {songB ? (
            <div>
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h4 className="text-[11px] font-medium text-white truncate">{songB.title}</h4>
                  <p className="text-[9px] text-text-muted truncate">{songB.artist}</p>
                </div>
                <button
                  onClick={() => setSongB(null)}
                  className="ml-1 shrink-0 w-5 h-5 rounded-full bg-white/5 flex items-center justify-center"
                >
                  <span className="text-[9px] text-text-muted">x</span>
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/5 text-text-muted/60">{songB.genre.split(",")[0]}</span>
                <span className="text-[8px] font-mono text-blue-400">Hit: {songB.dhsScore}%</span>
              </div>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={queryB}
                onChange={(e) => setQueryB(e.target.value)}
                placeholder="Search song..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-white placeholder:text-text-muted/50 outline-none focus:border-blue-500/50"
              />
              {resultsB.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-white/10 rounded-lg overflow-hidden z-20 max-h-48 overflow-y-auto shadow-xl">
                  {resultsB.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => selectSongB(result)}
                      className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-white/5 active:bg-white/10 transition-colors text-left border-b border-white/5 last:border-b-0"
                    >
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500/15 to-blue-500/15 flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 text-blue-400">
                          <circle cx="12" cy="12" r="10" opacity="0.3" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[10px] font-medium text-white truncate">{result.title}</h4>
                        <p className="text-[8px] text-text-muted truncate">{result.artist}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Results */}
      {songA && songB && (
        <>
          {/* Loading State */}
          {loading && (
            <div className="bg-surface border border-white/5 rounded-2xl p-6 text-center">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse mx-auto mb-2" />
              <p className="text-[10px] text-text-muted">Analyzing DNA similarity...</p>
            </div>
          )}

          {/* No Match State */}
          {!loading && noMatch && (
            <div className="bg-surface border border-white/5 rounded-2xl p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-text-muted/50">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xs font-semibold mb-1">No direct DNA match found</h3>
              <p className="text-[10px] text-text-muted/60 leading-relaxed max-w-[240px] mx-auto">
                These songs are not in each other&apos;s DNA similarity network. Try comparing songs in similar genres for better results.
              </p>
            </div>
          )}

          {/* Similarity Score */}
          {!loading && similarity !== null && (
            <>
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
                    <span className="text-lg font-bold">{similarity.toFixed(1)}%</span>
                  </div>
                </div>
                <p className={`text-xs font-medium ${getVerdictColor(similarity)}`}>
                  {getVerdict(similarity)}
                </p>
                <p className="text-[10px] text-text-muted/50 mt-0.5">Based on audio DNA analysis</p>
              </div>

              {/* Song Details Comparison */}
              <div className="bg-surface border border-white/5 rounded-2xl p-4">
                <h3 className="text-sm font-bold mb-3">Song Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* Song A Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-purple" />
                      <span className="text-[10px] font-medium text-accent-purple">Song A</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-white truncate">{songA.title}</p>
                      <p className="text-[9px] text-text-muted truncate">{songA.artist}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[9px] text-text-muted/60">Genre</span>
                        <span className="text-[9px] text-white/80 truncate ml-1">{songA.genre.split(",")[0]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[9px] text-text-muted/60">Hit Score</span>
                        <span className="text-[9px] font-mono text-purple-400">{songA.dhsScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[9px] text-text-muted/60">Year</span>
                        <span className="text-[9px] text-white/80">{songA.year}</span>
                      </div>
                    </div>
                  </div>

                  {/* Song B Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
                      <span className="text-[10px] font-medium text-accent-blue">Song B</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-white truncate">{songB.title}</p>
                      <p className="text-[9px] text-text-muted truncate">{songB.artist}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[9px] text-text-muted/60">Genre</span>
                        <span className="text-[9px] text-white/80 truncate ml-1">{songB.genre.split(",")[0]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[9px] text-text-muted/60">Hit Score</span>
                        <span className="text-[9px] font-mono text-blue-400">{songB.dhsScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[9px] text-text-muted/60">Year</span>
                        <span className="text-[9px] text-white/80">{songB.year}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verdict */}
              <div className="bg-surface border border-white/5 rounded-2xl p-4">
                <h3 className="text-sm font-bold mb-1">Verdict</h3>
                <p className="text-[10px] text-text-muted/70 leading-relaxed">
                  <span className="text-accent-purple font-medium">{songA.title}</span> and{" "}
                  <span className="text-accent-blue font-medium">{songB.title}</span> share a{" "}
                  <span className="text-white font-medium">{similarity.toFixed(1)}% DNA similarity</span> score.{" "}
                  {getVerdict(similarity)} — {similarity > 70
                    ? "these tracks share significant sonic DNA and would blend well in a playlist."
                    : similarity > 60
                    ? "there are some shared characteristics but distinct sonic identities."
                    : "these tracks have quite different sonic profiles."}
                </p>
              </div>
            </>
          )}
        </>
      )}

      {/* Empty State */}
      {!songA && !songB && (
        <div className="bg-surface border border-white/5 rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center mx-auto mb-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-text-muted/40">
              <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h3 className="text-xs font-semibold mb-1">Select two songs to compare</h3>
          <p className="text-[10px] text-text-muted/50 max-w-[200px] mx-auto">
            Search from our 50K song catalog to discover how similar any two tracks are.
          </p>
        </div>
      )}

      {/* Share Button */}
      {similarity !== null && (
        <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-xs font-semibold active:opacity-80 transition-opacity">
          Share Comparison
        </button>
      )}
    </div>
  );
}
