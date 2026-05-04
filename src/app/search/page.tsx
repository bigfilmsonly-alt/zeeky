"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface SearchResult {
  id: number;
  artist: string;
  title: string;
  year: number;
  genre: string;
  peak: number;
  weeks: number;
  rank: number;
}

interface SimilarSong {
  id: number;
  artist: string;
  title: string;
  year: number;
  genre: string;
  peak: number;
  similarity: number;
}

interface SimilarsResponse {
  song: SearchResult;
  similars: SimilarSong[];
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SimilarsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/dna/search?q=${encodeURIComponent(q)}&limit=20`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    }
    setSearchLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  const selectSong = async (song: SearchResult) => {
    setLoading(true);
    setSelected(null);
    try {
      const res = await fetch(`/api/dna/similars?id=${song.id}`);
      const data: SimilarsResponse = await res.json();
      setSelected(data);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/5 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="gradient-text font-bold text-xl tracking-wider">
            ZEEKY
          </Link>
          <span className="text-text-muted text-sm">DNA Song Search</span>
          <span className="ml-auto text-xs text-text-muted/50">
            9,914 Billboard songs analyzed
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Search */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">DNA Song Search</span>
          </h1>
          <p className="text-text-muted max-w-2xl mx-auto mb-8">
            Search any song from the Billboard catalog. DNA technology finds the
            50 most similar songs ranked by audio proximity in Hilbert space.
          </p>

          <div className="relative max-w-xl mx-auto">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
            >
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by artist or song title..."
              className="w-full bg-surface border border-white/10 rounded-xl pl-12 pr-4 py-4 text-lg placeholder:text-text-muted/40 focus:outline-none focus:border-accent-purple/50 transition-colors"
              autoFocus
            />
            {searchLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        <AnimatePresence mode="wait">
          {!selected && results.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto mb-12"
            >
              <h2 className="text-sm text-text-muted mb-3 uppercase tracking-wider">
                Select a song to find similar tracks
              </h2>
              <div className="space-y-2">
                {results.map((song, i) => (
                  <motion.button
                    key={song.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => selectSong(song)}
                    className="w-full text-left bg-surface border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:border-accent-purple/30 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-accent-purple">
                        <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{song.title}</div>
                      <div className="text-sm text-text-muted truncate">{song.artist}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-text-muted">{song.year}</div>
                      <div className="text-xs text-text-muted/60">
                        {song.genre.split(",")[0]}
                      </div>
                    </div>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="w-4 h-4 text-text-muted/30 group-hover:text-accent-purple transition-colors shrink-0"
                    >
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-20">
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-accent-purple rounded-full"
                  animate={{ height: [12, 32, 12] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
            <span className="text-text-muted">Analyzing DNA proximity...</span>
          </div>
        )}

        {/* Similar Songs Results */}
        <AnimatePresence>
          {selected && (
            <motion.div
              key="similars"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Selected song header */}
              <div className="bg-surface border border-white/5 rounded-2xl p-6 md:p-8 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setSelected(null)}
                    className="text-sm text-text-muted hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back to search
                  </button>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-accent-purple/30 to-accent-blue/30 border border-white/10 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-accent-purple">
                      <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selected.song.title}</h2>
                    <p className="text-text-muted">{selected.song.artist}</p>
                    <div className="flex gap-3 mt-2 text-xs text-text-muted/60">
                      <span>{selected.song.year}</span>
                      <span>{selected.song.genre.split(",")[0]}</span>
                      <span>Peak #{selected.song.peak}</span>
                      <span>{selected.song.weeks} weeks on chart</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 50 Similar Songs */}
              <h3 className="text-lg font-bold mb-4">
                <span className="gradient-text">50 Most Similar Songs</span>
                <span className="text-sm text-text-muted font-normal ml-2">
                  by DNA audio proximity
                </span>
              </h3>

              <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3 text-left text-text-muted font-medium w-12">#</th>
                        <th className="px-4 py-3 text-left text-text-muted font-medium">Song</th>
                        <th className="px-4 py-3 text-left text-text-muted font-medium hidden md:table-cell">Genre</th>
                        <th className="px-4 py-3 text-left text-text-muted font-medium hidden sm:table-cell">Year</th>
                        <th className="px-4 py-3 text-left text-text-muted font-medium hidden sm:table-cell">Peak</th>
                        <th className="px-4 py-3 text-right text-text-muted font-medium">DNA Match</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.similars.map((sim, i) => (
                        <motion.tr
                          key={sim.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                          onClick={() => {
                            selectSong({
                              id: sim.id,
                              artist: sim.artist,
                              title: sim.title,
                              year: sim.year,
                              genre: sim.genre,
                              peak: sim.peak,
                              weeks: 0,
                              rank: 0,
                            });
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          <td className="px-4 py-3 text-text-muted font-mono">
                            {i + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{sim.title}</div>
                            <div className="text-text-muted text-xs">{sim.artist}</div>
                          </td>
                          <td className="px-4 py-3 text-text-muted hidden md:table-cell">
                            {sim.genre.split(",")[0]}
                          </td>
                          <td className="px-4 py-3 text-text-muted hidden sm:table-cell">
                            {sim.year}
                          </td>
                          <td className="px-4 py-3 text-text-muted hidden sm:table-cell">
                            #{sim.peak}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`font-mono font-medium ${
                                sim.similarity >= 99.8
                                  ? "text-green-400"
                                  : sim.similarity >= 99.5
                                    ? "text-accent-purple"
                                    : "text-accent-blue"
                              }`}
                            >
                              {sim.similarity}%
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!selected && !loading && results.length === 0 && query.length >= 2 && !searchLoading && (
          <div className="text-center py-20 text-text-muted">
            No songs found for &quot;{query}&quot;
          </div>
        )}

        {/* Initial state */}
        {!selected && !loading && query.length < 2 && (
          <div className="text-center py-12">
            <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { label: "Songs Analyzed", value: "9,914" },
                { label: "DNA Features", value: "80" },
                { label: "Similars Per Song", value: "50" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-surface border border-white/5 rounded-2xl p-6"
                >
                  <div className="text-3xl font-bold gradient-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
