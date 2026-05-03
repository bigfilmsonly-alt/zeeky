import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Zeeky Entertainment",
  description:
    "The story behind Zeeky Entertainment, the Hitlab AI patent, and our path to licensing the most advanced audio-DNA recommendation engine to DSPs worldwide.",
};

/* ------------------------------------------------------------------ */
/*  Timeline milestone helper                                          */
/* ------------------------------------------------------------------ */

function Milestone({
  year,
  title,
  description,
}: {
  year: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative pl-8 pb-10 last:pb-0">
      {/* Connector line */}
      <div className="absolute left-[7px] top-2 bottom-0 w-px bg-gradient-to-b from-[#4a90e2]/40 to-transparent" />
      {/* Dot */}
      <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-[#4a90e2] bg-[#050507]" />
      <p className="text-xs font-mono text-[#4a90e2] mb-1">{year}</p>
      <h4 className="text-base font-semibold mb-1">{title}</h4>
      <p className="text-sm text-[#94a3b8] leading-relaxed">{description}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Phase card helper                                                  */
/* ------------------------------------------------------------------ */

function PhaseCard({
  phase,
  title,
  description,
  accent,
}: {
  phase: string;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <div className="glass-card p-6 md:p-8 card-lift">
      <p
        className="text-xs uppercase tracking-[0.2em] mb-2 font-semibold"
        style={{ color: accent }}
      >
        {phase}
      </p>
      <h4 className="text-lg font-bold mb-3">{title}</h4>
      <p className="text-sm text-[#94a3b8] leading-relaxed">{description}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* ---- Hero ---- */}
      <section className="relative overflow-hidden py-28 px-6">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#4a90e2]/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#9b51e0]/8 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#9b51e0] mb-4">
            About
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Building the recommendation engine
            <br />
            <span className="gradient-text">music deserves</span>
          </h1>
          <p className="text-[#94a3b8] max-w-2xl mx-auto text-lg">
            Zeeky Entertainment combines a decade of independent music distribution with patented AI
            technology to solve the discovery problem at scale.
          </p>
        </div>
      </section>

      <div className="section-divider max-w-5xl mx-auto" />

      {/* ---- Founder Story ---- */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            {/* Left: Avatar placeholder + name */}
            <div className="lg:col-span-2">
              <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-[#4a90e2]/20 to-[#9b51e0]/20 border border-white/10 flex items-center justify-center mb-6">
                <span className="text-5xl font-bold gradient-text">XG</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">Xavier Gauthier</h2>
              <p className="text-[#94a3b8] mb-1">Founder &amp; CEO</p>
              <p className="text-sm text-[#94a3b8]/60">aka Zeeky</p>
            </div>

            {/* Right: Bio */}
            <div className="lg:col-span-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[#4a90e2] mb-4">
                Founder Story
              </p>
              <h3 className="text-3xl font-bold mb-6">
                From the studio to the algorithm
              </h3>
              <div className="space-y-4 text-[#94a3b8] leading-relaxed">
                <p>
                  Xavier Gauthier started Zeeky Entertainment as an independent label and distribution company,
                  building a catalog of artists over more than a decade through TuneCore and direct DSP relationships.
                  Along the way, he saw firsthand how the biggest streaming platforms consistently failed to surface
                  new music to the right listeners.
                </p>
                <p>
                  The discovery problem was not a data problem -- it was an architecture problem. Collaborative
                  filtering and metadata-based systems cannot hear music. They cannot understand why two songs
                  feel similar to a human ear. Xavier set out to build something that could.
                </p>
                <p>
                  That search led to Hitlab Inc. and US Patent 7,877,634 -- a signal-processing methodology
                  that extracts 84 audio attributes from any digital audio file and measures similarity as angular
                  distance on a unit sphere in Hilbert space. Xavier licensed this patent exclusively for 75 years
                  and built the Zeeky DNA engine on top of it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider max-w-5xl mx-auto" />

      {/* ---- Hitlab AI Partnership ---- */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-[#9b51e0] mb-3 text-center">
            The Technology
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Hitlab AI Partnership
          </h2>

          <div className="glass-card p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#4a90e2]/20 to-[#9b51e0]/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9b51e0" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono gradient-text mb-4">
                  US Patent 7,877,634
                </p>
                <p className="text-[#94a3b8] leading-relaxed mb-4">
                  The patent covers a signal-processing pipeline that decomposes digital audio into 84 measurable
                  attributes across temporal, spectral, harmonic, and timbral dimensions. Distance between any two
                  songs is computed as the angle between their normalized attribute vectors on a unit sphere in
                  84-dimensional Hilbert space.
                </p>
                <p className="text-[#94a3b8] leading-relaxed mb-6">
                  Licensed exclusively to Zeeky Entertainment Inc. for 75 years. This is not a software patent --
                  it protects the underlying mathematical methodology, making it defensible against implementation variants.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#9b51e0]/10 border border-[#9b51e0]/20">
                  <div className="w-2 h-2 rounded-full bg-[#9b51e0] animate-pulse-glow" />
                  <span className="text-sm text-[#9b51e0] font-medium">
                    75-Year Exclusive License
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider max-w-5xl mx-auto" />

      {/* ---- Distribution History ---- */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-[#4a90e2] mb-3 text-center">
            Track Record
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            10+ Years in Distribution
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Timeline */}
            <div>
              <Milestone
                year="2012"
                title="Zeeky Entertainment founded"
                description="Independent label and distribution company launched via TuneCore."
              />
              <Milestone
                year="2016"
                title="SahBabii breakthrough"
                description="Discovered and developed SahBabii, eventually signing to Warner Records."
              />
              <Milestone
                year="2019"
                title="AI research begins"
                description="Partnership with Hitlab Inc. to explore audio-DNA recommendation technology."
              />
              <Milestone
                year="2022"
                title="Patent licensed"
                description="US Patent 7,877,634 exclusively licensed to Zeeky for 75 years."
              />
              <Milestone
                year="2024"
                title="DNA engine v1 launched"
                description="100M+ song index built. API ready for DSP integration."
              />
            </div>

            {/* SahBabii card */}
            <div className="glass-card p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-[#4a90e2] mb-3">
                Case Study
              </p>
              <h3 className="text-2xl font-bold mb-4">SahBabii</h3>
              <div className="space-y-4 text-[#94a3b8] text-sm leading-relaxed">
                <p>
                  Discovered and developed through Zeeky Entertainment. SahBabii grew from an unknown
                  independent artist to a major-label signee at Warner Records.
                </p>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="bg-white/[0.02] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold gradient-text">77M+</p>
                    <p className="text-xs text-[#94a3b8] mt-1">YouTube Views</p>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold gradient-text">Warner</p>
                    <p className="text-xs text-[#94a3b8] mt-1">Record Deal</p>
                  </div>
                </div>
                <p>
                  This is what discovery looks like when the right ears find the right music. The DNA
                  engine automates this process at scale -- finding the next SahBabii before anyone else does.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider max-w-5xl mx-auto" />

      {/* ---- Exit Strategy ---- */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-[#9b51e0] mb-3 text-center">
            Business Path
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Exit Strategy
          </h2>
          <p className="text-[#94a3b8] text-center max-w-2xl mx-auto mb-12">
            A three-phase path from licensing revenue to strategic acquisition.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PhaseCard
              phase="Phase 1"
              title="Non-Exclusive Licensing"
              description="License the DNA engine to 3-5 DSPs on a non-exclusive basis. Prove +15-20% session lift through A/B testing against incumbent recommendation engines."
              accent="#4a90e2"
            />
            <PhaseCard
              phase="Phase 2"
              title="Exclusive Licensing"
              description="Transition to exclusive licensing with a tier-1 DSP at an 8-figure floor. The exclusivity premium is justified by proven session-lift data and competitive moat."
              accent="#9b51e0"
            />
            <PhaseCard
              phase="Phase 3"
              title="Acquisition"
              description="Acquisition by the exclusive licensing partner. The patent, the trained model, the indexed corpus, and the team transfer as a single asset."
              accent="#4a90e2"
            />
          </div>
        </div>
      </section>

      <div className="section-divider max-w-5xl mx-auto" />

      {/* ---- Contact ---- */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#4a90e2] mb-3">
            Get in Touch
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Contact
          </h2>

          <div className="glass-card p-8 md:p-12 max-w-lg mx-auto mb-8">
            <div className="space-y-5">
              {/* Email */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#4a90e2]/10 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" strokeWidth="1.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-xs text-[#94a3b8] mb-0.5">Email</p>
                  <a
                    href="mailto:xavzeeky@gmail.com"
                    className="text-sm text-white hover:text-[#4a90e2] transition-colors"
                  >
                    xavzeeky@gmail.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#9b51e0]/10 flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9b51e0" strokeWidth="1.5">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-xs text-[#94a3b8] mb-0.5">Phone</p>
                  <a
                    href="tel:+15145465913"
                    className="text-sm text-white hover:text-[#9b51e0] transition-colors"
                  >
                    +1 (514) 546-5913
                  </a>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/book-demo"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Book a Demo Call
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
