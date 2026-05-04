"use client";

import { useState, useEffect } from "react";
import { usePlayer } from "@/lib/player-context";

interface ChainTrack {
  id: string;
  title: string;
  artist: string;
  proximity: string;
  previewUrl?: string;
}

const djChain: ChainTrack[] = [
  { id: "1", title: "Scarface", artist: "Zeeky", proximity: "Seed", previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/5a/05/4b/5a054b79-2d3c-3a3e-8a37-6aa6f0e3b5a0/mzaf_17541920244498498928.plus.aac.p.m4a" },
  { id: "2", title: "Pull Up Wit Ah Stick", artist: "SahBabii", proximity: "89.12%", previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/73/1c/1f/731c1f7e-5b3e-d8a6-7c1b-5e1c7a6c3a6b/mzaf_11953084064498498928.plus.aac.p.m4a" },
  { id: "3", title: "Patek Water", artist: "Future ft Young Thug", proximity: "87.45%" },
  { id: "4", title: "Having Our Way", artist: "Migos ft Drake", proximity: "85.86%" },
  { id: "5", title: "Said Sum", artist: "Moneybagg Yo", proximity: "84.20%" },
  { id: "6", title: "What Happened To Virgil", artist: "Lil Durk ft Gunna", proximity: "83.10%" },
  { id: "7", title: "Wunna", artist: "Gunna ft Young Thug", proximity: "81.75%" },
  { id: "8", title: "Golden Child", artist: "Lil Durk", proximity: "80.30%" },
  { id: "9", title: "Lifestyle", artist: "Rich Gang ft Young Thug", proximity: "79.55%" },
  { id: "10", title: "Hot", artist: "Young Thug ft Gunna", proximity: "78.90%" },
];

export default function DiscoverPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(true);
  const [progress, setProgress] = useState(0);
  const { play, togglePlayPause, isPlaying } = usePlayer();

  const currentTrack = djChain[currentIndex];
  const nextTrack = currentIndex < djChain.length - 1 ? djChain[currentIndex + 1] : null;
  const chainSoFar = djChain.slice(0, currentIndex + 1);

  // Simulate progress ring animation
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

  const handleSkip = () => {
    if (currentIndex < djChain.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
      const next = djChain[currentIndex + 1];
      play({ id: next.id, title: next.title, artist: next.artist, previewUrl: next.previewUrl });
    }
  };

  const handlePlayPause = () => {
    setIsSpinning(!isSpinning);
    togglePlayPause();
  };

  const handleNewSeed = () => {
    setCurrentIndex(0);
    setProgress(0);
    setIsSpinning(true);
    const seed = djChain[0];
    play({ id: seed.id, title: seed.title, artist: seed.artist, previewUrl: seed.previewUrl });
  };

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold gradient-text">DJ Mode</h1>
        <p className="text-text-muted text-[10px] mt-0.5">Auto-discovering your next favorite song</p>
      </div>

      {/* Now Playing Card */}
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

          {/* DNA Match badge */}
          {currentIndex > 0 && (
            <div className="mt-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
              <span className="text-[10px] text-text-muted">DNA Match: </span>
              <span className="text-[10px] font-mono text-green-400">{currentTrack.proximity}</span>
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
              disabled={!nextTrack}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-[11px] font-medium text-white active:scale-95 transition-transform disabled:opacity-30"
            >
              Skip
            </button>
          </div>
        </div>
      </div>

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
              <div className="text-[11px] font-mono text-green-400">{nextTrack.proximity}</div>
              <div className="text-[9px] text-text-muted/50">match</div>
            </div>
          </div>
          <p className="text-[9px] text-text-muted/40 mt-1.5 pl-11.5">Closest DNA match to current track</p>
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
            <span className="text-[9px] font-mono text-text-muted">{djChain.length} total</span>
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
                  <p className="text-[9px] text-text-muted/50 truncate">{track.artist}</p>
                </div>

                {/* Proximity badge */}
                <div className="shrink-0">
                  {track.proximity === "Seed" ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-medium">
                      Seed
                    </span>
                  ) : (
                    <span className={`text-[10px] font-mono ${
                      parseFloat(track.proximity) > 85 ? "text-green-400" : "text-blue-400"
                    }`}>
                      {track.proximity}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Future tracks indicator */}
          {currentIndex < djChain.length - 1 && (
            <div className="flex items-center gap-2 px-2 py-1 opacity-40">
              <div className="w-4" />
              <div className="w-3 flex flex-col items-center">
                <div className="w-px h-1 bg-white/10" />
                <div className="w-1 h-1 rounded-full bg-white/20" />
              </div>
              <p className="text-[9px] text-text-muted/50 italic">
                {djChain.length - currentIndex - 1} more tracks waiting to be discovered...
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
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-[11px] font-medium text-white active:scale-[0.98] transition-transform"
        >
          Save Playlist
        </button>
      </div>
    </div>
  );
}
