"use client";

import { useState } from "react";
import { usePlayer, type Track } from "@/lib/player-context";

const genres = ["All", "Hip Hop", "Trap", "Pop", "R&B", "Indie"];

const recommendations: (Track & { match: string; genre: string })[] = [
  { id: "1", title: "Patek Water", artist: "Future ft Young Thug", match: "89.12%", genre: "Trap", previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/5a/05/4b/5a054b79-2d3c-3a3e-8a37-6aa6f0e3b5a0/mzaf_17541920244498498928.plus.aac.p.m4a" },
  { id: "2", title: "Having Our Way", artist: "Migos ft Drake", match: "88.12%", genre: "Hip Hop", previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/73/1c/1f/731c1f7e-5b3e-d8a6-7c1b-5e1c7a6c3a6b/mzaf_11953084064498498928.plus.aac.p.m4a" },
  { id: "3", title: "Golden Child", artist: "Lil Durk", match: "85.86%", genre: "Hip Hop" },
  { id: "4", title: "Said Sum", artist: "Moneybagg Yo", match: "85.80%", genre: "Trap" },
  { id: "5", title: "What Happened To Virgil", artist: "Lil Durk ft Gunna", match: "84.90%", genre: "Hip Hop" },
  { id: "6", title: "Wunna", artist: "Gunna ft Young Thug", match: "84.85%", genre: "Trap" },
  { id: "7", title: "Golden", artist: "Harry Styles", match: "80.50%", genre: "Pop" },
  { id: "8", title: "Soul State", artist: "Biliar", match: "77.15%", genre: "Indie" },
];

const playlists = [
  { name: "Scarface DNA Match", tracks: 10, gradient: "from-purple-600 to-blue-600" },
  { name: "Gold Vibes", tracks: 8, gradient: "from-blue-600 to-cyan-600" },
  { name: "Weekly AI Picks", tracks: 25, gradient: "from-cyan-600 to-purple-600" },
];

export default function DiscoverPage() {
  const [activeGenre, setActiveGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { play, currentTrack, isPlaying } = usePlayer();

  const filtered = recommendations.filter(
    (r) =>
      (activeGenre === "All" || r.genre === activeGenre) &&
      (searchQuery === "" ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.artist.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handlePlay = (track: typeof recommendations[0]) => {
    play({ id: track.id, title: track.title, artist: track.artist, previewUrl: track.previewUrl, match: track.match });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Discover</h1>
        <p className="text-text-muted text-xs mt-0.5">AI-powered recommendations</p>
      </div>

      {/* Search */}
      <div className="relative">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/50">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search songs, artists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs placeholder:text-text-muted/40 focus:outline-none focus:border-accent-purple/50"
        />
      </div>

      {/* Genre pills */}
      <div className="flex gap-1.5 overflow-x-auto -mx-5 px-5">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setActiveGenre(genre)}
            className={`px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition-all ${
              activeGenre === genre
                ? "bg-accent-purple text-white"
                : "bg-white/5 text-text-muted/70"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* AI Playlists */}
      <div>
        <h2 className="text-sm font-bold mb-2">AI Playlists</h2>
        <div className="flex gap-2.5 overflow-x-auto -mx-5 px-5 pb-1">
          {playlists.map((pl) => (
            <div
              key={pl.name}
              className={`min-w-[160px] rounded-xl bg-gradient-to-br ${pl.gradient} p-3.5 shrink-0`}
            >
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-2">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white">
                  <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <h4 className="font-bold text-white text-xs">{pl.name}</h4>
              <p className="text-[10px] text-white/50">{pl.tracks} tracks</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations list */}
      <div>
        <h2 className="text-sm font-bold mb-2">Songs That Actually Sound Like This</h2>
        <div className="space-y-1.5">
          {filtered.map((track, i) => {
            const isCurrentTrack = currentTrack?.id === track.id;
            return (
              <button
                key={track.id}
                onClick={() => handlePlay(track)}
                className={`w-full text-left rounded-xl p-2.5 flex items-center gap-2.5 transition-colors ${
                  isCurrentTrack
                    ? "bg-accent-purple/10 border border-accent-purple/20"
                    : "bg-surface border border-white/5 active:bg-white/[0.03]"
                }`}
              >
                <div className="w-6 text-center text-[10px] text-text-muted/50 font-mono">{i + 1}</div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  isCurrentTrack
                    ? "bg-accent-purple/20"
                    : "bg-gradient-to-br from-accent-purple/20 to-accent-blue/20"
                }`}>
                  {isCurrentTrack && isPlaying ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-accent-purple">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-accent-purple">
                      <polygon points="6,4 20,12 6,20" fill="currentColor" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium truncate">{track.title}</h4>
                  <p className="text-[10px] text-text-muted truncate">{track.artist}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-xs font-mono ${parseFloat(track.match) > 85 ? "text-green-400" : "text-accent-purple"}`}>
                    {track.match}
                  </div>
                  <div className="text-[9px] text-text-muted/50">{track.genre}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Song DNA Explorer */}
      <div className="bg-surface border border-white/5 rounded-2xl p-4">
        <h3 className="text-sm font-bold mb-0.5">Song DNA Explorer</h3>
        <p className="text-[10px] text-text-muted/60 mb-3">Musical fingerprint of &quot;Scarface&quot;</p>
        <div className="space-y-2.5">
          {[
            { attr: "Tempo", value: 78 },
            { attr: "Bass Presence", value: 92 },
            { attr: "Melody Variation", value: 65 },
            { attr: "Chord Progression", value: 84 },
            { attr: "Spectral Energy", value: 71 },
          ].map((item) => (
            <div key={item.attr}>
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-text-muted/70">{item.attr}</span>
                <span className="font-mono text-text-muted">{item.value}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-blue"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
