"use client";

import { useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef } from "react";

const scarfaceResults = [
  { rank: 1, artist: "Future ft Young Thug", song: "Patek Water", correlation: "89.12%" },
  { rank: 2, artist: "Migos ft Drake", song: "Having Our Way", correlation: "88.12%" },
  { rank: 3, artist: "Lil Durk", song: "Golden Child", correlation: "85.86%" },
  { rank: 4, artist: "Moneybagg Yo", song: "Said Sum", correlation: "85.80%" },
  { rank: 5, artist: "Lil Durk ft Gunna", song: "What Happened To Virgil", correlation: "84.90%" },
  { rank: 6, artist: "Gunna ft Young Thug", song: "Wunna", correlation: "84.85%" },
  { rank: 7, artist: "Young Thug ft Future", song: "Sup Mate", correlation: "84.80%" },
  { rank: 8, artist: "Gunna", song: "Spending Addiction", correlation: "84.70%" },
  { rank: 9, artist: "Drake ft Future", song: "I'm The Plug", correlation: "84.50%" },
  { rank: 10, artist: "Travis Scott", song: "NC-17", correlation: "84.45%" },
];

const goldResults = [
  { rank: 1, artist: "Harry Styles", song: "Golden", correlation: "80.50%" },
  { rank: 2, artist: "Billie Eilish", song: "All Good Girls Go to Hell", correlation: "79.65%" },
  { rank: 3, artist: "Bad Bunny", song: "I Need to Know the Artist", correlation: "78.70%" },
  { rank: 4, artist: "Biliar", song: "Soul State", correlation: "77.15%" },
  { rank: 5, artist: "Billie Eilish", song: "I Didn't Change My Number", correlation: "75.85%" },
  { rank: 6, artist: "Billie Eilish", song: "Getting Older", correlation: "74.90%" },
  { rank: 7, artist: "Harry Styles", song: "Daydream", correlation: "73.55%" },
  { rank: 8, artist: "Billie Eilish", song: "Goldwing", correlation: "73.30%" },
  { rank: 9, artist: "Harry Styles", song: "Sunflower", correlation: "72.80%" },
  { rank: 10, artist: "Charlie Harding ft Leighton Meester", song: "Close to U, Mr.", correlation: "72.50%" },
];

const radarArtists = [
  { name: "Drake", value: 0.95 },
  { name: "Future", value: 0.92 },
  { name: "Lil Uzi Vert", value: 0.78 },
  { name: "21 Savage", value: 0.85 },
  { name: "Travis Scott", value: 0.72 },
  { name: "Lil Baby", value: 0.88 },
  { name: "Young Thug", value: 0.82 },
  { name: "Gunna", value: 0.75 },
  { name: "Kodak Black", value: 0.55 },
  { name: "Rod Wave", value: 0.48 },
  { name: "Post Malone", value: 0.45 },
  { name: "Kendrick Lamar", value: 0.58 },
];

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.35,
      ease: "easeOut" as const,
    },
  }),
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: "easeOut" as const },
  },
};

const genreVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      delay: i * 0.12,
      duration: 0.5,
      ease: "easeOut" as const,
    },
  }),
};

export default function Results() {
  const [activeTab, setActiveTab] = useState<"scarface" | "gold">("scarface");
  const results = activeTab === "scarface" ? scarfaceResults : goldResults;

  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-80px" });

  const tableRef = useRef<HTMLDivElement>(null);
  const tableInView = useInView(tableRef, { once: true, margin: "-60px" });

  const genreRef = useRef<HTMLDivElement>(null);
  const genreInView = useInView(genreRef, { once: true, margin: "-60px" });

  return (
    <section id="results" className="py-16 px-6 relative">
      <div className="max-w-6xl mx-auto">
        {/* Heading entrance */}
        <motion.div
          ref={headingRef}
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={headingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, ease: "easeOut" as const }}
        >
          <h2 className="text-3xl font-bold mb-6 tracking-wide">
            <span className="gradient-text">THE RESULTS</span>
          </h2>
          <p className="text-sm text-text-muted max-w-3xl mx-auto">
            AI generated correlations from a database of 50,000 Billboard hits
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Radar visualization */}
          <div className="bg-surface border border-white/5 rounded-2xl p-4">
            <h3 className="text-base font-semibold mb-6 text-center">
              Closest Similar Artists for &quot;Scarface&quot;
            </h3>
            <RadarChart artists={radarArtists} />
          </div>

          {/* Results table */}
          <div ref={tableRef} className="bg-surface border border-white/5 rounded-2xl p-4">
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab("scarface")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === "scarface"
                    ? "bg-accent-purple text-white"
                    : "bg-white/5 text-text-muted hover:bg-white/10"
                }`}
              >
                Scarface
              </button>
              <button
                onClick={() => setActiveTab("gold")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === "gold"
                    ? "bg-accent-blue text-white"
                    : "bg-white/5 text-text-muted hover:bg-white/10"
                }`}
              >
                Gold
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-3 text-left text-text-muted font-medium">
                      #
                    </th>
                    <th className="pb-3 text-left text-text-muted font-medium">
                      Artist
                    </th>
                    <th className="pb-3 text-left text-text-muted font-medium">
                      Song
                    </th>
                    <th className="pb-3 text-right text-text-muted font-medium">
                      Match
                    </th>
                  </tr>
                </thead>
                <AnimatePresence mode="wait">
                  <motion.tbody
                    key={activeTab}
                    initial="hidden"
                    animate={tableInView ? "visible" : "hidden"}
                    exit="exit"
                  >
                    {results.map((row, i) => (
                      <motion.tr
                        key={row.rank}
                        custom={i}
                        variants={rowVariants}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3 text-text-muted">{row.rank}</td>
                        <td className="py-3 font-medium">{row.artist}</td>
                        <td className="py-3 text-text-muted">{row.song}</td>
                        <td className="py-3 text-right">
                          <span
                            className={`font-mono ${
                              parseFloat(row.correlation) > 85
                                ? "text-green-400"
                                : parseFloat(row.correlation) > 75
                                  ? "text-accent-purple"
                                  : "text-accent-blue"
                            }`}
                          >
                            {row.correlation}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </AnimatePresence>
              </table>
            </div>

            <p className="text-xs text-text-muted/60 mt-4">
              {activeTab === "scarface"
                ? "70% correlation to Drake and Future combined"
                : "Strong correlation to Harry Styles and Billie Eilish in top 10"}
            </p>
          </div>
        </div>

        {/* Genre distribution */}
        <div ref={genreRef} className="mt-10 bg-surface border border-white/5 rounded-2xl p-5">
          <h3 className="text-xl font-bold mb-8 text-center">
            Distribution of Musical Influence for &quot;Scarface&quot;
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { genre: "Trap Rap", pct: "36.4%", color: "from-purple-500 to-purple-700" },
              { genre: "Southern Hip Hop", pct: "17.0%", color: "from-blue-500 to-blue-700" },
              { genre: "Hip Hop", pct: "9.7%", color: "from-cyan-500 to-cyan-700" },
              { genre: "Pop", pct: "17.0%", color: "from-yellow-500 to-yellow-700" },
              { genre: "Indie/Other", pct: "19.9%", color: "from-pink-500 to-pink-700" },
            ].map((g, i) => (
              <div key={g.genre} className="text-center">
                <motion.div
                  custom={i}
                  variants={genreVariants}
                  initial="hidden"
                  animate={genreInView ? "visible" : "hidden"}
                  className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${g.color} flex items-center justify-center mb-3`}
                >
                  <span className="text-sm font-bold text-white">{g.pct}</span>
                </motion.div>
                <span className="text-sm text-text-muted">{g.genre}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-divider mt-16 max-w-4xl mx-auto" />
    </section>
  );
}

function RadarChart({ artists }: { artists: { name: string; value: number }[] }) {
  const cx = 200;
  const cy = 200;
  const maxR = 120;
  const rings = 5;
  const n = artists.length;
  const angleStep = (2 * Math.PI) / n;

  const radarRef = useRef<SVGSVGElement>(null);
  const radarInView = useInView(radarRef, { once: true, margin: "-60px" });

  const round = (v: number) => Math.round(v * 100) / 100;
  const points = artists.map((a, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = a.value * maxR;
    return {
      x: round(cx + r * Math.cos(angle)),
      y: round(cy + r * Math.sin(angle)),
      labelX: round(cx + (maxR + 25) * Math.cos(angle)),
      labelY: round(cy + (maxR + 25) * Math.sin(angle)),
      name: a.name,
    };
  });

  // Collapsed polygon: all points at center
  const collapsedPoints = artists.map(() => `${cx},${cy}`).join(" ");
  const expandedPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg ref={radarRef} viewBox="0 0 400 400" className="w-full max-w-md mx-auto">
      <defs>
        <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Rings */}
      {Array.from({ length: rings }, (_, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={(maxR / rings) * (i + 1)}
          className="radar-ring"
        />
      ))}

      {/* Axes */}
      {artists.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={round(cx + maxR * Math.cos(angle))}
            y2={round(cy + maxR * Math.sin(angle))}
            className="radar-axis"
          />
        );
      })}

      {/* Animated data polygon */}
      <motion.polygon
        fill="url(#radarFill)"
        stroke="#8b5cf6"
        strokeWidth="2"
        initial={{ points: collapsedPoints }}
        animate={radarInView ? { points: expandedPoints } : { points: collapsedPoints }}
        transition={{ duration: 1.0, ease: "easeOut" as const }}
      />

      {/* Animated data points with stagger */}
      {points.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="4"
          fill="#8b5cf6"
          stroke="#fff"
          strokeWidth="1"
          initial={{ opacity: 0, scale: 0 }}
          animate={
            radarInView
              ? { opacity: 1, scale: 1 }
              : { opacity: 0, scale: 0 }
          }
          transition={{
            delay: 0.6 + i * 0.06,
            duration: 0.35,
            ease: "easeOut" as const,
          }}
        />
      ))}

      {/* Labels */}
      {points.map((p, i) => (
        <text
          key={i}
          x={p.labelX}
          y={p.labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-text-muted"
          fontSize="7"
        >
          {p.name}
        </text>
      ))}
    </svg>
  );
}
