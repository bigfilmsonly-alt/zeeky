import Link from "next/link";

export default function AppHome() {
  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold">Welcome back</h1>
        <p className="text-text-muted text-xs mt-0.5">AI-powered music intelligence</p>
      </div>

      {/* Primary CTA — Analyze a Song */}
      <Link
        href="/app/score"
        className="block rounded-2xl bg-gradient-to-br from-accent-purple via-accent-blue to-accent-cyan p-4 active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
              <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white">Score My Song</h3>
            <p className="text-[11px] text-white/60">Get your AI hit prediction & sound DNA</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white/40 shrink-0">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </Link>

      {/* Quick Insights — at a glance */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface border border-white/5 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-5 h-5 rounded-md bg-green-500/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-green-400">
                <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[9px] text-text-muted/60 uppercase tracking-wider">Top Match</span>
          </div>
          <p className="text-xs font-bold truncate">Scarface</p>
          <p className="text-[10px] text-green-400 font-mono">89% hit potential</p>
        </div>
        <div className="bg-surface border border-white/5 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-5 h-5 rounded-md bg-accent-purple/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-accent-purple">
                <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="text-[9px] text-text-muted/60 uppercase tracking-wider">Similar to</span>
          </div>
          <p className="text-xs font-bold truncate">Drake, Future</p>
          <p className="text-[10px] text-accent-purple font-mono">95% DNA match</p>
        </div>
      </div>

      {/* Role Actions */}
      <div className="space-y-2">
        <Link
          href="/app/discover"
          className="block rounded-xl bg-surface border border-white/5 p-3 flex items-center gap-3 active:bg-white/[0.03] transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 text-purple-400">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold">Discover by Sound DNA</h3>
            <p className="text-[10px] text-text-muted/50">Find songs that actually sound like yours</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-text-muted/30 shrink-0">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <Link
          href="/app/studio"
          className="block rounded-xl bg-surface border border-white/5 p-3 flex items-center gap-3 active:bg-white/[0.03] transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 text-blue-400">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold">Find Your Target Market</h3>
            <p className="text-[10px] text-text-muted/50">AI identifies your audience by city & demo</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-text-muted/30 shrink-0">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <Link
          href="/app/live"
          className="block rounded-xl bg-surface border border-white/5 p-3 flex items-center gap-3 active:bg-white/[0.03] transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 text-cyan-400">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold">Predict Trending Tracks</h3>
            <p className="text-[10px] text-text-muted/50">AI-powered trend forecasting</p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-text-muted/30 shrink-0">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      {/* Trending — horizontal scroll */}
      <div>
        <h2 className="text-sm font-bold mb-2">Trending Now</h2>
        <div className="flex gap-2 overflow-x-auto -mx-5 px-5">
          {[
            { title: "Scarface", artist: "Zeeky", score: "89%", tag: "Hot" },
            { title: "Gold", artist: "Zeeky", score: "81%", tag: "Rising" },
            { title: "Pull Up Wit Ah Stick", artist: "SahBabii", score: "95%", tag: "Hit" },
          ].map((track) => (
            <div key={track.title} className="min-w-[130px] bg-surface border border-white/5 rounded-xl p-2.5 shrink-0">
              <div className="w-full aspect-[4/3] rounded-lg bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 flex items-center justify-center mb-1.5">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-accent-purple/60">
                  <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <h4 className="font-semibold text-[11px] truncate">{track.title}</h4>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] font-mono text-green-400">{track.score}</span>
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-accent-purple/10 text-accent-purple">{track.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Stats */}
      <div className="bg-surface border border-white/5 rounded-xl p-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-base font-bold gradient-text">50K+</div>
            <div className="text-[8px] text-text-muted/50">Billboard Songs</div>
          </div>
          <div>
            <div className="text-base font-bold gradient-text">84</div>
            <div className="text-[8px] text-text-muted/50">DNA Attributes</div>
          </div>
          <div>
            <div className="text-base font-bold gradient-text">10yr</div>
            <div className="text-[8px] text-text-muted/50">Hit Data</div>
          </div>
        </div>
      </div>
    </div>
  );
}
