"use client";

import { usePlayer } from "@/lib/player-context";

export default function MiniPlayer() {
  const { currentTrack, isPlaying, progress, duration, togglePlayPause, stop } = usePlayer();

  if (!currentTrack) return null;

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="iphone-miniplayer">
      {/* Progress bar at top of player */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-accent-purple to-accent-blue transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Track info */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-purple/30 to-accent-blue/30 flex items-center justify-center shrink-0">
          {currentTrack.artwork ? (
            <img src={currentTrack.artwork} alt="" className="w-full h-full rounded-lg object-cover" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-accent-purple">
              <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold truncate">{currentTrack.title}</p>
          <p className="text-[10px] text-text-muted/60 truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Play/Pause */}
        <button
          onClick={togglePlayPause}
          className="w-8 h-8 rounded-full flex items-center justify-center active:bg-white/5 transition-colors"
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
              <polygon points="6,4 20,12 6,20" />
            </svg>
          )}
        </button>

        {/* Close */}
        <button
          onClick={stop}
          className="w-7 h-7 rounded-full flex items-center justify-center active:bg-white/5 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-text-muted/50">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
