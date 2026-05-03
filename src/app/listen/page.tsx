"use client";

import { usePlayer } from "@/lib/player-context";
import AppleMusicButton from "@/components/AppleMusicButton";

/* ─── Track data ─── */
const TOP_10 = [
  { rank: 1, title: "Scarface", artist: "Zeeky", dna: "87.0" },
  { rank: 2, title: "Harlem Shake", artist: "Future ft Young Thug", dna: "87.0" },
  { rank: 3, title: "Having Our Way", artist: "Migos ft Drake", dna: "86.1" },
  { rank: 4, title: "Golden Child", artist: "Lil Durk", dna: "85.9" },
  { rank: 5, title: "Said Sum", artist: "Moneybagg Yo", dna: "85.0" },
  { rank: 6, title: "What Happened To Virgil", artist: "Lil Durk ft Gunna", dna: "85.9" },
  { rank: 7, title: "mop", artist: "Gunna, Young Thug", dna: "84.8" },
  { rank: 8, title: "Sup Mate", artist: "Young Thug ft Future", dna: "84.8" },
  { rank: 9, title: "poochie gown", artist: "Gunna", dna: "84.7" },
  { rank: 10, title: "NC-17", artist: "Travis Scott", dna: "84.1" },
];

const MADE_FOR_YOU = [
  { title: "Scarface", artist: "Zeeky", dna: "87.0", gradient: "from-purple-600 to-blue-500" },
  { title: "Harlem Shake", artist: "Future ft Young Thug", dna: "87.0", gradient: "from-pink-600 to-red-500" },
  { title: "Having Our Way", artist: "Migos ft Drake", dna: "86.1", gradient: "from-emerald-600 to-teal-500" },
  { title: "Golden Child", artist: "Lil Durk", dna: "85.9", gradient: "from-orange-600 to-yellow-500" },
  { title: "Said Sum", artist: "Moneybagg Yo", dna: "85.0", gradient: "from-cyan-600 to-indigo-500" },
];

/* ─── Helpers ─── */
function todayFormatted(): string {
  const d = new Date();
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

/* ─── Page ─── */
export default function ListenNowPage() {
  const { play } = usePlayer();

  const handlePreview = (title: string, artist: string) => {
    play({ id: `${title}-${artist}`, title, artist });
  };

  return (
    <div className="px-4 pb-28">
      {/* ── Header ── */}
      <div className="pt-2 pb-3">
        <p className="text-[11px] text-text-muted/50 uppercase tracking-wider font-medium">
          {todayFormatted()}
        </p>
        <h1 className="text-2xl font-bold tracking-tight mt-0.5">Listen Now</h1>
      </div>

      {/* ── DNA Ribbon ── */}
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-surface/60 border border-white/[0.04] mb-4">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <p className="text-[9px] font-mono text-text-muted/70 tracking-wider uppercase">
          Powered by Zeeky DNA &middot; 100M Song Index
        </p>
      </div>

      {/* ── Hero Card ── */}
      <div className="rounded-2xl overflow-hidden bg-surface border border-white/[0.06] mb-4">
        {/* Art placeholder */}
        <div className="h-44 bg-gradient-to-br from-accent-purple/40 via-accent-blue/30 to-accent-cyan/20 flex items-end p-4">
          <div>
            <p className="text-[10px] text-white/50 font-mono uppercase tracking-widest mb-1">Featured</p>
            <h2 className="text-xl font-bold leading-tight">Scarface</h2>
            <p className="text-sm text-text-muted/70">Zeeky</p>
          </div>
        </div>
        <div className="p-3 flex gap-2">
          <button
            onClick={() => handlePreview("Scarface", "Zeeky")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold active:bg-white/15 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <polygon points="6,4 20,12 6,20" />
            </svg>
            Preview
          </button>
          <AppleMusicButton track="Scarface" artist="Zeeky" size="hero" />
        </div>
      </div>

      {/* ── Affiliate Banner ── */}
      <div className="flex justify-center mb-5">
        <div
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #fa233b, #ff5e3a)" }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.802.42.127.856.187 1.297.228.473.044.95.07 1.426.07 4.355.002 8.71.002 13.066 0 .39 0 .78-.015 1.17-.056.488-.05.964-.138 1.42-.328 1.454-.607 2.462-1.67 2.96-3.14.163-.48.253-.974.304-1.478.048-.48.07-.96.074-1.44V6.124z" />
          </svg>
          Listen free &middot; Play full tracks on Apple Music
        </div>
      </div>

      {/* ── Made For You ── */}
      <div className="mb-5">
        <h3 className="text-sm font-bold mb-2.5 tracking-tight">Made For You</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
          {MADE_FOR_YOU.map((t) => (
            <div key={t.title + t.artist} className="shrink-0 w-[130px]">
              {/* Art */}
              <div
                className={`w-full aspect-square rounded-xl bg-gradient-to-br ${t.gradient} mb-1.5 flex items-end p-2`}
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white/30">
                  <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <p className="text-[11px] font-semibold truncate">{t.title}</p>
              <p className="text-[10px] text-text-muted/50 truncate">{t.artist}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[9px] font-mono text-accent-purple">{t.dna}%</span>
                <AppleMusicButton track={t.title} artist={t.artist} size="chip" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Top 10 — Hip-Hop/Rap ── */}
      <div>
        <h3 className="text-sm font-bold mb-2.5 tracking-tight">Top 10 &mdash; Hip-Hop/Rap</h3>
        <div className="flex flex-col gap-1">
          {TOP_10.map((t) => (
            <div
              key={t.rank}
              className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-surface/50 transition-colors"
            >
              {/* Rank */}
              <span className="w-5 text-right text-[11px] font-mono text-text-muted/40 shrink-0">
                {t.rank}
              </span>

              {/* Play icon */}
              <button
                onClick={() => handlePreview(t.title, t.artist)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center shrink-0 active:bg-white/10 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white/70">
                  <polygon points="8,5 19,12 8,19" />
                </svg>
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold truncate">{t.title}</p>
                <p className="text-[10px] text-text-muted/50 truncate">{t.artist}</p>
              </div>

              {/* DNA % */}
              <span className="text-[10px] font-mono text-accent-purple shrink-0">{t.dna}%</span>

              {/* Apple Music button */}
              <AppleMusicButton track={t.title} artist={t.artist} size="track" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
