"use client";

import { useState, useEffect } from "react";

const aiPlaylists = [
  { name: "Trap DNA Mix", tracks: 24, plays: "12.4K", status: "live" },
  { name: "Hip Hop Essentials", tracks: 18, plays: "8.2K", status: "live" },
  { name: "Chill Vibes AI", tracks: 30, plays: "5.1K", status: "draft" },
];

interface TrendingItem {
  track: string;
  artist: string;
  prediction: string;
  confidence: number;
  up: boolean;
}

const scheduledContent = [
  { title: "New Drop: Scarface Remix", date: "May 5", time: "6:00 PM", type: "Release" },
  { title: "Live Listening Party", date: "May 8", time: "8:00 PM", type: "Event" },
  { title: "AI Playlist Update", date: "May 10", time: "12:00 PM", type: "Playlist" },
];

export default function LivePage() {
  const [activeView, setActiveView] = useState<"playlists" | "trending" | "schedule">("playlists");
  const [trendingPredictions, setTrendingPredictions] = useState<TrendingItem[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch("/api/dna/trending?limit=8");
        const data = await res.json();
        const items: TrendingItem[] = data.trending.map(
          (song: { title: string; artist: string; dhsScore: number }) => ({
            track: song.title,
            artist: song.artist,
            prediction:
              song.dhsScore > 80
                ? "High potential"
                : song.dhsScore > 60
                  ? "Rising"
                  : "Steady",
            confidence: song.dhsScore,
            up: song.dhsScore > 60,
          })
        );
        setTrendingPredictions(items);
      } catch (err) {
        console.error("Failed to fetch trending data", err);
      } finally {
        setTrendingLoading(false);
      }
    }
    fetchTrending();
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Live</h1>
        <p className="text-text-muted text-xs mt-0.5">Stream, curate, and engage</p>
      </div>

      {/* Audience Stats */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Listeners", value: "45.2K", change: "+12%" },
          { label: "Avg Session", value: "23m", change: "+5%" },
          { label: "Return Rate", value: "68%", change: "+3%" },
          { label: "Shares", value: "1.2K", change: "+28%" },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface border border-white/5 rounded-xl p-3">
            <p className="text-[9px] text-text-muted/60 uppercase tracking-wider">{stat.label}</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-bold">{stat.value}</span>
              <span className="text-[10px] text-green-400">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* View Tabs */}
      <div className="flex gap-0.5 bg-white/5 rounded-xl p-0.5">
        {(["playlists", "trending", "schedule"] as const).map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`flex-1 py-2 rounded-lg text-[11px] font-medium capitalize transition-all ${
              activeView === view ? "bg-accent-purple text-white" : "text-text-muted/60"
            }`}
          >
            {view}
          </button>
        ))}
      </div>

      {/* Playlists */}
      {activeView === "playlists" && (
        <div className="space-y-2">
          <button className="w-full border border-dashed border-white/10 rounded-xl p-3 flex items-center gap-2.5 active:border-accent-purple/30 transition-colors">
            <div className="w-9 h-9 rounded-full bg-accent-purple/10 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-accent-purple">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-left">
              <h4 className="text-xs font-medium">Create AI Playlist</h4>
              <p className="text-[10px] text-text-muted/50">Auto-curate via DNA matching</p>
            </div>
          </button>

          {aiPlaylists.map((pl) => (
            <div key={pl.name} className="bg-surface border border-white/5 rounded-xl p-3 flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-accent-purple">
                  <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium truncate">{pl.name}</h4>
                <p className="text-[10px] text-text-muted/50">{pl.tracks} tracks &middot; {pl.plays}</p>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                pl.status === "live" ? "bg-green-500/10 text-green-400" : "bg-white/5 text-text-muted/50"
              }`}>
                {pl.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Trending */}
      {activeView === "trending" && (
        <div className="space-y-2">
          <p className="text-[10px] text-text-muted/50">AI-predicted trends from streaming velocity &amp; DNA patterns</p>
          {trendingLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin" />
              <span className="ml-2 text-xs text-text-muted/50">Loading trends...</span>
            </div>
          ) : trendingPredictions.map((item) => (
            <div key={item.track} className="bg-surface border border-white/5 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <h4 className="text-xs font-medium">{item.track}</h4>
                  <p className="text-[10px] text-text-muted/50">{item.artist}</p>
                </div>
                <div className="flex items-center gap-1">
                  <svg viewBox="0 0 24 24" fill="none" className={`w-3 h-3 ${item.up ? "text-green-400" : "text-yellow-400"}`}>
                    {item.up
                      ? <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      : <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    }
                  </svg>
                  <span className={`text-[10px] font-medium ${item.up ? "text-green-400" : "text-yellow-400"}`}>{item.prediction}</span>
                </div>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-blue" style={{ width: `${item.confidence}%` }} />
              </div>
              <p className="text-[9px] text-text-muted/40 mt-0.5">{item.confidence}% confidence</p>
            </div>
          ))}

        </div>
      )}

      {/* Schedule */}
      {activeView === "schedule" && (
        <div className="space-y-2">
          <button className="w-full border border-dashed border-white/10 rounded-xl p-3 flex items-center gap-2.5 active:border-accent-blue/30 transition-colors">
            <div className="w-9 h-9 rounded-full bg-accent-blue/10 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-accent-blue">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-left">
              <h4 className="text-xs font-medium">Schedule Content</h4>
              <p className="text-[10px] text-text-muted/50">Plan releases and events</p>
            </div>
          </button>

          {scheduledContent.map((item) => (
            <div key={item.title} className="bg-surface border border-white/5 rounded-xl p-3 flex items-center gap-2.5">
              <div className="w-10 text-center shrink-0">
                <div className="text-[10px] text-accent-purple font-medium">{item.date.split(" ")[0]}</div>
                <div className="text-base font-bold leading-tight">{item.date.split(" ")[1]}</div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium truncate">{item.title}</h4>
                <p className="text-[10px] text-text-muted/50">{item.time}</p>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-text-muted/50">{item.type}</span>
            </div>
          ))}
        </div>
      )}

      {/* Go Live CTA */}
      <button className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-bold text-sm text-center active:opacity-90 transition-opacity">
        Start Live Session
      </button>
    </div>
  );
}
