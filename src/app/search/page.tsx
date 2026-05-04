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
  dhsScore: number;
  energyTotal: number;
  energyNorm: number;
  appleId?: number;
}

interface SimilarSong {
  id: number;
  artist: string;
  title: string;
  year: number;
  genre: string;
  peak: number;
  similarity: number;
  dhsScore: number;
  appleId?: number;
}

interface SimilarsResponse {
  song: SearchResult;
  similars: SimilarSong[];
}

interface Genre {
  genre: string;
  count: number;
}

function applePreviewUrl(appleId: number) {
  return `https://music.apple.com/song/${appleId}`;
}

function appleCoverUrl(appleId: number) {
  return `https://is1-ssl.mzstatic.com/image/thumb/Music/${appleId}/100x100bb.jpg`;
}

function PlayButton({
  appleId,
  playing,
  onPlay,
  size = "md",
}: {
  appleId?: number;
  playing: number | null;
  onPlay: (id: number | null) => void;
  size?: "sm" | "md";
}) {
  if (!appleId) return null;
  const isPlaying = playing === appleId;
  const sz = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onPlay(isPlaying ? null : appleId);
      }}
      className={`${sz} rounded-lg bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 flex items-center justify-center shrink-0 hover:from-accent-purple/40 hover:to-accent-blue/40 transition-all`}
    >
      {isPlaying ? (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-accent-purple">
          <rect x="6" y="4" width="4" height="16" fill="currentColor" rx="1" />
          <rect x="14" y="4" width="4" height="16" fill="currentColor" rx="1" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-accent-purple">
          <polygon points="6,4 20,12 6,20" fill="currentColor" />
        </svg>
      )}
    </button>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SimilarsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [genreSongs, setGenreSongs] = useState<SearchResult[]>([]);
  const [playing, setPlaying] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Load genres on mount
  useEffect(() => {
    fetch("/api/dna/genres")
      .then((r) => r.json())
      .then((data: Genre[]) => setGenres(data.slice(0, 15)))
      .catch(() => {});
  }, []);

  // Handle audio playback
  useEffect(() => {
    if (!playing) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    // Use iTunes preview API
    fetch(
      `https://itunes.apple.com/lookup?id=${playing}&entity=song`
    )
      .then((r) => r.json())
      .then((data) => {
        const track = data.results?.find(
          (r: Record<string, unknown>) => r.wrapperType === "track"
        );
        if (track?.previewUrl) {
          const audio = new Audio(track.previewUrl);
          audio.volume = 0.7;
          audio.play().catch(() => {});
          audio.onended = () => setPlaying(null);
          audioRef.current = audio;
        }
      })
      .catch(() => setPlaying(null));
  }, [playing]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(
        `/api/dna/search?q=${encodeURIComponent(q)}&limit=30`
      );
      setResults(await res.json());
    } catch {
      setResults([]);
    }
    setSearchLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  const selectSong = async (song: { id: number }) => {
    setLoading(true);
    setSelected(null);
    try {
      const res = await fetch(`/api/dna/similars?id=${song.id}`);
      setSelected(await res.json());
    } catch {}
    setLoading(false);
  };

  const loadGenre = async (genre: string) => {
    setActiveGenre(genre);
    setSelected(null);
    setQuery("");
    setResults([]);
    try {
      const res = await fetch(
        `/api/dna/genres?genre=${encodeURIComponent(genre)}&limit=50`
      );
      setGenreSongs(await res.json());
    } catch {
      setGenreSongs([]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Now Playing bar */}
      <AnimatePresence>
        {playing && (
          <motion.div
            initial={{ y: 60 }}
            animate={{ y: 0 }}
            exit={{ y: 60 }}
            className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-xl border-t border-white/10 px-6 py-3 z-50 flex items-center gap-4"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-0.5 bg-accent-purple rounded-full"
                  animate={{ height: [8, 16, 8] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-text-muted">
              Playing Apple Music preview...
            </span>
            <button
              onClick={() => setPlaying(null)}
              className="ml-auto text-xs text-text-muted hover:text-white transition-colors"
            >
              Stop
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-white/5 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="gradient-text font-bold text-xl tracking-wider"
          >
            ZEEKY
          </Link>
          <span className="text-text-muted text-sm">DNA Song Search</span>
          <span className="ml-auto text-xs text-text-muted/50">
            9,914 Billboard songs &middot; 8,682 with Apple Music
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Search */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">DNA Song Search</span>
          </h1>
          <p className="text-text-muted max-w-2xl mx-auto mb-8">
            Search any artist or song. DNA technology finds the 50 most similar
            tracks. Click play to preview on Apple Music.
          </p>

          <div className="relative max-w-xl mx-auto">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
            >
              <circle
                cx="11"
                cy="11"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M21 21l-4.35-4.35"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveGenre(null);
              }}
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

        {/* Genre pills */}
        {!selected && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {genres.map((g) => (
              <button
                key={g.genre}
                onClick={() => loadGenre(g.genre)}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                  activeGenre === g.genre
                    ? "bg-accent-purple text-white"
                    : "bg-white/5 text-text-muted hover:bg-white/10"
                }`}
              >
                {g.genre}
                <span className="text-xs ml-1 opacity-50">
                  {g.count.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Genre songs */}
        <AnimatePresence mode="wait">
          {activeGenre && !selected && genreSongs.length > 0 && (
            <motion.div
              key={`genre-${activeGenre}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-12"
            >
              <h2 className="text-lg font-bold mb-4">
                Top {activeGenre} Songs
                <span className="text-sm text-text-muted font-normal ml-2">
                  by Billboard rank
                </span>
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {genreSongs.map((song, i) => (
                  <motion.button
                    key={song.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => selectSong(song)}
                    className="text-left bg-surface border border-white/5 rounded-xl p-3 flex items-center gap-3 hover:border-accent-purple/30 transition-colors group"
                  >
                    <PlayButton
                      appleId={song.appleId}
                      playing={playing}
                      onPlay={setPlaying}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {song.title}
                      </div>
                      <div className="text-xs text-text-muted truncate">
                        {song.artist}
                      </div>
                    </div>
                    <div className="text-xs text-text-muted/50">{song.year}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Results */}
        <AnimatePresence mode="wait">
          {!selected && !activeGenre && results.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto mb-12"
            >
              <h2 className="text-sm text-text-muted mb-3 uppercase tracking-wider">
                Select a song to find 50 similar tracks
              </h2>
              <div className="space-y-2">
                {results.map((song, i) => (
                  <motion.button
                    key={song.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => selectSong(song)}
                    className="w-full text-left bg-surface border border-white/5 rounded-xl p-4 flex items-center gap-3 hover:border-accent-purple/30 transition-colors group"
                  >
                    <PlayButton
                      appleId={song.appleId}
                      playing={playing}
                      onPlay={setPlaying}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{song.title}</div>
                      <div className="text-sm text-text-muted truncate">
                        {song.artist}
                      </div>
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
                      <path
                        d="M9 18l6-6-6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
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
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
            <span className="text-text-muted">
              Analyzing DNA proximity...
            </span>
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
                <button
                  onClick={() => setSelected(null)}
                  className="text-sm text-text-muted hover:text-foreground transition-colors flex items-center gap-1 mb-4"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-4 h-4"
                  >
                    <path
                      d="M15 18l-6-6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Back
                </button>
                <div className="flex items-center gap-6 flex-wrap">
                  <PlayButton
                    appleId={selected.song.appleId}
                    playing={playing}
                    onPlay={setPlaying}
                  />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold">
                      {selected.song.title}
                    </h2>
                    <p className="text-text-muted">{selected.song.artist}</p>
                    <div className="flex gap-3 mt-2 text-xs text-text-muted/60">
                      <span>{selected.song.year}</span>
                      <span>{selected.song.genre.split(",")[0]}</span>
                      <span>Peak #{selected.song.peak}</span>
                      <span>{selected.song.weeks} weeks</span>
                    </div>
                  </div>
                  {/* DHS Patent Score */}
                  <div className="flex gap-4 shrink-0">
                    <div className="text-center">
                      <div className="text-xs text-text-muted/60 uppercase tracking-wider mb-1">DHS Score</div>
                      <div className={`text-2xl font-bold font-mono ${
                        selected.song.dhsScore >= 45 ? "text-green-400" :
                        selected.song.dhsScore >= 30 ? "gradient-text" : "text-accent-blue"
                      }`}>
                        {selected.song.dhsScore.toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-text-muted/60 uppercase tracking-wider mb-1">Energy</div>
                      <div className="text-2xl font-bold font-mono text-accent-cyan">
                        {selected.song.energyNorm.toFixed(0)}
                      </div>
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
                        <th className="px-4 py-3 text-left text-text-muted font-medium w-12">
                          #
                        </th>
                        <th className="px-2 py-3 w-10" />
                        <th className="px-4 py-3 text-left text-text-muted font-medium">
                          Song
                        </th>
                        <th className="px-4 py-3 text-left text-text-muted font-medium hidden md:table-cell">
                          Genre
                        </th>
                        <th className="px-4 py-3 text-left text-text-muted font-medium hidden sm:table-cell">
                          Year
                        </th>
                        <th className="px-4 py-3 text-right text-text-muted font-medium hidden sm:table-cell">
                          DHS
                        </th>
                        <th className="px-4 py-3 text-right text-text-muted font-medium">
                          DNA Match
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.similars.map((sim, i) => (
                        <motion.tr
                          key={sim.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.015 }}
                          className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                          onClick={() => {
                            selectSong(sim);
                            window.scrollTo({
                              top: 0,
                              behavior: "smooth",
                            });
                          }}
                        >
                          <td className="px-4 py-3 text-text-muted font-mono">
                            {i + 1}
                          </td>
                          <td className="px-2 py-3">
                            <PlayButton
                              appleId={sim.appleId}
                              playing={playing}
                              onPlay={setPlaying}
                              size="sm"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{sim.title}</div>
                            <div className="text-text-muted text-xs">
                              {sim.artist}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-text-muted hidden md:table-cell">
                            {sim.genre.split(",")[0]}
                          </td>
                          <td className="px-4 py-3 text-text-muted hidden sm:table-cell">
                            {sim.year}
                          </td>
                          <td className="px-4 py-3 text-right hidden sm:table-cell">
                            <span className={`font-mono text-xs ${
                              sim.dhsScore >= 45 ? "text-green-400" :
                              sim.dhsScore >= 30 ? "text-accent-purple" : "text-text-muted"
                            }`}>
                              {sim.dhsScore.toFixed(1)}
                            </span>
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
        {!selected &&
          !loading &&
          !activeGenre &&
          results.length === 0 &&
          query.length >= 2 &&
          !searchLoading && (
            <div className="text-center py-20 text-text-muted">
              No songs found for &quot;{query}&quot;
            </div>
          )}

        {/* Initial state */}
        {!selected && !loading && !activeGenre && query.length < 2 && (
          <div className="text-center py-8">
            <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { label: "Songs Analyzed", value: "9,914" },
                { label: "Apple Music Playback", value: "8,682" },
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
