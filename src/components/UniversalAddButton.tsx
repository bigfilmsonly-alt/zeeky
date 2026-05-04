"use client";

import { useState } from "react";
import { useStreaming } from "@/lib/streaming-context";

interface Props {
  songTitle: string;
  songArtist: string;
  size?: "sm" | "md";
}

export default function UniversalAddButton({
  songTitle,
  songArtist,
  size = "sm",
}: Props) {
  const {
    activePlatform,
    platform,
    addToDiscovered,
    authorize,
    isAuthorized,
  } = useStreaming();
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (added || loading || !platform) return;
    setLoading(true);
    try {
      if (!isAuthorized) await authorize();
      await addToDiscovered(songTitle, songArtist);
      setAdded(true);
    } catch (err) {
      console.error("Failed to add:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!activePlatform) {
    // Show a generic "connect platform" hint
    return size === "md" ? (
      <span className="text-[10px] text-text-muted/40 italic">
        Connect a platform to save
      </span>
    ) : null;
  }

  if (size === "md") {
    return (
      <button
        onClick={handleAdd}
        disabled={added || loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
          added
            ? "bg-green-500/10 text-green-400 border border-green-500/20"
            : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
        }`}
      >
        {loading ? (
          <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        ) : added ? (
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
        {added ? "Added" : `Add to ${platform?.name || "Playlist"}`}
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={added || loading}
      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 ${
        added
          ? "bg-green-500/15 text-green-400"
          : "bg-white/5 text-white/50 hover:text-white"
      }`}
      title={
        added
          ? "Added to Discovered by Zeeky"
          : `Add to Discovered by Zeeky on ${platform?.name}`
      }
    >
      {loading ? (
        <span className="w-3 h-3 border border-white/20 border-t-white rounded-full animate-spin" />
      ) : added ? (
        <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3">
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
