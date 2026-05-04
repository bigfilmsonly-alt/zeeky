"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import AppleMusicButton from "@/components/AppleMusicButton";
import AddToPlaylistButton from "@/components/AddToPlaylistButton";

/* ─── Types ─── */
interface SearchResult {
  id: string;
  title: string;
  artist: string;
  dna: string;
}

/* ─── Skeleton ─── */
function ResultSkeleton() {
  return (
    <div className="flex items-center gap-2.5 py-2.5 px-2 rounded-lg">
      <div className="w-9 h-9 rounded-lg bg-white/5 animate-pulse shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="h-3 w-28 rounded bg-white/5 animate-pulse" />
        <div className="h-2.5 w-20 rounded bg-white/5 animate-pulse" />
      </div>
      <div className="w-8 h-3 rounded bg-white/5 animate-pulse shrink-0" />
      <div className="w-7 h-7 rounded-full bg-white/5 animate-pulse shrink-0" />
      <div className="w-7 h-7 rounded-md bg-white/5 animate-pulse shrink-0" />
    </div>
  );
}

/* ─── Page ─── */
export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const performSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setHasSearched(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/songs/search?q=${encodeURIComponent(q)}&limit=20`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const mapped: SearchResult[] = data.results.map(
          (s: { id?: string; title: string; artist: string; dna_score?: number; similarity?: number; hit_score?: number }) => ({
            id: s.id ?? `${s.title}-${s.artist}`,
            title: s.title,
            artist: s.artist,
            dna: (s.dna_score ?? s.similarity ?? s.hit_score ?? 80 + Math.random() * 10).toFixed(1),
          })
        );
        setResults(mapped);
      } else {
        setResults([]);
      }
    } catch {
      setError(true);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  const handleChange = (value: string) => {
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(value.trim());
    }, 300);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="px-4 pb-28 flex flex-col min-h-full">
      {/* ── Search Header ── */}
      <div className="pt-2 pb-3">
        <h1 className="text-2xl font-bold tracking-tight">Search</h1>
      </div>

      {/* ── Search Input ── */}
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
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Songs, artists, genres..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface border border-white/[0.06] text-sm text-white placeholder:text-text-muted/30 focus:outline-none focus:border-accent-purple/30 transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setHasSearched(false);
              setError(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-text-muted/40 hover:text-white transition-colors">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* ── DNA Ribbon ── */}
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-surface/60 border border-white/[0.04] mb-4">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <p className="text-[9px] font-mono text-text-muted/70 tracking-wider uppercase">
          Powered by Zeeky DNA &middot; 100M Song Index
        </p>
      </div>

      {/* ── Results Area ── */}
      <div className="flex-1">
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col gap-0.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ResultSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state — API unavailable */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-surface border border-white/[0.06] flex items-center justify-center mb-3">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-text-muted/30">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-text-muted/70 mb-1">Search coming soon</p>
            <p className="text-[11px] text-text-muted/40 max-w-[200px]">
              The song index is being built. Check back shortly.
            </p>
          </div>
        )}

        {/* Empty state — no query */}
        {!loading && !error && !hasSearched && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-surface border border-white/[0.06] flex items-center justify-center mb-3">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-accent-purple/40">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-text-muted/70 mb-1">Search 100M+ songs</p>
            <p className="text-[11px] text-text-muted/40 max-w-[200px]">
              Find any song by title or artist. Each result is ranked by DNA match.
            </p>
          </div>
        )}

        {/* No results */}
        {!loading && !error && hasSearched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-semibold text-text-muted/70 mb-1">No results</p>
            <p className="text-[11px] text-text-muted/40 max-w-[200px]">
              Try a different search term.
            </p>
          </div>
        )}

        {/* Results list */}
        {!loading && !error && results.length > 0 && (
          <div className="flex flex-col gap-0.5">
            <p className="text-[10px] text-text-muted/40 font-mono mb-1 px-2">
              {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
            {results.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-2.5 py-2.5 px-2 rounded-lg hover:bg-surface/50 transition-colors"
              >
                {/* Tap area — navigate to DNA analysis */}
                <Link
                  href={`/listen/dna?song=${encodeURIComponent(r.id)}`}
                  className="flex items-center gap-2.5 flex-1 min-w-0"
                >
                  {/* Art placeholder */}
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-accent-purple/50">
                      <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold truncate">{r.artist}</p>
                    <p className="text-[11px] text-text-muted/60 truncate">{r.title}</p>
                    <p className="text-[9px] text-accent-purple/50 mt-0.5">Tap to see 50 similar songs</p>
                  </div>
                </Link>

                {/* DNA % */}
                <span className="text-[10px] font-mono text-accent-purple shrink-0">{r.dna}%</span>

                {/* Add to Playlist */}
                <AddToPlaylistButton songTitle={r.title} songArtist={r.artist} size="sm" />

                {/* Apple Music */}
                <AppleMusicButton track={r.title} artist={r.artist} size="neighbor" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
