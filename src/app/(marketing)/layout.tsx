import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050507] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050507]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <svg viewBox="0 0 100 100" className="w-8 h-8" fill="none">
              <defs>
                <linearGradient
                  id="navGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <path
                d="M25 20h50L35 50h30L25 80"
                stroke="url(#navGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="50"
                y1="12"
                x2="50"
                y2="88"
                stroke="url(#navGrad)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-lg font-bold tracking-wider gradient-text">
              ZEEKY
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#94a3b8]">
            <Link
              href="/demo"
              className="hover:text-white transition-colors"
            >
              Demo
            </Link>
            <Link
              href="/engine"
              className="hover:text-white transition-colors"
            >
              Engine
            </Link>
            <Link
              href="/api-docs"
              className="hover:text-white transition-colors"
            >
              API
            </Link>
            <Link
              href="/pricing"
              className="hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="hover:text-white transition-colors"
            >
              About
            </Link>
            <Link
              href="/book-demo"
              className="ml-2 px-5 py-2 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Book a Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="pt-[73px]">{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#050507]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 100 100" className="w-6 h-6" fill="none">
                <defs>
                  <linearGradient
                    id="footGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <path
                  d="M25 20h50L35 50h30L25 80"
                  stroke="url(#footGrad)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="50"
                  y1="12"
                  x2="50"
                  y2="88"
                  stroke="url(#footGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-sm text-[#94a3b8]">
                Zeeky Entertainment Inc.
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs text-[#94a3b8]/60">
              <span>SOC 2 Type II</span>
              <span className="w-px h-3 bg-white/10" />
              <span>GDPR</span>
              <span className="w-px h-3 bg-white/10" />
              <span>CCPA</span>
              <span className="w-px h-3 bg-white/10" />
              <span>2025 Zeeky Entertainment Inc. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
