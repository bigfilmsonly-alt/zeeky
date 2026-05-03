import Link from "next/link";

/* ── Lightning-Z Logo SVG ─────────────────────────────────── */
function ZeekyLogo({ size = 24 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      aria-label="Zeeky"
    >
      <defs>
        <linearGradient id="zLogo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4a90e2" />
          <stop offset="100%" stopColor="#9b51e0" />
        </linearGradient>
      </defs>
      <path
        d="M25 20h50L35 50h30L25 80"
        stroke="url(#zLogo)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="50"
        y1="12"
        x2="50"
        y2="88"
        stroke="url(#zLogo)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Pillar Card ──────────────────────────────────────────── */
function PillarCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-card p-6 md:p-8 card-lift">
      <div className="font-mono text-xs text-blue mb-3 tracking-wider uppercase">
        {step}
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-sm leading-relaxed text-text-muted">{description}</p>
    </div>
  );
}

/* ── DSP Row ──────────────────────────────────────────────── */
function DSPRow({
  name,
  status,
  statusColor,
}: {
  name: string;
  status: string;
  statusColor: string;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-line">
      <span className="text-white font-medium">{name}</span>
      <span
        className={`text-xs font-mono tracking-wider uppercase ${statusColor}`}
      >
        {status}
      </span>
    </div>
  );
}

/* ── Pricing Tier ─────────────────────────────────────────── */
function PricingTier({
  name,
  price,
  description,
  features,
  highlight,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`glass-card p-6 md:p-8 card-lift ${
        highlight
          ? "border-blue/30 shadow-[0_0_40px_rgba(74,144,226,0.1)]"
          : ""
      }`}
    >
      <div className="font-mono text-xs text-blue mb-2 tracking-wider uppercase">
        {name}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{price}</div>
      <p className="text-sm text-text-muted mb-5">{description}</p>
      <ul className="space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-text-muted">
            <span className="text-blue mt-0.5 shrink-0">-</span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050507]">
      {/* ── Top Nav ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-line bg-[#050507]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14">
          {/* Logo + wordmark */}
          <Link href="/" className="flex items-center gap-2">
            <ZeekyLogo size={24} />
            <span className="font-semibold text-sm tracking-wider text-white">
              ZEEKY
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8 text-sm text-text-muted">
            <a href="#engine" className="hover:text-white transition-colors">
              Engine
            </a>
            <a href="#api" className="hover:text-white transition-colors">
              API
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#demo" className="hover:text-white transition-colors">
              Demo
            </a>
            <Link
              href="/listen"
              className="hover:text-white transition-colors"
            >
              Listen
            </Link>
          </div>

          {/* Status pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-line bg-surface text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-text-muted hidden sm:inline">
              API{" "}
              <span className="text-green-400">OPERATIONAL</span>{" "}
              <span className="text-text-muted/60">100M SONG INDEX</span>
            </span>
            <span className="text-green-400 sm:hidden">LIVE</span>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 px-6">
        {/* Ambient glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue/[0.06] rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-violet/[0.04] rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
            <span className="gradient-text">
              The recommendation engine
            </span>
            <br />
            <span className="text-white">
              built for the next era of music DSPs.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-text-muted leading-relaxed mb-12">
            Zeeky is a patented audio-DNA engine that powers smarter discovery
            and higher retention for streaming platforms. 84 attributes. 100M+
            songs. Drop-in API.
          </p>

          {/* Split CTA cards */}
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
            {/* B2B */}
            <Link
              href="/api"
              className="group glass-card p-6 text-left card-lift"
            >
              <div className="font-mono text-[11px] text-blue tracking-wider uppercase mb-2">
                For DSPs
              </div>
              <div className="text-xl font-semibold text-white mb-1">
                License the Engine
              </div>
              <p className="text-sm text-text-muted mb-4">
                Drop-in API for recommendation, discovery, and retention.
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-blue group-hover:gap-2 transition-all">
                View API Docs
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
            </Link>

            {/* B2C */}
            <Link
              href="/listen"
              className="group glass-card p-6 text-left card-lift"
            >
              <div className="font-mono text-[11px] text-violet tracking-wider uppercase mb-2">
                For Listeners
              </div>
              <div className="text-xl font-semibold text-white mb-1">
                Try the Live Player
              </div>
              <p className="text-sm text-text-muted mb-4">
                Experience audio-DNA recommendations firsthand.
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-violet group-hover:gap-2 transition-all">
                Open Player
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Ticker Bar ──────────────────────────────────────── */}
      <div className="border-y border-line overflow-hidden py-3 bg-surface/50">
        <div className="animate-ticker flex whitespace-nowrap gap-12 w-max">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 font-mono text-xs text-text-muted">
              <span>
                100M+ <span className="text-blue">Indexed Songs</span>
              </span>
              <span className="text-line">|</span>
              <span>
                84 <span className="text-violet">DNA Attributes</span>
              </span>
              <span className="text-line">|</span>
              <span>
                &lt;120ms <span className="text-blue">P95 Latency</span>
              </span>
              <span className="text-line">|</span>
              <span>
                99.97% <span className="text-violet">Uptime</span>
              </span>
              <span className="text-line">|</span>
              <span>
                U.S. Patent{" "}
                <span className="text-blue">7,877,634</span>
              </span>
              <span className="text-line">|</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Engine Section: Tags vs. DNA ────────────────────── */}
      <section id="engine" className="py-20 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-mono text-xs text-blue tracking-wider uppercase mb-4">
              The Engine
            </p>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-white">Tags are subjective.</span>{" "}
              <span className="gradient-text">DNA is math.</span>
            </h2>
            <p className="max-w-2xl mx-auto text-text-muted leading-relaxed">
              Other engines rely on collaborative filtering and human-assigned tags.
              Zeeky decomposes every track into 84 acoustic attributes -- tempo, harmonic
              complexity, rhythmic density, timbral texture, and 80 more -- then matches
              on the math.
            </p>
          </div>

          {/* Three pillars */}
          <div className="grid md:grid-cols-3 gap-4">
            <PillarCard
              step="01 / Index"
              title="Decompose Every Track"
              description="Our pipeline ingests audio and extracts 84 acoustic DNA attributes in under 200ms per track. No tags, no human labelers -- just signal processing and ML."
            />
            <PillarCard
              step="02 / Match"
              title="Weighted Similarity"
              description="Each attribute carries a learned weight. The engine computes a weighted cosine similarity across all 84 dimensions to find true sonic neighbors."
            />
            <PillarCard
              step="03 / Learn"
              title="Feedback Loop"
              description="Every skip, save, and replay adjusts the weight vector. The model gets sharper with every interaction -- no cold start, no popularity bias."
            />
          </div>

          {/* Equation */}
          <div className="mt-16 text-center">
            <div className="inline-block glass-card px-8 py-6">
              <p className="font-mono text-sm md:text-base text-text-muted mb-2">
                The recommendation equation
              </p>
              <p className="font-mono text-lg md:text-2xl text-white">
                recommendation = &Sigma;(weight
                <sub>i</sub> &times; attribute
                <sub>i</sub>)
              </p>
              <p className="font-mono text-xs text-text-muted/60 mt-2">
                where i = 1...84
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider max-w-5xl mx-auto" />

      {/* ── DSP Partnership Grid ────────────────────────────── */}
      <section id="api" className="py-20 md:py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-mono text-xs text-blue tracking-wider uppercase mb-4">
              Platform Integrations
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Built for the platforms that matter.
            </h2>
          </div>

          <div className="glass-card p-6 md:p-8">
            <DSPRow
              name="Apple Music"
              status="LIVE"
              statusColor="text-apple-red"
            />
            <DSPRow
              name="Spotify"
              status="In Pilot"
              statusColor="text-blue"
            />
            <DSPRow
              name="Amazon Music"
              status="In Pilot"
              statusColor="text-blue"
            />
            <DSPRow
              name="YouTube Music"
              status="Queued"
              statusColor="text-text-muted/60"
            />
            <DSPRow
              name="Tidal"
              status="Queued"
              statusColor="text-text-muted/60"
            />
            <div className="pt-4">
              <p className="text-xs text-text-muted/60 font-mono">
                Integration pipeline via REST API + WebSocket stream. Average
                onboarding: 14 days.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider max-w-5xl mx-auto" />

      {/* ── Pricing ─────────────────────────────────────────── */}
      <section id="pricing" className="py-20 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-mono text-xs text-blue tracking-wider uppercase mb-4">
              Pricing
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, scale-ready pricing.
            </h2>
            <p className="text-text-muted max-w-xl mx-auto">
              Start with a pilot. Scale to production. Lock in exclusivity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <PricingTier
              name="Pilot"
              price="$25K/mo"
              description="90-day proof of concept. Full API access, dedicated support."
              features={[
                "Up to 10M queries/mo",
                "Full 84-attribute DNA analysis",
                "Dedicated integration engineer",
                "Weekly performance reports",
              ]}
            />
            <PricingTier
              name="Production"
              price="$200K/yr"
              description="Unlimited scale. SLA-backed. Priority support."
              features={[
                "Unlimited queries",
                "99.95% SLA guarantee",
                "Custom weight tuning",
                "Real-time feedback loop",
                "Quarterly business reviews",
              ]}
              highlight
            />
            <PricingTier
              name="Exclusive"
              price="Custom"
              description="Category exclusivity. White-label option. Board-level partnership."
              features={[
                "Exclusive territory lock",
                "White-label deployment",
                "Co-development roadmap",
                "Equity/licensing hybrid option",
                "Direct C-suite access",
              ]}
            />
          </div>
        </div>
      </section>

      <div className="section-divider max-w-5xl mx-auto" />

      {/* ── Exit Strategy Quote ─────────────────────────────── */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-xl md:text-2xl italic text-text-muted leading-relaxed">
            &ldquo;The goal isn&apos;t to build a music app. It&apos;s to build the
            recommendation layer that every music app needs -- and license it to
            all of them.&rdquo;
          </blockquote>
          <p className="mt-6 font-mono text-xs text-blue tracking-wider uppercase">
            Zeeky Executive Team
          </p>
        </div>
      </section>

      <div className="section-divider max-w-5xl mx-auto" />

      {/* ── Final CTA ───────────────────────────────────────── */}
      <section id="demo" className="py-20 md:py-32 px-6">
        <div className="relative max-w-3xl mx-auto text-center">
          {/* Ambient */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue/[0.04] rounded-full blur-[140px] pointer-events-none" />

          <h2 className="relative text-3xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Ready to hear the difference?</span>
          </h2>
          <p className="relative text-text-muted mb-10 max-w-lg mx-auto">
            Whether you&apos;re a DSP looking to license the engine or a listener
            who wants better recommendations, we&apos;re ready.
          </p>
          <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:partnerships@zeeky.ai"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue to-violet text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Book a Demo
            </a>
            <Link
              href="/listen"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border border-line text-white font-semibold text-sm hover:bg-white/5 transition-colors"
            >
              Try the Player
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-line py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <ZeekyLogo size={20} />
                <span className="font-semibold text-sm tracking-wider text-white">
                  ZEEKY
                </span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Zeeky Entertainment Inc.
                <br />
                Audio-DNA recommendation engine.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs font-semibold text-white tracking-wider uppercase mb-3">
                Product
              </h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>
                  <a href="#engine" className="hover:text-white transition-colors">
                    Engine
                  </a>
                </li>
                <li>
                  <a href="#api" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <Link href="/listen" className="hover:text-white transition-colors">
                    Live Player
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-semibold text-white tracking-wider uppercase mb-3">
                Company
              </h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>
                  <a href="#demo" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <span>Partnerships</span>
                </li>
                <li>
                  <span>Careers</span>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-semibold text-white tracking-wider uppercase mb-3">
                Legal
              </h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>
                  <span>Privacy</span>
                </li>
                <li>
                  <span>Terms</span>
                </li>
                <li>
                  <span>U.S. Patent 7,877,634</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="section-divider mb-6" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted/60">
            <span>
              &copy; {new Date().getFullYear()} Zeeky Entertainment Inc. All
              rights reserved.
            </span>
            <span className="font-mono">
              U.S. Patent 7,877,634 &middot; partnerships@zeeky.ai
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
