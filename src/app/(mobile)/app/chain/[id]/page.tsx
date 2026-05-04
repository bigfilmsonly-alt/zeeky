"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import AppleMusicLink from "@/components/AppleMusicLink";

interface ChainTrack {
  id: number;
  title: string;
  artist: string;
  similarity: string;
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

export default function ChainPage() {
  const params = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<SavedPlaylist | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("zeeky_playlists");
    if (!stored) {
      setNotFound(true);
      return;
    }

    try {
      const playlists: SavedPlaylist[] = JSON.parse(stored);
      const found = playlists.find((p) => p.id === params.id);
      if (found) {
        setPlaylist(found);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    }
  }, [params.id]);

  if (notFound) {
    return (
      <div className="space-y-4">
        <div className="bg-surface border border-white/5 rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-text-muted/50">
              <path d="M9.172 14.828L12 12m0 0l2.828-2.828M12 12l2.828 2.828M12 12L9.172 9.172" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <h2 className="text-sm font-bold text-white mb-1">Chain not found</h2>
          <p className="text-[11px] text-text-muted/60 mb-4">
            This DJ chain doesn&apos;t exist or may have been removed.
          </p>
          <Link
            href="/app/discover"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-[11px] font-medium text-white active:scale-[0.98] transition-transform"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to DJ Mode
          </Link>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="space-y-4">
        <div className="bg-surface border border-white/5 rounded-2xl p-8 flex flex-col items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse" />
          <p className="text-[11px] text-text-muted">Loading chain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back navigation */}
      <Link
        href="/app/discover"
        className="inline-flex items-center gap-1 text-text-muted/60 text-[11px] active:text-white transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to DJ Mode
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold gradient-text">{playlist.name}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-text-muted/60">
            {playlist.tracks.length} track{playlist.tracks.length !== 1 ? "s" : ""}
          </span>
          <span className="text-[10px] text-text-muted/40">
            Saved {new Date(playlist.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Track list */}
      <div className="bg-surface border border-white/5 rounded-2xl p-3.5">
        <div className="space-y-1">
          {playlist.tracks.map((track, i) => (
            <div
              key={`${track.id}-${i}`}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 border border-transparent hover:bg-white/[0.02] transition-colors"
            >
              {/* Index number */}
              <div className="w-4 text-center">
                <span className="text-[10px] font-mono text-text-muted/40">{i + 1}</span>
              </div>

              {/* Connector line */}
              <div className="w-3 flex flex-col items-center">
                {i > 0 && <div className="w-px h-1 bg-white/10" />}
                <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-purple-400" : "bg-white/20"}`} />
              </div>

              {/* Track info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-[11px] font-medium text-white/90 truncate">
                  {track.title}
                </h4>
                <div className="flex items-center gap-1.5">
                  <p className="text-[9px] text-text-muted/50 truncate">{track.artist}</p>
                  <span className="text-[8px] px-1 py-0 rounded bg-white/5 text-text-muted/40">
                    {track.genre.split(",")[0]}
                  </span>
                  <span className="text-[8px] font-mono text-blue-400/50">Hit: {track.dhsScore}%</span>
                </div>
                <div className="mt-0.5">
                  <AppleMusicLink appleId={track.appleId} title={track.title} artist={track.artist} />
                </div>
              </div>

              {/* Similarity badge */}
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
          ))}
        </div>
      </div>

      {/* Start from this chain button */}
      <Link
        href="/app/discover"
        className="block w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-[12px] font-medium text-white text-center active:scale-[0.98] transition-transform"
      >
        Start from this chain
      </Link>
    </div>
  );
}
