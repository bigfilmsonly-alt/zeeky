"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePlayer } from "@/lib/player-context";

interface ChainTrack {
  id: number;
  title: string;
  artist: string;
  similarity: string; // "Seed" for first, "XX.XX%" for rest
  genre: string;
  dhsScore: number;
  appleId?: number;
}

interface SearchResult {
  id: number;
  artist: string;
  title: string;
  year: number;
  genre: string;
  dhsScore: number;
  appleId?: number;
}

interface SavedPlaylist {
  id: string;
  name: string;
  tracks: ChainTrack[];
  createdAt: string;
}

const SEED_QUERIES = ["drake", "future", "kendrick", "rihanna", "weeknd", "travis", "post malone", "dua lipa"];

export default function DiscoverPage() {
  const [chain, setChain] = useState<ChainTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNext, setIsFetchingNext] = useState(false);

  // Search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Save Playlist state
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");

  // Pull-to-refresh state
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { play, togglePlayPause } = usePlayer();

  const currentTrack = chain[currentIndex] ?? null;
  const nextTrack = currentIndex < chain.length - 1 ? chain[currentIndex + 1] : null;
  const chainSoFar = chain.slice(0, currentIndex + 1);

  // Fetch seed and start chain on mount
  useEffect(() => {
    startChainFromSearch("Scarface");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Progress ring animation
  useEffect(() => {
    if (!isSpinning) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 0.5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isSpinning]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/dna/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
        if (res.ok) {
          const data: SearchResult[] = await res.json();
          setSearchResults(data);
        }
      } catch {
        // Silently fail
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery]);

  const startChainFromSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setChain([]);
    setCurrentIndex(0);
    setProgress(0);
    try {
      const searchRes = await fetch(`/api/dna/search?q=${encodeURIComponent(query)}&limit=1`);
      if (!searchRes.ok) return;
      const searchData: SearchResult[] = await searchRes.json();
      if (searchData.length === 0) return;

      const seed = searchData[0];
      const seedTrack: ChainTrack = {
        id: seed.id,
        title: seed.title,
        artist: seed.artist,
        similarity: "Seed",
        genre: seed.genre,
        dhsScore: seed.dhsScore,
        appleId: seed.appleId,
      };

      // Fetch similars for seed
      const simRes = await fetch(`/api/dna/similars?id=${seed.id}&limit=50`);
      if (!simRes.ok) {
        setChain([seedTrack]);
        setIsSpinning(true);
        setIsLoading(false);
        return;
      }
      const simData = await simRes.json();
      const similars: { id: number; artist: string; title: string; similarity: number; genre: string; dhsScore: number; appleId?: number }[] = simData.similars;

      if (similars.length > 0) {
        const top = similars[0];
        const nextChainTrack: ChainTrack = {
          id: top.id,
          title: top.title,
          artist: top.artist,
          similarity: `${top.similarity.toFixed(2)}%`,
          genre: top.genre,
          dhsScore: top.dhsScore,
          appleId: top.appleId,
        };
        setChain([seedTrack, nextChainTrack]);
      } else {
        setChain([seedTrack]);
      }

      setIsSpinning(true);
      play({ id: String(seed.id), title: seed.title, artist: seed.artist });
    } catch {
      // Network error — do nothing
    } finally {
      setIsLoading(false);
    }
  }, [play]);

  const fetchNextForTrack = useCallback(async (trackId: number, existingIds: Set<number>) => {
    setIsFetchingNext(true);
    try {
      const res = await fetch(`/api/dna/similars?id=${trackId}&limit=50`);
      if (!res.ok) return null;
      const data = await res.json();
      const similars: { id: number; artist: string; title: string; similarity: number; genre: string; dhsScore: number; appleId?: number }[] = data.similars;

      // Pick the top neighbor not already in chain
      const next = similars.find((s) => !existingIds.has(s.id));
      if (!next) return null;

      return {
        id: next.id,
        title: next.title,
        artist: next.artist,
        similarity: `${next.similarity.toFixed(2)}%`,
        genre: next.genre,
        dhsScore: next.dhsScore,
        appleId: next.appleId,
      } as ChainTrack;
    } catch {
      return null;
    } finally {
      setIsFetchingNext(false);
    }
  }, []);

  const handleSkip = useCallback(async () => {
    if (currentIndex >= chain.length - 1) return;

    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    setProgress(0);

    const nextT = chain[nextIdx];
    play({ id: String(nextT.id), title: nextT.title, artist: nextT.artist });

    // Fetch a new track to append (infinite chaining)
    const existingIds = new Set(chain.map((t) => t.id));
    const newTrack = await fetchNextForTrack(nextT.id, existingIds);
    if (newTrack) {
      setChain((prev) => [...prev, newTrack]);
    }
  }, [currentIndex, chain, play, fetchNextForTrack]);

  const handlePlayPause = () => {
    setIsSpinning(!isSpinning);
    togglePlayPause();
  };

  const handleNewSeed = () => {
    setShowSearch(true);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSelectSeed = (result: SearchResult) => {
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
    startChainFromSearch(result.title);
  };

  // Save Playlist handler
  const handleSavePlaylist = useCallback(() => {
    if (chain.length === 0 || saveState === "saved") return;

    const seedTrack = chain[0];
    const playlist: SavedPlaylist = {
      id: crypto.randomUUID(),
      name: `DJ Chain - ${seedTrack.title}`,
      tracks: [...chain],
      createdAt: new Date().toISOString(),
    };

    const existing: SavedPlaylist[] = JSON.parse(
      localStorage.getItem("zeeky_playlists") || "[]"
    );
    existing.push(playlist);
    localStorage.setItem("zeeky_playlists", JSON.stringify(existing));

    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2000);
  }, [chain, saveState]);

  // Pull-to-refresh handlers
  const handlePullRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const randomQuery = SEED_QUERIES[Math.floor(Math.random() * SEED_QUERIES.length)];
      const res = await fetch(`/api/dna/search?q=${encodeURIComponent(randomQuery)}&limit=50`);
      if (res.ok) {
        const data: SearchResult[] = await res.json();
        if (data.length > 0) {
          const randomSeed = data[Math.floor(Math.random() * data.length)];
          await startChainFromSearch(randomSeed.title);
        }
      }
    } catch {
      // Silently fail
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
      setIsPulling(false);
    }
  }, [startChainFromSearch]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isRefreshing) return;
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;

    if (diff > 0) {
      setIsPulling(true);
      setPullDistance(Math.min(diff, 120));
    }
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(() => {
    if (isRefreshing) return;
    if (pullDistance > 60) {
      handlePullRefresh();
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  }, [pullDistance, isRefreshing, handlePullRefresh]);

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (isLoading && chain.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold gradient-text">DJ Mode</h1>
          <p className="text-text-muted text-[10px] mt-0.5">Auto-discovering your next favorite song</p>
        </div>
        <div className="bg-surface border border-white/5 rounded-2xl p-8 flex flex-col items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse" />
          <p className="text-[11px] text-text-muted">Loading seed track...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="space-y-4"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div
          className="flex items-center justify-center gap-2 transition-all duration-200 overflow-hidden"
          style={{ height: isRefreshing ? 36 : Math.min(pullDistance * 0.5, 36) }}
        >
          {isRefreshing ? (
            <>
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-[11px] text-purple-400 font-medium">Shuffling...</span>
            </>
          ) : pullDistance > 60 ? (
            <span className="text-[11px] text-text-muted">Release to refresh</span>
          ) : (
            <span className="text-[11px] text-text-muted/50">Pull down to refresh</span>
          )}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold gradient-text">DJ Mode</h1>
        <p className="text-text-muted text-[10px] mt-0.5">Auto-discovering your next favorite song</p>
      </div>

      {/* Search Overlay */}
      {showSearch && (
        <div className="bg-surface border border-white/5 rounded-2xl p-3.5">
          <div className="flex items-center gap-2 mb-2.5">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a seed song..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-white placeholder:text-text-muted/50 outline-none focus:border-purple-500/50"
            />
            <button
              onClick={() => setShowSearch(false)}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-text-muted"
            >
              Cancel
            </button>
          </div>
          {isSearching && (
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-[10px] text-text-muted">Searching...</span>
            </div>
          )}
          {searchResults.length > 0 && (
            <div className="space-y-0.5 max-h-52 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectSeed(result)}
                  className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500/15 to-blue-500/15 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-purple-400">
                      <circle cx="12" cy="12" r="10" opacity="0.3" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-medium text-white truncate">{result.title}</h4>
                    <p className="text-[9px] text-text-muted truncate">{result.artist}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5">
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/5 text-text-muted/60">{result.genre.split(",")[0]}</span>
                    <span className="text-[9px] font-mono text-blue-400">Hit: {result.dhsScore}%</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          {searchQuery && !isSearching && searchResults.length === 0 && (
            <p className="text-[10px] text-text-muted/50 px-2 py-1.5">No results found</p>
          )}
        </div>
      )}

      {/* Now Playing Card */}
      {currentTrack && (
        <div className="bg-surface border border-white/5 rounded-2xl p-4 relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 pointer-events-none" />

          <div className="relative flex flex-col items-center">
            {/* Vinyl / Progress Ring */}
            <div className="relative w-28 h-28 mb-3">
              {/* Outer ring (progress) */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="4"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-100"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9b51e0" />
                    <stop offset="100%" stopColor="#4a90e2" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Inner vinyl disc */}
              <div
                className={`absolute inset-3 rounded-full bg-gradient-to-br from-gray-900 to-black border border-white/10 flex items-center justify-center ${
                  isSpinning ? "animate-spin" : ""
                }`}
                style={{ animationDuration: "3s" }}
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500/40 to-blue-500/40 border border-white/10" />
                {/* Vinyl grooves */}
                <div className="absolute inset-2 rounded-full border border-white/[0.03]" />
                <div className="absolute inset-4 rounded-full border border-white/[0.03]" />
                <div className="absolute inset-6 rounded-full border border-white/[0.03]" />
              </div>
            </div>

            {/* Track info */}
            <h2 className="text-sm font-bold text-white">{currentTrack.title}</h2>
            <p className="text-[11px] text-text-muted mt-0.5">{currentTrack.artist}</p>

            {/* Genre + Hit Score */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-text-muted/70">
                {currentTrack.genre.split(",")[0]}
              </span>
              <span className="text-[9px] font-mono text-blue-400">Hit: {currentTrack.dhsScore}%</span>
              {currentTrack.appleId && (
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
                  Preview available
                </span>
              )}
            </div>

            {/* DNA Match badge */}
            {currentIndex > 0 && (
              <div className="mt-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
                <span className="text-[10px] text-text-muted">DNA Match: </span>
                <span className="text-[10px] font-mono text-green-400">{currentTrack.similarity}</span>
                <span className="text-[10px] text-text-muted"> from previous</span>
              </div>
            )}
            {currentIndex === 0 && (
              <div className="mt-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                <span className="text-[10px] font-medium text-purple-400">Seed Track</span>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={handlePlayPause}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-transform"
              >
                {isSpinning ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white ml-0.5">
                    <polygon points="6,4 20,12 6,20" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleSkip}
                disabled={!nextTrack || isFetchingNext}
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-[11px] font-medium text-white active:scale-95 transition-transform disabled:opacity-30"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator for fetching next */}
      {isFetchingNext && (
        <div className="flex items-center justify-center gap-2 py-1">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-[10px] text-text-muted">Finding next match...</span>
        </div>
      )}

      {/* Up Next Preview */}
      {nextTrack && (
        <div className="bg-surface border border-white/5 rounded-xl p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/15 to-blue-500/15 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-purple-400">
                <path d="M5 3l14 9-14 9V3z" fill="currentColor" opacity="0.6" />
                <path d="M19 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-text-muted/60 uppercase tracking-wide font-medium">Up Next</p>
              <h4 className="text-xs font-medium text-white truncate">{nextTrack.title}</h4>
              <p className="text-[10px] text-text-muted truncate">{nextTrack.artist}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px] font-mono text-green-400">{nextTrack.similarity}</div>
              <div className="text-[9px] text-text-muted/50">match</div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1.5 pl-11.5">
            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/5 text-text-muted/60">{nextTrack.genre.split(",")[0]}</span>
            <span className="text-[9px] font-mono text-blue-400/70">Hit: {nextTrack.dhsScore}%</span>
            {nextTrack.appleId && (
              <span className="text-[8px] text-green-400/60">Preview available</span>
            )}
          </div>
        </div>
      )}

      {/* DJ Chain */}
      <div className="bg-surface border border-white/5 rounded-2xl p-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <h3 className="text-sm font-bold">DJ Chain</h3>
            <p className="text-[10px] text-text-muted/60">{chainSoFar.length} track{chainSoFar.length !== 1 ? "s" : ""} discovered</p>
          </div>
          <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
            <span className="text-[9px] font-mono text-text-muted">{chain.length} total</span>
          </div>
        </div>

        <div className="space-y-1">
          {chainSoFar.map((track, i) => {
            const isCurrent = i === currentIndex;
            return (
              <div
                key={track.id}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
                  isCurrent
                    ? "bg-purple-500/10 border border-purple-500/20"
                    : "border border-transparent"
                }`}
              >
                {/* Index number */}
                <div className="w-4 text-center">
                  {isCurrent ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mx-auto animate-pulse" />
                  ) : (
                    <span className="text-[10px] font-mono text-text-muted/40">{i + 1}</span>
                  )}
                </div>

                {/* Connector line */}
                <div className="w-3 flex flex-col items-center">
                  {i > 0 && <div className="w-px h-1 bg-white/10" />}
                  <div className={`w-1.5 h-1.5 rounded-full ${isCurrent ? "bg-purple-400" : "bg-white/20"}`} />
                </div>

                {/* Track info */}
                <div className="flex-1 min-w-0">
                  <h4 className={`text-[11px] font-medium truncate ${isCurrent ? "text-white" : "text-white/70"}`}>
                    {track.title}
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[9px] text-text-muted/50 truncate">{track.artist}</p>
                    <span className="text-[8px] px-1 py-0 rounded bg-white/5 text-text-muted/40">{track.genre.split(",")[0]}</span>
                    <span className="text-[8px] font-mono text-blue-400/50">Hit: {track.dhsScore}%</span>
                  </div>
                </div>

                {/* Proximity badge */}
                <div className="shrink-0">
                  {track.similarity === "Seed" ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-medium">
                      Seed
                    </span>
                  ) : (
                    <span className={`text-[10px] font-mono ${
                      parseFloat(track.similarity) > 85 ? "text-green-400" : "text-blue-400"
                    }`}>
                      {track.similarity}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Future tracks indicator */}
          {currentIndex < chain.length - 1 && (
            <div className="flex items-center gap-2 px-2 py-1 opacity-40">
              <div className="w-4" />
              <div className="w-3 flex flex-col items-center">
                <div className="w-px h-1 bg-white/10" />
                <div className="w-1 h-1 rounded-full bg-white/20" />
              </div>
              <p className="text-[9px] text-text-muted/50 italic">
                {chain.length - currentIndex - 1} more track{chain.length - currentIndex - 1 !== 1 ? "s" : ""} waiting to be discovered...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex gap-2.5">
        <button
          onClick={handleNewSeed}
          className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-medium text-white active:scale-[0.98] transition-transform"
        >
          New Seed
        </button>
        <button
          onClick={handleSavePlaylist}
          className={`flex-1 py-2.5 rounded-xl text-[11px] font-medium text-white active:scale-[0.98] transition-all ${
            saveState === "saved"
              ? "bg-green-600"
              : "bg-gradient-to-r from-purple-600 to-blue-600"
          }`}
        >
          {saveState === "saved" ? "\u2713 Saved!" : "Save Playlist"}
        </button>
      </div>
    </div>
  );
}
