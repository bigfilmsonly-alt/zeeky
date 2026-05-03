"use client";

import { useState } from "react";
import { usePlayer } from "@/lib/player-context";

const seedSongs = [
  { id: "scarface", title: "Scarface", artist: "Zeeky" },
  { id: "gold", title: "Gold", artist: "Zeeky" },
  { id: "patek", title: "Patek Water", artist: "Future ft Young Thug" },
  { id: "said-sum", title: "Said Sum", artist: "Moneybagg Yo" },
];

const generatedPlaylists: Record<string, { title: string; artist: string; match: string; genre: string }[]> = {
  scarface: [
    { title: "Patek Water", artist: "Future ft Young Thug", match: "89%", genre: "Trap" },
    { title: "Having Our Way", artist: "Migos ft Drake", match: "88%", genre: "Hip Hop" },
    { title: "Golden Child", artist: "Lil Durk", match: "86%", genre: "Hip Hop" },
    { title: "Said Sum", artist: "Moneybagg Yo", match: "86%", genre: "Trap" },
    { title: "What Happened To Virgil", artist: "Lil Durk ft Gunna", match: "85%", genre: "Hip Hop" },
    { title: "Wunna", artist: "Gunna ft Young Thug", match: "85%", genre: "Trap" },
    { title: "Sup Mate", artist: "Young Thug ft Future", match: "85%", genre: "Trap" },
    { title: "Spending Addiction", artist: "Gunna", match: "85%", genre: "Trap" },
    { title: "I'm The Plug", artist: "Drake ft Future", match: "85%", genre: "Hip Hop" },
    { title: "NC-17", artist: "Travis Scott", match: "84%", genre: "Trap" },
  ],
  gold: [
    { title: "Golden", artist: "Harry Styles", match: "81%", genre: "Pop" },
    { title: "All Good Girls Go to Hell", artist: "Billie Eilish", match: "80%", genre: "Pop" },
    { title: "Soul State", artist: "Biliar", match: "77%", genre: "Indie" },
    { title: "I Didn't Change My Number", artist: "Billie Eilish", match: "76%", genre: "Pop" },
    { title: "Getting Older", artist: "Billie Eilish", match: "75%", genre: "Pop" },
    { title: "Daydream", artist: "Harry Styles", match: "74%", genre: "Pop" },
    { title: "Goldwing", artist: "Billie Eilish", match: "73%", genre: "Pop" },
    { title: "Sunflower", artist: "Harry Styles", match: "73%", genre: "Pop" },
  ],
  patek: [
    { title: "Scarface", artist: "Zeeky", match: "89%", genre: "Trap" },
    { title: "Wunna", artist: "Gunna ft Young Thug", match: "87%", genre: "Trap" },
    { title: "Sup Mate", artist: "Young Thug ft Future", match: "86%", genre: "Trap" },
    { title: "NC-17", artist: "Travis Scott", match: "85%", genre: "Trap" },
    { title: "Said Sum", artist: "Moneybagg Yo", match: "84%", genre: "Trap" },
    { title: "Spending Addiction", artist: "Gunna", match: "84%", genre: "Trap" },
  ],
  "said-sum": [
    { title: "Scarface", artist: "Zeeky", match: "86%", genre: "Trap" },
    { title: "Patek Water", artist: "Future ft Young Thug", match: "84%", genre: "Trap" },
    { title: "Wunna", artist: "Gunna ft Young Thug", match: "83%", genre: "Trap" },
    { title: "Having Our Way", artist: "Migos ft Drake", match: "82%", genre: "Hip Hop" },
    { title: "Golden Child", artist: "Lil Durk", match: "81%", genre: "Hip Hop" },
  ],
};

export default function PlaylistPage() {
  const [seedId, setSeedId] = useState("scarface");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(true);
  const { play } = usePlayer();

  const seed = seedSongs.find((s) => s.id === seedId)!;
  const tracks = generatedPlaylists[seedId] || [];

  const handleGenerate = () => {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 1500);
  };

  const handleSeedChange = (id: string) => {
    setSeedId(id);
    setGenerated(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">DNA Playlist</h1>
        <p className="text-text-muted text-xs mt-0.5">Songs that actually sound alike</p>
      </div>

      {/* Seed song selector */}
      <div className="bg-surface border border-white/5 rounded-2xl p-4">
        <h3 className="text-xs font-bold mb-2">Seed Song</h3>
        <p className="text-[10px] text-text-muted/50 mb-3">Choose a track to build your playlist from</p>
        <div className="grid grid-cols-2 gap-2">
          {seedSongs.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSeedChange(s.id)}
              className={`p-2.5 rounded-xl text-left transition-all ${
                seedId === s.id
                  ? "bg-accent-purple/15 border border-accent-purple/30"
                  : "bg-white/[0.02] border border-white/5"
              }`}
            >
              <p className="text-[11px] font-bold truncate">{s.title}</p>
              <p className="text-[9px] text-text-muted/50 truncate">{s.artist}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      {!generated && (
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-bold text-sm text-center active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {generating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Generating DNA Playlist...
            </span>
          ) : (
            `Generate Playlist from "${seed.title}"`
          )}
        </button>
      )}

      {/* Generated playlist */}
      {generated && tracks.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold">Sounds Like &quot;{seed.title}&quot;</h2>
              <p className="text-[10px] text-text-muted/50">{tracks.length} tracks matched by audio DNA</p>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">AI Generated</span>
          </div>

          <div className="space-y-1.5">
            {tracks.map((track, i) => (
              <button
                key={track.title}
                onClick={() => play({ id: `pl-${i}`, title: track.title, artist: track.artist, match: track.match })}
                className="w-full text-left bg-surface border border-white/5 rounded-xl p-2.5 flex items-center gap-2.5 active:bg-white/[0.03] transition-colors"
              >
                <div className="w-6 text-center text-[10px] text-text-muted/50 font-mono">{i + 1}</div>
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-accent-purple">
                    <polygon points="6,4 20,12 6,20" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-medium truncate">{track.title}</h4>
                  <p className="text-[10px] text-text-muted/50 truncate">{track.artist}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] font-mono text-green-400">{track.match}</div>
                  <div className="text-[9px] text-text-muted/40">{track.genre}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 rounded-xl bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-xs font-medium active:opacity-80 transition-opacity">
              Export to Apple Music
            </button>
            <button
              onClick={() => handleSeedChange(seedId)}
              className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/5 text-text-muted text-xs font-medium active:opacity-80 transition-opacity"
            >
              Regenerate
            </button>
          </div>

          {/* How it works */}
          <div className="bg-surface border border-white/5 rounded-xl p-3">
            <p className="text-[10px] text-text-muted/50 leading-relaxed">
              Unlike Spotify or Apple Music which recommend based on listening history, Zeeky matches songs by their actual audio DNA — 84 attributes including tempo, bass presence, melody variation, and chord progression. Every song in this playlist genuinely sounds like your seed track.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
