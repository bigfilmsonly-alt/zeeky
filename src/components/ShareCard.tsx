"use client";

import { useRef, useState, useCallback } from "react";

interface DnaAttribute {
  name: string;
  value: number;
}

interface ShareCardProps {
  score: number;
  trackName: string;
  artistName: string;
  similarArtists: string[];
  dnaAttributes: DnaAttribute[];
}

export default function ShareCard({
  score,
  trackName,
  artistName,
  similarArtists,
  dnaAttributes,
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : "https://zeeky.com";

  const shareText = `My track "${trackName}" scored ${score}% hit potential on Zeeky! Check your song's score at zeeky.com`;

  const handleShare = useCallback(async () => {
    setSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${trackName} - ${score}% Hit Potential`,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled share or clipboard failed
    } finally {
      setSharing(false);
    }
  }, [shareText, shareUrl, trackName, score]);

  const handleDownload = useCallback(() => {
    // Prompt the user to screenshot the card.
    // We avoid adding html2canvas as a dependency; instead, flash a visual
    // hint so the user knows to take a screenshot.
    if (cardRef.current) {
      cardRef.current.style.outline = "2px solid rgba(139,92,246,0.6)";
      setTimeout(() => {
        if (cardRef.current) cardRef.current.style.outline = "none";
      }, 1500);
    }
    alert("Take a screenshot of the card to save it!");
  }, []);

  // Determine score color gradient based on value
  const scoreGradient =
    score >= 80
      ? "from-green-400 via-emerald-400 to-cyan-400"
      : score >= 60
        ? "from-amber-400 via-yellow-400 to-orange-400"
        : "from-red-400 via-rose-400 to-pink-400";

  const topArtists = similarArtists.slice(0, 3);
  const topDna = dnaAttributes.slice(0, 3);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* ── The Card ─────────────────────────────────────────── */}
      <div
        ref={cardRef}
        className="relative w-full max-w-[320px] mx-auto rounded-[20px] overflow-hidden"
        style={{ aspectRatio: "1080 / 1920" }}
      >
        {/* Animated gradient border */}
        <div
          className="absolute inset-0 rounded-[20px] p-[1.5px]"
          style={{
            background:
              "linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4, #8b5cf6)",
            backgroundSize: "300% 300%",
            animation: "gradient-shift 8s ease infinite",
          }}
        >
          <div className="w-full h-full rounded-[19px] bg-[#050510] overflow-hidden" />
        </div>

        {/* Card inner content (layered above the border fill) */}
        <div className="absolute inset-[1.5px] rounded-[19px] bg-[#050510] overflow-hidden flex flex-col items-center justify-between py-[10%] px-[8%]">
          {/* ── Background atmospheric effects ── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Top glow */}
            <div
              className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[70%] aspect-square rounded-full opacity-20"
              style={{
                background:
                  "radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)",
              }}
            />
            {/* Bottom-right glow */}
            <div
              className="absolute bottom-[15%] right-[5%] w-[50%] aspect-square rounded-full opacity-15"
              style={{
                background:
                  "radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)",
              }}
            />
            {/* Grid pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            {/* Noise texture feel via a top-down gradient */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, rgba(5,5,16,0.5) 50%, rgba(5,5,16,0.8) 100%)",
              }}
            />
          </div>

          {/* ── Zeeky Logo ── */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-[15%] min-w-[36px] max-w-[52px] aspect-square mb-1">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                <defs>
                  <linearGradient
                    id="shareLogoGrad"
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
                  stroke="url(#shareLogoGrad)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="50"
                  y1="12"
                  x2="50"
                  y2="88"
                  stroke="url(#shareLogoGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span
              className="text-[10px] font-bold tracking-[0.25em] uppercase"
              style={{
                background:
                  "linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ZEEKY
            </span>
          </div>

          {/* ── Score ── */}
          <div className="relative z-10 flex flex-col items-center -mt-[2%]">
            {/* Glow behind the score */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] aspect-square rounded-full opacity-20 blur-[40px]"
              style={{
                background:
                  score >= 80
                    ? "radial-gradient(circle, rgba(52,211,153,0.5) 0%, transparent 70%)"
                    : score >= 60
                      ? "radial-gradient(circle, rgba(251,191,36,0.5) 0%, transparent 70%)"
                      : "radial-gradient(circle, rgba(248,113,113,0.5) 0%, transparent 70%)",
              }}
            />
            <div
              className={`text-[72px] leading-none font-black tracking-tight bg-gradient-to-r ${scoreGradient} bg-clip-text`}
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {score}%
            </div>
            <div className="mt-1 text-[11px] font-semibold tracking-[0.2em] uppercase text-white/50">
              Hit Potential
            </div>

            {/* Decorative ring */}
            <svg
              viewBox="0 0 200 200"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] opacity-10 pointer-events-none"
            >
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="url(#ringGrad)"
                strokeWidth="0.5"
                strokeDasharray="4 6"
              />
              <defs>
                <linearGradient
                  id="ringGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* ── Track info ── */}
          <div className="relative z-10 text-center -mt-[2%]">
            <div className="text-[16px] font-bold text-white leading-snug tracking-wide">
              {trackName}
            </div>
            <div className="text-[11px] text-white/40 mt-0.5 font-medium">
              {artistName}
            </div>
          </div>

          {/* ── Similar Artists Chips ── */}
          <div className="relative z-10 flex flex-wrap justify-center gap-1.5 -mt-[1%]">
            {topArtists.map((artist) => (
              <div
                key={artist}
                className="px-3 py-1 rounded-full text-[9px] font-semibold text-white/70 border border-white/10 bg-white/[0.04] backdrop-blur-sm"
              >
                {artist}
              </div>
            ))}
          </div>

          {/* ── DNA Attribute Bars ── */}
          <div className="relative z-10 w-full space-y-2 -mt-[1%]">
            <div className="text-[8px] text-white/30 uppercase tracking-[0.2em] text-center mb-1 font-semibold">
              Sound DNA
            </div>
            {topDna.map((attr) => (
              <div key={attr.name} className="flex items-center gap-2">
                <span className="text-[9px] text-white/50 w-[72px] text-right shrink-0 font-medium">
                  {attr.name}
                </span>
                <div className="flex-1 h-[5px] rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round(attr.value * 100)}%`,
                      background:
                        "linear-gradient(90deg, #8b5cf6, #3b82f6, #06b6d4)",
                    }}
                  />
                </div>
                <span className="text-[9px] text-white/40 w-[28px] font-mono">
                  {Math.round(attr.value * 100)}%
                </span>
              </div>
            ))}
          </div>

          {/* ── Divider ── */}
          <div className="relative z-10 w-[60%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -mt-[1%]" />

          {/* ── Footer ── */}
          <div className="relative z-10 flex flex-col items-center gap-0.5">
            <span className="text-[9px] text-white/25 tracking-[0.15em] font-medium">
              Scored on
            </span>
            <span
              className="text-[11px] font-bold tracking-[0.2em]"
              style={{
                background:
                  "linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              zeeky.com
            </span>
          </div>
        </div>
      </div>

      {/* ── Action Buttons ─────────────────────────────────── */}
      <div className="flex gap-2 w-full max-w-[320px]">
        <button
          onClick={handleShare}
          disabled={sharing}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-accent-purple to-accent-blue text-white text-xs font-bold active:scale-[0.97] transition-transform disabled:opacity-60"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-4 h-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          {copied ? "Copied!" : "Share"}
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-white/10 text-white/70 text-xs font-bold active:scale-[0.97] transition-transform active:bg-white/5"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-4 h-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Save
        </button>
      </div>
    </div>
  );
}
