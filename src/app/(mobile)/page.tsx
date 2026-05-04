"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    await supabase.from("waitlist").insert({ email }).select();
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-56 h-56 bg-accent-purple/25 rounded-full blur-[90px]" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-40 h-40 bg-accent-blue/15 rounded-full blur-[70px]" />

      {/* Logo */}
      <div className="relative z-10 mb-3 w-20 h-20">
        <Image src="/logo.png" alt="Zeeky" width={80} height={80} className="w-full h-full object-contain" priority />
      </div>

      {/* Title */}
      <h1 className="relative z-10 text-4xl font-bold tracking-wider mb-1">
        <span className="gradient-text">ZEEKY</span>
      </h1>
      <p className="relative z-10 text-sm text-text-muted tracking-wide">Entertainment Inc.</p>
      <p className="relative z-10 text-[11px] text-text-muted/50 max-w-[240px] leading-relaxed mt-2 mb-6">
        AI powered music intelligence for the creation, identification, and recommendation of hits
      </p>

      {/* CTA buttons */}
      <div className="relative z-10 w-full max-w-[300px] space-y-3">
        <Link
          href="/signup"
          className="block w-full py-3.5 bg-gradient-to-r from-accent-purple to-accent-blue rounded-2xl text-white font-bold text-center text-[15px] active:scale-[0.98] transition-transform shadow-lg shadow-accent-purple/25"
        >
          Get Started
        </Link>

        <Link
          href="/app/discover"
          className="block w-full py-2.5 border border-white/10 rounded-2xl text-foreground/80 font-medium text-center text-sm active:bg-white/5 transition-colors"
        >
          Explore DNA Matches
        </Link>

        <p className="text-xs text-text-muted pt-1">
          Already have an account?{" "}
          <Link href="/login" className="text-accent-purple font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>

      {/* Email waitlist */}
      <div className="relative z-10 w-full max-w-[300px] mt-5">
        {submitted ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl py-3 px-4">
            <p className="text-xs text-green-400 font-medium">You&apos;re on the list. We&apos;ll notify you at launch.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-surface border border-white/10 rounded-xl px-3 py-2.5 text-xs placeholder:text-text-muted/40 focus:outline-none focus:border-accent-purple/50"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-accent-purple rounded-xl text-white text-xs font-bold active:opacity-90 transition-opacity shrink-0 disabled:opacity-50"
            >
              {loading ? "..." : "Join"}
            </button>
          </form>
        )}
        <p className="text-[9px] text-text-muted/30 mt-2">Get early access to AI music analysis</p>
      </div>

      {/* Social proof */}
      <div className="relative z-10 flex items-center justify-center gap-4 mt-4">
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
