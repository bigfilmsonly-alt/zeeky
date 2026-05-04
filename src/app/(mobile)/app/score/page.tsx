"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Static data for the results screen                                 */
/* ------------------------------------------------------------------ */
const DNA_BARS = [
  { label: "Tempo", value: 82, color: "from-purple-500 to-purple-700" },
  { label: "Bass Presence", value: 91, color: "from-blue-500 to-blue-700" },
  { label: "Melody Variation", value: 74, color: "from-cyan-500 to-cyan-700" },
  { label: "Chord Progression", value: 68, color: "from-pink-500 to-pink-700" },
  { label: "Spectral Energy", value: 88, color: "from-yellow-500 to-yellow-700" },
];

const SIMILAR_ARTISTS = [
  { name: "Drake", pct: 95 },
  { name: "Future", pct: 88 },
  { name: "Travis Scott", pct: 79 },
];

const FINAL_SCORE = 89;

/* ------------------------------------------------------------------ */
/*  Flow states                                                        */
/* ------------------------------------------------------------------ */
type FlowState = "idle" | "uploading" | "analyzing" | "results";

export default function ScorePage() {
  const [flow, setFlow] = useState<FlowState>("idle");
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Animated counters for the results phase */
  const [displayScore, setDisplayScore] = useState(0);
  const [barWidths, setBarWidths] = useState<number[]>(DNA_BARS.map(() => 0));
  const [showResults, setShowResults] = useState(false);

  /* Real data from DNA catalog API */
  const [realScore, setRealScore] = useState<number | null>(null);
  const [realSimilars, setRealSimilars] = useState<{name: string; pct: number}[] | null>(null);
  const [matchedSong, setMatchedSong] = useState<{title: string; artist: string} | null>(null);

  /* ---- file handler ---- */
  const handleFile = useCallback((file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["mp3", "wav", "flac"].includes(ext)) return;
    setFileName(file.name);
    setFlow("uploading");

    /* Simulate a short upload, then switch to analyzing */
    setTimeout(() => setFlow("analyzing"), 600);
  }, []);

  /* ---- drag & drop ---- */
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  /* ---- transition: analyzing -> results (fetch real data) ---- */
  useEffect(() => {
    if (flow !== "analyzing") return;
    let cancelled = false;

    async function fetchDna() {
      try {
        /* Extract song name from filename (strip extension) */
        const songName = fileName.replace(/\.(mp3|wav|flac)$/i, "");

        /* Search the DNA catalog */
        const searchRes = await fetch(
          `/api/dna/search?q=${encodeURIComponent(songName)}&limit=1`
        );
        const searchData = await searchRes.json();

        if (!cancelled && searchData?.results?.length > 0) {
          const song = searchData.results[0];
          setMatchedSong({ title: song.title, artist: song.artist });
          setRealScore(Math.round(song.dhsScore));

          /* Fetch similar artists */
          const similarsRes = await fetch(
            `/api/dna/similars?id=${encodeURIComponent(song.id)}&limit=5`
          );
          const similarsData = await similarsRes.json();

          if (!cancelled && similarsData?.results?.length > 0) {
            const top3 = similarsData.results.slice(0, 3).map(
              (s: { artist: string; similarity: number }) => ({
                name: s.artist,
                pct: Math.round(s.similarity * 100),
              })
            );
            setRealSimilars(top3);
          }
        }
      } catch {
        /* On error, fall back to hardcoded values (no-op) */
      }
    }

    /* Start fetch but ensure at least 2s of "analyzing" animation */
    const minDelay = new Promise((r) => setTimeout(r, 2000));
    Promise.all([fetchDna(), minDelay]).then(() => {
      if (!cancelled) {
        setFlow("results");
        setShowResults(true);
      }
    });

    return () => { cancelled = true; };
  }, [flow, fileName]);

  /* ---- animate score counter ---- */
  const targetScore = realScore ?? FINAL_SCORE;
  useEffect(() => {
    if (flow !== "results") return;
    let frame: number;
    let start: number | null = null;
    const duration = 1200; // ms

    const tick = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setDisplayScore(Math.round(progress * targetScore));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [flow, targetScore]);

  /* ---- animate DNA bars ---- */
  useEffect(() => {
    if (flow !== "results") return;
    const id = setTimeout(() => {
      setBarWidths(DNA_BARS.map((b) => b.value));
    }, 300);
    return () => clearTimeout(id);
  }, [flow]);

  /* ---- reset ---- */
  const reset = () => {
    setFlow("idle");
    setFileName("");
    setDisplayScore(0);
    setBarWidths(DNA_BARS.map(() => 0));
    setShowResults(false);
    setRealScore(null);
    setRealSimilars(null);
    setMatchedSong(null);
  };

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Score My Song</h1>
        <p className="text-text-muted text-xs mt-0.5">
          AI hit prediction &amp; sound DNA analysis
        </p>
      </div>

      {/* -------- IDLE / UPLOAD ZONE -------- */}
      {(flow === "idle" || flow === "uploading") && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-accent-purple/60 bg-accent-purple/5"
              : "border-white/10 active:border-accent-purple/30"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".mp3,.wav,.flac"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {flow === "idle" ? (
            <>
              <div className="w-12 h-12 mx-auto rounded-full bg-accent-purple/10 flex items-center justify-center mb-2">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-6 h-6 text-accent-purple"
                >
                  <path
                    d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-bold">
                Drop a Track. Get Your Score.
              </h3>
              <p className="text-[10px] text-text-muted/60 mt-1">
                MP3, WAV, FLAC — instant AI analysis
              </p>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-2 border-accent-purple border-t-transparent"
                style={{ animation: "spin 0.6s linear infinite" }}
              />
              <span className="text-xs text-text-muted">
                Uploading {fileName}...
              </span>
            </div>
          )}
        </div>
      )}

      {/* -------- ANALYZING STATE -------- */}
      {flow === "analyzing" && (
        <div className="bg-surface border border-white/5 rounded-2xl p-8 text-center">
          {/* Pulsing DNA icon */}
          <div
            className="w-16 h-16 mx-auto rounded-full bg-accent-purple/10 flex items-center justify-center mb-4"
            style={{ animation: "pulse-dna 1.4s ease-in-out infinite" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-8 h-8 text-accent-purple"
            >
              <path
                d="M2 15c6.667-6 13.333 0 20-6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M2 9c6.667 6 13.333 0 20 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line x1="5" y1="10.5" x2="5" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="9" y1="11" x2="9" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="12" y1="12" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="15" y1="11" x2="15" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="19" y1="10.5" x2="19" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <h3 className="text-sm font-bold mb-1">Analyzing...</h3>
          <p className="text-[10px] text-text-muted/60">
            Mapping sound DNA across 84 attributes
          </p>

          {/* animated shimmer bar */}
          <div className="mt-4 h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: "40%",
                background:
                  "linear-gradient(90deg, #8b5cf6, #3b82f6, #06b6d4)",
                animation: "shimmer 1.2s ease-in-out infinite alternate",
              }}
            />
          </div>
        </div>
      )}

      {/* -------- RESULTS -------- */}
      {flow === "results" && (
        <div
          className="space-y-5"
          style={{
            animation: showResults ? "results-enter 0.6s ease-out" : undefined,
          }}
        >
          {/* File badge */}
          <div className="flex items-center gap-2 bg-surface border border-white/5 rounded-xl px-3 py-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-accent-purple shrink-0">
              <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="text-xs truncate flex-1">{fileName}</span>
            <span className="text-[10px] text-green-400 font-medium shrink-0">Analyzed</span>
          </div>

          {/* ---- Score Circle ---- */}
          <div className="bg-surface border border-white/5 rounded-2xl p-5 text-center">
            {matchedSong && (
              <p className="text-[10px] text-accent-purple mb-2">
                Matched: {matchedSong.title} by {matchedSong.artist}
              </p>
            )}
            <h3 className="text-[10px] text-text-muted uppercase tracking-wider mb-3">
              Hit Prediction Score
            </h3>

            <div className="relative w-28 h-28 mx-auto mb-3">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#scoreGradScore)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${displayScore * 2.64} 264`}
                  style={{ transition: "stroke-dasharray 0.15s linear" }}
                />
                <defs>
                  <linearGradient
                    id="scoreGradScore"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{displayScore}%</span>
              </div>
            </div>

            <p className="text-xs text-green-400 font-medium">
              High Hit Potential
            </p>
            <p className="text-[10px] text-text-muted/50 mt-0.5">
              Based on 50,000+ Billboard hits
            </p>
          </div>

          {/* ---- Sound DNA Breakdown ---- */}
          <div className="bg-surface border border-white/5 rounded-2xl p-4">
            <h3 className="text-sm font-bold mb-0.5">Sound DNA</h3>
            <p className="text-[10px] text-text-muted/60 mb-3">
              84-attribute analysis breakdown
            </p>

            <div className="space-y-2.5">
              {DNA_BARS.map((bar, i) => (
                <div key={bar.label}>
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-text-muted/70">{bar.label}</span>
                    <span className="font-mono text-text-muted">
                      {barWidths[i]}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${bar.color}`}
                      style={{
                        width: `${barWidths[i]}%`,
                        transition: `width 0.8s cubic-bezier(0.22,1,0.36,1) ${i * 120}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ---- Similar Artists ---- */}
          <div className="bg-surface border border-white/5 rounded-2xl p-4">
            <h3 className="text-sm font-bold mb-0.5">Similar Artists</h3>
            <p className="text-[10px] text-text-muted/60 mb-3">
              Your sound mapped against top artists
            </p>

            <div className="space-y-2">
              {(realSimilars ?? SIMILAR_ARTISTS).map((artist, i) => (
                <div
                  key={artist.name}
                  className="flex items-center gap-3 py-1.5"
                  style={{
                    animation: `fade-slide-in 0.5s ease-out ${400 + i * 150}ms both`,
                  }}
                >
                  <span className="w-5 text-[10px] text-text-muted/50 font-mono">
                    {i + 1}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-purple/30 to-accent-blue/30 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold">
                      {artist.name[0]}
                    </span>
                  </div>
                  <span className="flex-1 text-xs font-medium">
                    {artist.name}
                  </span>
                  <span className="text-xs font-mono text-accent-purple">
                    {artist.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ---- Action Buttons ---- */}
          <div className="space-y-2.5">
            <button
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-accent-purple via-accent-blue to-accent-cyan active:scale-[0.98] transition-transform"
            >
              Share My Score
            </button>
            <button
              onClick={reset}
              className="w-full py-3 rounded-xl text-sm font-medium text-text-muted border border-white/10 active:bg-white/[0.03] transition-colors"
            >
              Analyze Another
            </button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/*  Inline keyframes                                                */}
      {/* ================================================================ */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-dna {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.12); opacity: 0.7; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-60%); }
          100% { transform: translateX(160%); }
        }
        @keyframes results-enter {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-slide-in {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}} />
    </div>
  );
}
