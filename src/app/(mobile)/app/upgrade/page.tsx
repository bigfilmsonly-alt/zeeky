"use client";

import Link from "next/link";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "3 song analyses / month",
      "Basic DNA view (5 attributes)",
      "Top 5 similar songs",
      "Community access",
    ],
    cta: "Current Plan",
    active: true,
    gradient: "",
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    features: [
      "Unlimited song analyses",
      "Full 84-attribute DNA",
      "Target market demographics",
      "Top cities & audience data",
      "Similar artist radar",
      "Export reports",
      "Priority support",
    ],
    cta: "Unlock Pro",
    active: false,
    gradient: "from-accent-purple to-accent-blue",
    popular: true,
  },
  {
    name: "Label",
    price: "$49.99",
    period: "/month",
    features: [
      "Everything in Pro",
      "Team accounts (5 seats)",
      "Bulk analysis (100 songs)",
      "API access",
      "White-label reports",
      "Dedicated support",
    ],
    cta: "Go Label",
    active: false,
    gradient: "from-accent-blue to-accent-cyan",
  },
];

const comparisonFeatures = [
  { feature: "Song analyses", free: "3/month", pro: "Unlimited", label: "Unlimited" },
  { feature: "DNA attributes", free: "5", pro: "84", label: "84" },
  { feature: "Similar songs", free: "Top 5", pro: "Top 50", label: "Top 50" },
  { feature: "Target market data", free: false, pro: true, label: true },
  { feature: "Audience demographics", free: false, pro: true, label: true },
  { feature: "Export reports", free: false, pro: true, label: true },
  { feature: "Team seats", free: "1", pro: "1", label: "5" },
  { feature: "API access", free: false, pro: false, label: true },
  { feature: "White-label reports", free: false, pro: false, label: true },
  { feature: "Bulk analysis", free: false, pro: false, label: "100 songs" },
];

export default function UpgradePage() {
  const [selectedPlan, setSelectedPlan] = useState("Pro");
  const [loading, setLoading] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  async function handleCheckout() {
    const plan = selectedPlan.toLowerCase() as "pro" | "label";
    setLoading(true);
    setShowWaitlist(false);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }

      if (data.fallback) {
        setShowWaitlist(true);
      }
    } catch {
      setShowWaitlist(true);
    } finally {
      setLoading(false);
    }
  }

  function handleWaitlistSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (waitlistEmail.trim()) {
      setWaitlistSubmitted(true);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Upgrade</h1>
        <p className="text-text-muted text-xs mt-0.5">Unlock the full power of AI music intelligence</p>
      </div>

      {/* Plans */}
      <div className="space-y-3">
        {plans.map((plan) => (
          <button
            key={plan.name}
            onClick={() => {
              setSelectedPlan(plan.name);
              setShowWaitlist(false);
              setWaitlistSubmitted(false);
            }}
            className={`w-full text-left rounded-2xl p-4 transition-all ${
              selectedPlan === plan.name
                ? "bg-accent-purple/10 border-2 border-accent-purple/40"
                : "bg-surface border border-white/5"
            } ${plan.popular ? "relative" : ""}`}
          >
            {plan.popular && (
              <span className="absolute -top-2.5 left-4 text-[9px] px-2 py-0.5 rounded-full bg-accent-purple text-white font-bold uppercase tracking-wide">
                Most Popular
              </span>
            )}
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-sm font-bold">{plan.name}</h3>
              <div>
                <span className="text-lg font-bold">{plan.price}</span>
                <span className="text-[10px] text-text-muted/50">{plan.period}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              {plan.features.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-green-400 shrink-0">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[11px] text-text-muted/70">{f}</span>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* CTA */}
      {selectedPlan !== "Free" && (
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-bold text-sm text-center active:scale-[0.98] transition-transform shadow-lg shadow-accent-purple/25 disabled:opacity-70 disabled:active:scale-100"
        >
          {loading
            ? "Processing..."
            : selectedPlan === "Pro"
            ? "Start Pro — $9.99/mo"
            : "Go Label — $49.99/mo"}
        </button>
      )}

      {/* Waitlist Fallback */}
      {showWaitlist && (
        <div className="bg-surface border border-white/5 rounded-2xl p-4 space-y-3">
          {!waitlistSubmitted ? (
            <>
              <p className="text-xs text-text-muted text-center">
                Stripe checkout coming soon. Join the waitlist for early access.
              </p>
              <form onSubmit={handleWaitlistSubmit} className="flex gap-2">
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  required
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-text-muted/40 outline-none focus:border-accent-purple/50 transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-purple text-white text-xs font-bold shrink-0"
                >
                  Join
                </button>
              </form>
            </>
          ) : (
            <p className="text-xs text-green-400 text-center font-medium">
              You&apos;re on the list! We&apos;ll notify you when checkout is live.
            </p>
          )}
        </div>
      )}

      {/* Trust signals */}
      <div className="text-center space-y-2">
        <div className="flex justify-center items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-green-400">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] text-text-muted/60 font-medium">Secure payment via Stripe</span>
        </div>
        <div className="flex justify-center gap-4">
          <span className="text-[10px] text-text-muted/40">Cancel anytime</span>
          <span className="text-[10px] text-text-muted/40">7-day free trial</span>
          <span className="text-[10px] text-text-muted/40">No contracts</span>
        </div>
      </div>

      {/* What you unlock */}
      <div className="bg-surface border border-white/5 rounded-2xl p-4">
        <h3 className="text-sm font-bold mb-3">What Pro Unlocks</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Target Market", desc: "Demographics & cities", icon: "target" },
            { label: "Full DNA", desc: "All 84 attributes", icon: "dna" },
            { label: "Unlimited Scores", desc: "Analyze any song", icon: "score" },
            { label: "Export Reports", desc: "PDF & share cards", icon: "export" },
          ].map((item) => (
            <div key={item.label} className="bg-white/[0.02] rounded-xl p-2.5">
              <div className="w-7 h-7 rounded-lg bg-accent-purple/10 flex items-center justify-center mb-1.5">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-accent-purple">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-[11px] font-bold">{item.label}</p>
              <p className="text-[9px] text-text-muted/50">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-surface border border-white/5 rounded-2xl p-4">
        <h3 className="text-sm font-bold mb-3">Plan Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-2 pr-2 text-text-muted/50 font-medium">Feature</th>
                <th className="text-center py-2 px-1 text-text-muted/50 font-medium">Free</th>
                <th className="text-center py-2 px-1 text-accent-purple font-bold">Pro</th>
                <th className="text-center py-2 px-1 text-text-muted/50 font-medium">Label</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((row) => (
                <tr key={row.feature} className="border-b border-white/[0.03]">
                  <td className="py-2 pr-2 text-text-muted/70">{row.feature}</td>
                  <td className="py-2 px-1 text-center">
                    {renderCellValue(row.free)}
                  </td>
                  <td className="py-2 px-1 text-center">
                    {renderCellValue(row.pro)}
                  </td>
                  <td className="py-2 px-1 text-center">
                    {renderCellValue(row.label)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Link href="/app" className="block text-center text-xs text-text-muted/40 py-2">
        Maybe later
      </Link>
    </div>
  );
}

function renderCellValue(value: boolean | string) {
  if (value === true) {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-green-400 inline-block">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (value === false) {
    return <span className="text-text-muted/30">—</span>;
  }
  return <span className="text-text-muted/70">{value}</span>;
}
