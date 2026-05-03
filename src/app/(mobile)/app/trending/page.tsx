import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Trend Predictions | Zeeky",
  description:
    "Zeeky analyzes streaming velocity, playlist additions, and DNA similarity to forecast music trends before they happen.",
};

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */

type Status = "hot" | "rising" | "steady" | "cooling";
type Direction = "up" | "down" | "steady";

interface TrendSong {
  title: string;
  artist: string;
  position: string;
  direction: Direction;
  confidence: number;
  status: Status;
}

const songs: TrendSong[] = [
  { title: "Scarface", artist: "Zeeky", position: "#1", direction: "up", confidence: 96, status: "hot" },
  { title: "Patek Water", artist: "Future ft Young Thug", position: "#3", direction: "up", confidence: 92, status: "hot" },
  { title: "Having Our Way", artist: "Migos ft Drake", position: "#5", direction: "up", confidence: 88, status: "rising" },
  { title: "Said Sum", artist: "Moneybagg Yo", position: "#8", direction: "up", confidence: 85, status: "rising" },
  { title: "Golden Child", artist: "Lil Durk", position: "#12", direction: "steady", confidence: 76, status: "steady" },
  { title: "Wunna", artist: "Gunna ft Young Thug", position: "#15", direction: "up", confidence: 82, status: "rising" },
  { title: "What Happened To Virgil", artist: "Lil Durk ft Gunna", position: "#19", direction: "down", confidence: 68, status: "cooling" },
  { title: "Soul State", artist: "Biliar", position: "#24", direction: "steady", confidence: 71, status: "steady" },
];

const statusConfig: Record<Status, { bg: string; text: string; label: string }> = {
  hot: { bg: "bg-red-500/10", text: "text-red-400", label: "Hot" },
  rising: { bg: "bg-green-500/10", text: "text-green-400", label: "Rising" },
  steady: { bg: "bg-yellow-500/10", text: "text-yellow-400", label: "Steady" },
  cooling: { bg: "bg-blue-500/10", text: "text-blue-400", label: "Cooling" },
};

/* ------------------------------------------------------------------ */
/*  Arrow component                                                   */
/* ------------------------------------------------------------------ */

function DirectionArrow({ direction }: { direction: Direction }) {
  if (direction === "up") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-green-400">
        <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (direction === "down") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-red-400">
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-yellow-400">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                    */
/* ------------------------------------------------------------------ */

export default function TrendingPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">AI Trend Predictions</h1>
        <p className="text-text-muted text-xs mt-0.5">Updated weekly</p>
      </div>

      {/* Legend row */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(statusConfig) as Status[]).map((key) => {
          const cfg = statusConfig[key];
          return (
            <span
              key={key}
              className={`text-[9px] px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}
            >
              {cfg.label}
            </span>
          );
        })}
      </div>

      {/* Song list */}
      <div className="space-y-2">
        {songs.map((song) => {
          const cfg = statusConfig[song.status];
          return (
            <div
              key={song.title}
              className="bg-surface border border-white/5 rounded-xl p-3"
            >
              {/* Top row: position, song info, status tag */}
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-sm font-bold text-text-muted/40 w-8 shrink-0 font-mono text-center">
                  {song.position}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium truncate">{song.title}</h4>
                  <p className="text-[10px] text-text-muted/50 truncate">{song.artist}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <DirectionArrow direction={song.direction} />
                  <span className={`text-[9px] px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                </div>
              </div>
              {/* Confidence bar */}
              <div className="pl-10">
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-blue"
                    style={{ width: `${song.confidence}%` }}
                  />
                </div>
                <p className="text-[9px] text-text-muted/40 mt-0.5">
                  {song.confidence}% AI confidence
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* How We Predict */}
      <div className="bg-surface border border-white/5 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-accent-purple/10 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-accent-purple">
              <path
                d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="text-sm font-bold">How We Predict</h3>
        </div>
        <p className="text-[11px] text-text-muted/60 leading-relaxed">
          Zeeky analyzes streaming velocity, playlist additions, and DNA similarity to
          emerging hits to forecast trends before they happen.
        </p>
      </div>
    </div>
  );
}
