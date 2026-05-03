import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-56 h-56 bg-accent-purple/25 rounded-full blur-[90px]" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-40 h-40 bg-accent-blue/15 rounded-full blur-[70px]" />

      {/* Logo */}
      <div className="relative z-10 mb-3 w-16 h-16">
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <defs>
            <linearGradient id="splashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <path d="M25 20h50L35 50h30L25 80" stroke="url(#splashGrad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="50" y1="12" x2="50" y2="88" stroke="url(#splashGrad)" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* Title */}
      <h1 className="relative z-10 text-4xl font-bold tracking-wider mb-1">
        <span className="gradient-text">ZEEKY</span>
      </h1>
      <p className="relative z-10 text-sm text-text-muted tracking-wide">Entertainment Inc.</p>
      <p className="relative z-10 text-[11px] text-text-muted/50 max-w-[240px] leading-relaxed mt-2 mb-8">
        AI powered music intelligence for the creation, identification, and recommendation of hits
      </p>

      {/* CTA buttons — right below the text */}
      <div className="relative z-10 w-full max-w-[300px] space-y-3">
        <Link
          href="/app"
          className="block w-full py-3.5 bg-gradient-to-r from-accent-purple to-accent-blue rounded-2xl text-white font-bold text-center text-[15px] active:scale-[0.98] transition-transform shadow-lg shadow-accent-purple/25"
        >
          Score My Song
        </Link>

        <Link
          href="/app/discover"
          className="block w-full py-2.5 border border-white/10 rounded-2xl text-foreground/80 font-medium text-center text-sm active:bg-white/5 transition-colors"
        >
          Explore DNA Matches
        </Link>
      </div>

      {/* Social proof */}
      <div className="relative z-10 flex items-center justify-center gap-4 mt-6">
        <div className="text-center">
          <div className="text-xs font-bold gradient-text">50K+</div>
          <div className="text-[8px] text-text-muted/40 uppercase tracking-wider">Songs</div>
        </div>
        <div className="w-px h-5 bg-white/10" />
        <div className="text-center">
          <div className="text-xs font-bold gradient-text">84</div>
          <div className="text-[8px] text-text-muted/40 uppercase tracking-wider">DNA Attrs</div>
        </div>
        <div className="w-px h-5 bg-white/10" />
        <div className="text-center">
          <div className="text-xs font-bold gradient-text">10yr</div>
          <div className="text-[8px] text-text-muted/40 uppercase tracking-wider">Billboard</div>
        </div>
      </div>
    </div>
  );
}
