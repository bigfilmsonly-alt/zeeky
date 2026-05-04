"use client";

import { usePlayer } from "@/lib/player-context";
import { useMusicKit } from "@/lib/musickit-context";

function appleMusicUrl(track: string, artist: string) {
  return `https://music.apple.com/search?term=${encodeURIComponent(track + " " + artist)}&at=1010lZGl`;
}

export default function MiniPlayer() {
  const { currentTrack, isPlaying, progress, duration, togglePlayPause, stop } = usePlayer();
  const musicKit = useMusicKit();

  if (!currentTrack) return null;

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <>
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

          {/* Apple Music button — 32x32 */}
          <a
            href={appleMusicUrl(currentTrack.title, currentTrack.artist)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform active:scale-90"
            style={{ background: "linear-gradient(135deg, #fa233b, #ff5e3a)" }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-white">
              <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.802.42.127.856.187 1.297.228.473.044.95.07 1.426.07 4.355.002 8.71.002 13.066 0 .39 0 .78-.015 1.17-.056.488-.05.964-.138 1.42-.328 1.454-.607 2.462-1.67 2.96-3.14.163-.48.253-.974.304-1.478.048-.48.07-.96.074-1.44V6.124zM16.95 14.468c0 1.66-.48 2.88-1.47 3.68-.81.66-1.81.99-2.97.99-.52 0-.99-.07-1.42-.22-.66-.22-1.16-.6-1.5-1.15a3.3 3.3 0 01-.5-1.79c0-.92.28-1.67.86-2.25.58-.58 1.37-.91 2.38-.98.29-.02.63-.03 1.02-.02.2 0 .41.01.62.03V9.56l-4.69 1.47v5.15c0 1.63-.49 2.83-1.46 3.61-.81.65-1.79.97-2.95.97-.52 0-.99-.07-1.43-.22-.65-.22-1.15-.6-1.49-1.14a3.28 3.28 0 01-.5-1.78c0-.94.29-1.7.86-2.28.58-.58 1.38-.91 2.39-.98.28-.02.62-.02 1.01-.02.17 0 .35.01.52.02V8.4c0-.48.09-.88.29-1.21.25-.42.66-.68 1.21-.78l5.74-1.4c.16-.04.33-.06.5-.06.42 0 .76.13 1.01.38.25.26.38.6.38 1.03v8.1z" />
            </svg>
          </a>

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

      {/* Apple Music authorize prompt */}
      {musicKit?.isConfigured && !musicKit.isAuthorized && (
        <button
          onClick={() => musicKit.authorize()}
          className="w-full px-3 py-1.5 text-[10px] text-center text-text-muted/70 bg-white/[0.03] border-t border-white/5 hover:text-white/90 transition-colors"
        >
          Connect Apple Music for full-length songs
        </button>
      )}
    </>
  );
}
