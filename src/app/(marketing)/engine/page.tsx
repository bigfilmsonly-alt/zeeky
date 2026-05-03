import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Engine Deep Dive | Zeeky",
  description:
    "84 attributes. 100M songs. One signature. Learn how Zeeky's patented audio-DNA engine measures distance between songs in 84-dimensional Hilbert space.",
};

/* ------------------------------------------------------------------ */
/*  Attribute data                                                     */
/* ------------------------------------------------------------------ */

const ATTRIBUTES = [
  { name: "MFCC", dims: 20, desc: "Mel-frequency cepstral coefficients capturing timbral texture" },
  { name: "Chroma", dims: 12, desc: "Pitch class profiles representing harmonic content" },
  { name: "Bass Presence", dims: 1, desc: "Low-frequency energy density" },
  { name: "Bass Variation", dims: 1, desc: "Temporal fluctuation of bass energy" },
  { name: "Instrument Variation", dims: 1, desc: "Timbral diversity across instruments" },
  { name: "Melody Variation", dims: 1, desc: "Pitch contour complexity in melodic lines" },
  { name: "Percussion Variation", dims: 1, desc: "Rhythmic pattern diversity" },
  { name: "Spectral Variation", dims: 1, desc: "Change rate of spectral envelope over time" },
  { name: "Spectrum Variation", dims: 1, desc: "Overall spectral flux measurement" },
  { name: "Rolloff", dims: 1, desc: "Frequency below which 85% of spectral energy lies" },
  { name: "Tempo", dims: 1, desc: "Beats per minute with confidence weighting" },
  { name: "Key & Mode", dims: 2, desc: "Tonal center and major/minor classification" },
  { name: "Loudness", dims: 1, desc: "Integrated LUFS measurement" },
  { name: "Dynamic Range", dims: 1, desc: "Difference between peak and average loudness" },
  { name: "Spectral Centroid", dims: 1, desc: "Center of mass of the frequency spectrum" },
  { name: "Spectral Bandwidth", dims: 1, desc: "Width of the frequency spectrum" },
  { name: "Spectral Contrast", dims: 1, desc: "Difference between peaks and valleys in spectrum" },
  { name: "Spectral Flatness", dims: 1, desc: "Noise-like vs. tonal character" },
  { name: "Zero Crossing Rate", dims: 1, desc: "Rate of sign changes in the audio signal" },
  { name: "Harmonic-to-Noise Ratio", dims: 1, desc: "Ratio of harmonic to inharmonic content" },
  { name: "Onset Strength", dims: 1, desc: "Transient detection strength" },
  { name: "RMS Energy", dims: 1, desc: "Root mean square energy envelope" },
  { name: "Additional Engineered Features", dims: 32, desc: "Proprietary cross-domain features" },
];

const TOTAL_DIMS = ATTRIBUTES.reduce((sum, a) => sum + a.dims, 0);

/* ------------------------------------------------------------------ */
/*  Pillar card helper                                                 */
/* ------------------------------------------------------------------ */

function PillarCard({
  step,
  title,
  description,
  icon,
}: {
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="glass-card p-8 card-lift">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4a90e2]/20 to-[#9b51e0]/20 border border-white/10 flex items-center justify-center mb-5">
        {icon}
      </div>
      <p className="text-xs uppercase tracking-[0.2em] text-[#4a90e2] mb-2">{step}</p>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-[#94a3b8] text-sm leading-relaxed">{description}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function EnginePage() {
  return (
    <div className="min-h-screen">
      {/* ---- Hero ---- */}
      <section className="relative overflow-hidden py-28 px-6">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-[#4a90e2]/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#9b51e0]/8 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#9b51e0] mb-4">
            Technical Deep Dive
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="gradient-text">84 attributes.</span>
            <br />
            <span className="gradient-text">100M songs.</span>
            <br />
            <span className="gradient-text">One signature.</span>
          </h1>
          <p className="text-[#94a3b8] max-w-2xl mx-auto text-lg">
            A patented signal-processing pipeline that reduces any digital audio file to a fixed-length vector
            in 84-dimensional Hilbert space -- then measures distance between songs as angles on a unit sphere.
          </p>
        </div>
      </section>

      <div className="section-divider max-w-5xl mx-auto" />

      {/* ---- How DNA Works (3 columns) ---- */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-[#4a90e2] mb-3 text-center">
            The Pipeline
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
            How DNA Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PillarCard
              step="Step 1"
              title="Index"
              description="Extract 84 audio attributes from any digital audio file using signal processing. No metadata. No tags. Pure audio analysis."
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              }
            />
            <PillarCard
              step="Step 2"
              title="Match"
              description="Measure distance between songs as angles on a unit sphere in 84-dimensional Hilbert space. Closer angle = more similar DNA."
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9b51e0" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                </svg>
              }
            />
            <PillarCard
              step="Step 3"
              title="Learn"
              description="Re-weight attributes per user from skips, completes, and saves. No human input required. The algorithm learns what each listener values."
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" strokeWidth="1.5">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      <div className="section-divider max-w-5xl mx-auto" />

      {/* ---- The Math ---- */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-[#9b51e0] mb-3 text-center">
            The Mathematics
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            Distance in Hilbert Space
          </h2>
          <div className="glass-card p-8 md:p-12">
            <p className="text-[#94a3b8] leading-relaxed mb-8">
              Distance between songs is measured by proximity in 84-dimensional Hilbert space.
              Each song&apos;s attribute vector is normalized and projected onto a unit sphere.
              Proximity is the angle between two vectors -- smaller angle means more similar DNA.
            </p>

            {/* Equation */}
            <div className="bg-[#050507] border border-white/5 rounded-xl p-6 md:p-8 text-center mb-8">
              <p className="text-xs text-[#94a3b8] uppercase tracking-wider mb-4">
                Recommendation Score
              </p>
              <div className="font-mono text-xl md:text-2xl">
                <span className="text-[#4a90e2]">recommendation</span>
                <span className="text-white mx-2">=</span>
                <span className="text-[#9b51e0]">&Sigma;</span>
                <span className="text-white">(</span>
                <span className="text-[#4a90e2]">weight</span>
                <sub className="text-[#94a3b8] text-sm">i</sub>
                <span className="text-white mx-1">&times;</span>
                <span className="text-[#4a90e2]">attribute</span>
                <sub className="text-[#94a3b8] text-sm">i</sub>
                <span className="text-white">)</span>
              </div>
              <p className="text-sm text-[#94a3b8] mt-3 font-mono">
                where i = 1 ... 84
              </p>
            </div>

            <p className="text-[#94a3b8] text-sm leading-relaxed">
              Each user&apos;s weight vector is unique. The system learns from implicit signals -- skips decrease
              the weight of matching attributes; completes and saves increase them. Over time, the engine
              converges on each listener&apos;s true taste signature without requiring any explicit feedback.
            </p>
          </div>
        </div>
      </section>

      <div className="section-divider max-w-5xl mx-auto" />

      {/* ---- The 84 Attributes ---- */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-[#4a90e2] mb-3 text-center">
            The Feature Set
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            The 84 Attributes
          </h2>
          <p className="text-[#94a3b8] text-center max-w-2xl mx-auto mb-12">
            Every audio file is decomposed into {TOTAL_DIMS} dimensions across {ATTRIBUTES.length} attribute groups.
            No metadata. No collaborative filtering. Pure signal processing.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ATTRIBUTES.map((attr) => (
              <div
                key={attr.name}
                className="bg-[#0a0a0f] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">{attr.name}</h4>
                  <span className="text-xs font-mono text-[#4a90e2] bg-[#4a90e2]/10 px-2 py-0.5 rounded">
                    {attr.dims}d
                  </span>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed">{attr.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider max-w-5xl mx-auto" />

      {/* ---- Training Corpus ---- */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#9b51e0] mb-3">
            Training Data
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Training Corpus
          </h2>
          <div className="glass-card p-8 md:p-12 max-w-3xl mx-auto">
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-4xl md:text-5xl font-bold gradient-text">50K</p>
                <p className="text-sm text-[#94a3b8] mt-2">Historical Billboard hits across the past decade</p>
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold gradient-text">100M+</p>
                <p className="text-sm text-[#94a3b8] mt-2">Songs in the live production index</p>
              </div>
            </div>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
              Trained on 50,000 historical Billboard hits across the past decade. The hit-prediction model
              learns structural commonalities between chart-topping tracks. Applied to a live index of 100M+ songs
              for real-time recommendation and discovery.
            </p>
          </div>
        </div>
      </section>

      <div className="section-divider max-w-5xl mx-auto" />

      {/* ---- Self-Weighting Algorithm ---- */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-[#4a90e2] mb-3 text-center">
            Personalization
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            Self-Weighting Algorithm
          </h2>
          <div className="glass-card p-8 md:p-12">
            <p className="text-[#94a3b8] leading-relaxed mb-8">
              Each user develops a personal weight vector across all 84 dimensions. The algorithm adjusts
              weights in real-time based on implicit behavioral signals, requiring zero explicit input.
            </p>

            {/* Equation */}
            <div className="bg-[#050507] border border-white/5 rounded-xl p-6 md:p-8 text-center mb-8">
              <p className="text-xs text-[#94a3b8] uppercase tracking-wider mb-4">
                Weight Update Rule
              </p>
              <div className="font-mono text-lg md:text-xl">
                <span className="text-[#4a90e2]">w</span>
                <sub className="text-[#94a3b8] text-sm">i</sub>
                <sup className="text-[#94a3b8] text-sm">(t+1)</sup>
                <span className="text-white mx-2">=</span>
                <span className="text-[#4a90e2]">w</span>
                <sub className="text-[#94a3b8] text-sm">i</sub>
                <sup className="text-[#94a3b8] text-sm">(t)</sup>
                <span className="text-white mx-2">+</span>
                <span className="text-[#9b51e0]">&alpha;</span>
                <span className="text-white mx-1">&middot;</span>
                <span className="text-white">(</span>
                <span className="text-[#4a90e2]">signal</span>
                <span className="text-white mx-1">&middot;</span>
                <span className="text-[#4a90e2]">attr</span>
                <sub className="text-[#94a3b8] text-sm">i</sub>
                <span className="text-white">)</span>
              </div>
              <p className="text-xs text-[#94a3b8] mt-4 leading-relaxed max-w-lg mx-auto">
                signal = +1 (complete/save) or -1 (skip). &alpha; is the learning rate.
                The update is proportional to the attribute&apos;s value in the current track.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/[0.02] rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-400 mb-1">Complete</p>
                <p className="text-xs text-[#94a3b8]">Increases weights of matching attributes</p>
              </div>
              <div className="bg-white/[0.02] rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-[#4a90e2] mb-1">Save</p>
                <p className="text-xs text-[#94a3b8]">Strongly increases weights (2x multiplier)</p>
              </div>
              <div className="bg-white/[0.02] rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-red-400 mb-1">Skip</p>
                <p className="text-xs text-[#94a3b8]">Decreases weights of matching attributes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider max-w-5xl mx-auto" />

      {/* ---- The Patent ---- */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#9b51e0] mb-3">
            Intellectual Property
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            The Patent
          </h2>
          <div className="glass-card p-8 md:p-12 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4a90e2]/20 to-[#9b51e0]/20 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9b51e0" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <p className="text-3xl font-bold font-mono gradient-text mb-4">
              US Patent 7,877,634
            </p>
            <p className="text-[#94a3b8] leading-relaxed mb-4">
              Protected signal-processing methodology for audio feature extraction and similarity measurement.
              Licensed exclusively to Zeeky Entertainment Inc. for 75 years.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#9b51e0]/10 border border-[#9b51e0]/20">
              <div className="w-2 h-2 rounded-full bg-[#9b51e0] animate-pulse-glow" />
              <span className="text-sm text-[#9b51e0] font-medium">Active & Exclusively Licensed</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            See the API
          </h2>
          <p className="text-[#94a3b8] mb-8 max-w-lg mx-auto">
            Drop-in REST endpoints for DNA extraction, similarity search, and personalized recommendations.
          </p>
          <Link
            href="/api-docs"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            See the API
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
