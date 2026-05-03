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
    cta: "Contact Sales",
    active: false,
    gradient: "from-accent-blue to-accent-cyan",
  },
];

export default function UpgradePage() {
  const [selectedPlan, setSelectedPlan] = useState("Pro");

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
            onClick={() => setSelectedPlan(plan.name)}
            className={`w-full text-left rounded-2xl p-4 transition-all ${
              selectedPlan === plan.name
                ? "bg-accent-purple/10 border-2 border-accent-purple/40"
                : "bg-surface border border-white/5"
            } ${plan.popular ? "relative" : ""}`}
          >
            {plan.popular && (
              <span className="absolute -top-2.5 left-4 text-[9px] px-2 py-0.5 rounded-full bg-accent-purple text-white font-bold">
                MOST POPULAR
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
        <button className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-bold text-sm text-center active:scale-[0.98] transition-transform shadow-lg shadow-accent-purple/25">
          {selectedPlan === "Pro" ? "Start Pro — $9.99/mo" : "Contact Sales"}
        </button>
      )}

      {/* Trust signals */}
      <div className="text-center space-y-1">
        <p className="text-[10px] text-text-muted/40">Cancel anytime. No contracts.</p>
        <div className="flex justify-center gap-4">
          <span className="text-[9px] text-text-muted/30">Secure payments</span>
          <span className="text-[9px] text-text-muted/30">Instant access</span>
          <span className="text-[9px] text-text-muted/30">7-day trial</span>
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

      <Link href="/app" className="block text-center text-xs text-text-muted/40 py-2">
        Maybe later
      </Link>
    </div>
  );
}
