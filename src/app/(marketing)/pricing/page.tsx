"use client";

import { useState } from "react";
import Link from "next/link";

const tiers = [
  {
    name: "PILOT",
    price: "$25,000",
    period: "/mo",
    commitment: "90-day commit",
    featured: false,
    features: [
      "2M API calls / month",
      "1 environment (sandbox or production)",
      "A/B testing dashboard",
      "Slack Connect support channel",
      "24-hour response SLA",
      "Standard onboarding (2 weeks)",
      "Monthly usage reports",
    ],
    cta: "Start pilot",
    ctaHref: "/book-demo",
  },
  {
    name: "PRODUCTION",
    price: "$200,000",
    period: "/yr base + usage",
    commitment: "Annual contract",
    featured: true,
    features: [
      "Unlimited API calls (usage-based overage)",
      "Unlimited environments",
      "SOC 2 Type II reporting access",
      "Dedicated infrastructure (single-tenant)",
      "<120ms P95 latency guarantee",
      "Co-marketing rights",
      "Quarterly model retraining on your catalog",
      "99.95% uptime SLA with financial credits",
      "Dedicated solutions architect",
      "Custom webhook integrations",
    ],
    cta: "Talk to sales",
    ctaHref: "/book-demo",
  },
  {
    name: "EXCLUSIVE",
    price: "Custom",
    period: "",
    commitment: "Multi-year / 8-figure floor",
    featured: false,
    features: [
      "Category exclusivity (your vertical, locked)",
      "Patent licensing for internal R&D",
      "Dedicated engineering team (3-5 FTEs)",
      "Source code escrow",
      "First right to acquire technology",
      "Direct founder access (24/7)",
      "Custom model architecture",
      "On-premise deployment option",
      "Board-level quarterly reviews",
      "Priority roadmap influence",
    ],
    cta: "Contact founders",
    ctaHref: "/book-demo",
  },
];

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toString();
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(0) + "K";
  return "$" + n.toString();
}

export default function PricingPage() {
  const [mau, setMau] = useState(10_000_000);
  const [sessionLength, setSessionLength] = useState(25);
  const [showReport, setShowReport] = useState(false);

  // ROI calculations
  const sessionLift = 0.18;
  const retentionLift = 0.12;
  const projectedSession = sessionLength * (1 + sessionLift);
  const additionalMinutes = projectedSession - sessionLength;
  const monthlyAdditionalStreams = mau * additionalMinutes * 0.8;
  const affiliateRevenue = monthlyAdditionalStreams * 0.004;
  const annualRevenue = affiliateRevenue * 12;
  const retentionValue = mau * 0.05 * retentionLift * 4.5;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#9b51e0]/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/3 w-[600px] h-[600px] bg-[#9b51e0]/4 rounded-full blur-[180px]" />
        <div className="absolute top-40 right-1/3 w-[400px] h-[400px] bg-[#4a90e2]/4 rounded-full blur-[150px]" />

        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-8 lg:pt-32 lg:pb-12 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9b51e0]/10 border border-[#9b51e0]/20 text-xs font-medium text-[#9b51e0] mb-6">
            Enterprise Pricing
          </span>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Pricing that{" "}
            <span className="bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] bg-clip-text text-transparent">
              scales with your catalog
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-[#94a3b8] max-w-2xl mx-auto leading-relaxed">
            Start with a 90-day pilot. Scale to production. Or lock your
            category with an exclusive partnership.
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl overflow-hidden ${
                tier.featured
                  ? "border-2 border-[#4a90e2]/40 bg-gradient-to-b from-[#4a90e2]/[0.08] to-[#0a0a1a]/80 lg:scale-105 lg:-my-4 shadow-xl shadow-[#4a90e2]/10"
                  : "border border-white/[0.06] bg-[#0a0a1a]/60"
              }`}
            >
              {tier.featured && (
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4a90e2] to-transparent" />
              )}

              <div className="p-8">
                {/* Tier header */}
                <div className="flex items-center justify-between mb-6">
                  <span
                    className={`text-xs font-bold tracking-[0.2em] ${
                      tier.featured ? "text-[#4a90e2]" : "text-[#94a3b8]/60"
                    }`}
                  >
                    {tier.name}
                  </span>
                  {tier.featured && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4a90e2]/20 text-[#4a90e2] uppercase tracking-wider">
                      Most Popular
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mb-2">
                  <span className="text-4xl md:text-5xl font-bold text-white">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-base text-[#94a3b8] ml-1">
                      {tier.period}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#94a3b8]/60 mb-8">
                  {tier.commitment}
                </p>

                {/* CTA */}
                <Link
                  href={tier.ctaHref}
                  className={`block w-full text-center py-3.5 rounded-xl font-semibold text-sm transition-all ${
                    tier.featured
                      ? "bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] text-white hover:opacity-90"
                      : "border border-white/10 text-white hover:border-white/20 hover:bg-white/[0.03]"
                  }`}
                >
                  {tier.cta}
                </Link>

                {/* Divider */}
                <div className="my-8 h-px bg-white/[0.06]" />

                {/* Features */}
                <ul className="space-y-3.5">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          tier.featured ? "text-[#4a90e2]" : "text-[#94a3b8]/40"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm text-[#94a3b8]">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="relative border-t border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#9b51e0]/[0.03] to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-16">
            <span className="text-xs font-medium text-[#9b51e0] uppercase tracking-widest">
              ROI Calculator
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
              Model the impact on your platform
            </h2>
            <p className="mt-4 text-[#94a3b8] max-w-lg mx-auto">
              Enter your platform metrics. See projected lift based on results
              from our existing DSP partnerships.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Inputs */}
            <div className="p-8 rounded-2xl border border-white/[0.06] bg-[#0a0a1a]/60">
              <h3 className="text-lg font-semibold text-white mb-8">
                Your Platform
              </h3>

              {/* MAU slider */}
              <div className="mb-10">
                <div className="flex items-baseline justify-between mb-4">
                  <label className="text-sm text-[#94a3b8]">
                    Monthly Active Users
                  </label>
                  <span className="text-2xl font-bold bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] bg-clip-text text-transparent">
                    {formatNumber(mau)}
                  </span>
                </div>
                <input
                  type="range"
                  min={100_000}
                  max={100_000_000}
                  step={100_000}
                  value={mau}
                  onChange={(e) => setMau(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer [&::-webkit-slider-runnable-track]:rounded-full [&::-moz-range-track]:rounded-full"
                />
                <div className="flex justify-between mt-2 text-[10px] text-[#94a3b8]/40">
                  <span>100K</span>
                  <span>100M</span>
                </div>
              </div>

              {/* Session length slider */}
              <div className="mb-10">
                <div className="flex items-baseline justify-between mb-4">
                  <label className="text-sm text-[#94a3b8]">
                    Avg. Session Length (min)
                  </label>
                  <span className="text-2xl font-bold bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] bg-clip-text text-transparent">
                    {sessionLength}
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={1}
                  value={sessionLength}
                  onChange={(e) => setSessionLength(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer [&::-webkit-slider-runnable-track]:rounded-full [&::-moz-range-track]:rounded-full"
                />
                <div className="flex justify-between mt-2 text-[10px] text-[#94a3b8]/40">
                  <span>5 min</span>
                  <span>60 min</span>
                </div>
              </div>

              {/* Generate Report */}
              <button
                onClick={() => setShowReport(true)}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Generate Report
              </button>
            </div>

            {/* Outputs */}
            <div
              className={`p-8 rounded-2xl border bg-[#0a0a1a]/60 transition-all duration-500 ${
                showReport
                  ? "border-[#4a90e2]/30 shadow-lg shadow-[#4a90e2]/5"
                  : "border-white/[0.06]"
              }`}
            >
              <h3 className="text-lg font-semibold text-white mb-8">
                Projected Impact
              </h3>

              <div className="space-y-8">
                {/* Session lift */}
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-sm text-[#94a3b8]">
                      Session Length Lift
                    </span>
                    <span
                      className={`text-3xl font-bold transition-all duration-500 ${
                        showReport
                          ? "bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] bg-clip-text text-transparent"
                          : "text-white/20"
                      }`}
                    >
                      +{(sessionLift * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#94a3b8]/60">
                    <span>{sessionLength} min</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                    <span className={showReport ? "text-[#4a90e2]" : ""}>
                      {projectedSession.toFixed(1)} min
                    </span>
                    <span className="text-[#94a3b8]/30">
                      (+{additionalMinutes.toFixed(1)} min/session)
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] transition-all duration-1000"
                      style={{
                        width: showReport ? `${(sessionLift * 100) + 50}%` : "0%",
                      }}
                    />
                  </div>
                </div>

                {/* Retention */}
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-sm text-[#94a3b8]">
                      Retention Improvement
                    </span>
                    <span
                      className={`text-3xl font-bold transition-all duration-500 ${
                        showReport
                          ? "bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] bg-clip-text text-transparent"
                          : "text-white/20"
                      }`}
                    >
                      +{(retentionLift * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-[#94a3b8]/60">
                    30-day retention lift based on improved discovery quality
                  </p>
                  <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#9b51e0] to-[#4a90e2] transition-all duration-1000 delay-200"
                      style={{
                        width: showReport ? `${(retentionLift * 100) + 40}%` : "0%",
                      }}
                    />
                  </div>
                </div>

                {/* Revenue */}
                <div className="pt-6 border-t border-white/[0.06]">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-sm text-[#94a3b8]">
                      Est. Annual Affiliate Revenue Lift
                    </span>
                    <span
                      className={`text-3xl font-bold transition-all duration-500 ${
                        showReport
                          ? "bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] bg-clip-text text-transparent"
                          : "text-white/20"
                      }`}
                    >
                      {showReport ? formatCurrency(annualRevenue) : "--"}
                    </span>
                  </div>
                  <p className="text-xs text-[#94a3b8]/60">
                    Based on {formatNumber(mau)} MAU x{" "}
                    {additionalMinutes.toFixed(1)} additional min x $0.004 per
                    stream
                  </p>
                </div>

                {/* Retention monetary value */}
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-sm text-[#94a3b8]">
                      Est. Retention Value (annual)
                    </span>
                    <span
                      className={`text-3xl font-bold transition-all duration-500 ${
                        showReport
                          ? "bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] bg-clip-text text-transparent"
                          : "text-white/20"
                      }`}
                    >
                      {showReport ? formatCurrency(retentionValue) : "--"}
                    </span>
                  </div>
                  <p className="text-xs text-[#94a3b8]/60">
                    Saved churn: {(retentionLift * 100).toFixed(0)}% fewer
                    cancellations at $4.50 avg monthly revenue per user
                  </p>
                </div>

                {/* Total */}
                {showReport && (
                  <div className="p-5 rounded-xl bg-gradient-to-r from-[#4a90e2]/10 to-[#9b51e0]/10 border border-[#4a90e2]/20">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-medium text-white">
                        Total Projected Annual Impact
                      </span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] bg-clip-text text-transparent">
                        {formatCurrency(annualRevenue + retentionValue)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Compare plans
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-white/[0.06]">
                  <th className="pb-4 pr-6 text-[#94a3b8]/60 font-medium w-1/4">
                    Feature
                  </th>
                  <th className="pb-4 pr-6 text-[#94a3b8]/60 font-medium">
                    Pilot
                  </th>
                  <th className="pb-4 pr-6 text-[#4a90e2] font-medium">
                    Production
                  </th>
                  <th className="pb-4 text-[#94a3b8]/60 font-medium">
                    Exclusive
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["API Calls", "2M/mo", "Unlimited", "Unlimited"],
                  ["Environments", "1", "Unlimited", "Unlimited"],
                  [
                    "Latency SLA",
                    "Best effort",
                    "<120ms P95",
                    "<120ms P95",
                  ],
                  ["Uptime SLA", "99.9%", "99.95%", "99.99%"],
                  ["Support", "Slack (24h)", "Dedicated SA", "Founder access"],
                  ["Infrastructure", "Shared", "Dedicated", "On-premise opt."],
                  ["SOC 2 Reports", "--", "Included", "Included"],
                  [
                    "Model Retraining",
                    "--",
                    "Quarterly",
                    "Continuous",
                  ],
                  [
                    "Category Exclusivity",
                    "--",
                    "--",
                    "Included",
                  ],
                  [
                    "Source Code Escrow",
                    "--",
                    "--",
                    "Included",
                  ],
                ].map(([feature, pilot, prod, exclusive], i) => (
                  <tr
                    key={i}
                    className="border-b border-white/[0.04] hover:bg-white/[0.01]"
                  >
                    <td className="py-4 pr-6 text-white font-medium">
                      {feature}
                    </td>
                    <td className="py-4 pr-6 text-[#94a3b8]">
                      {pilot === "--" ? (
                        <span className="text-[#94a3b8]/20">--</span>
                      ) : (
                        pilot
                      )}
                    </td>
                    <td className="py-4 pr-6 text-[#4a90e2]">{prod}</td>
                    <td className="py-4 text-[#94a3b8]">
                      {exclusive === "--" ? (
                        <span className="text-[#94a3b8]/20">--</span>
                      ) : (
                        exclusive
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ / Trust */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-white/[0.06] bg-[#0a0a1a]/40">
              <h3 className="text-sm font-semibold text-white mb-3">
                Can we pilot before committing?
              </h3>
              <p className="text-sm text-[#94a3b8] leading-relaxed">
                Yes. The Pilot tier is a 90-day commitment designed for exactly
                this. We typically see measurable lift within the first 30 days.
                No long-term lock-in until you see results.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-white/[0.06] bg-[#0a0a1a]/40">
              <h3 className="text-sm font-semibold text-white mb-3">
                What does &quot;category exclusivity&quot; mean?
              </h3>
              <p className="text-sm text-[#94a3b8] leading-relaxed">
                On the Exclusive tier, Zeeky will not license the same
                technology to another DSP in your category. If you operate a
                hip-hop-focused platform, no competing hip-hop DSP gets access.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-white/[0.06] bg-[#0a0a1a]/40">
              <h3 className="text-sm font-semibold text-white mb-3">
                How is usage-based pricing calculated?
              </h3>
              <p className="text-sm text-[#94a3b8] leading-relaxed">
                Production tier includes a generous base allocation. Overages
                are billed per 1,000 API calls at tiered rates that decrease
                with volume. Your account manager provides a custom rate card.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#9b51e0]/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Start your{" "}
            <span className="bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] bg-clip-text text-transparent">
              90-day pilot
            </span>{" "}
            today
          </h2>
          <p className="mt-6 text-lg text-[#94a3b8] max-w-xl mx-auto">
            Schedule a 30-minute call with our solutions team. We will scope
            your integration and deliver a custom lift projection.
          </p>
          <div className="mt-10">
            <Link
              href="/book-demo"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] text-white font-semibold text-lg hover:opacity-90 transition-opacity"
            >
              Book a demo
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
