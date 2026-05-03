import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

/* ------------------------------------------------------------------ */
/*  Hardcoded artist data                                             */
/* ------------------------------------------------------------------ */

const artists: Record<
  string,
  {
    name: string;
    initials: string;
    gradient: string;
    genres: string[];
    dna: { tempo: number; bass: number; melody: number; chord: number; energy: number };
    similar: { slug: string; name: string; initials: string; gradient: string }[];
    topMatches: { title: string; artist: string; score: number }[];
    stats: { streams: string; tracks: string; matches: string };
  }
> = {
  drake: {
    name: "Drake",
    initials: "DK",
    gradient: "from-purple-500 to-blue-500",
    genres: ["Hip Hop", "R&B", "Pop"],
    dna: { tempo: 72, bass: 80, melody: 88, chord: 82, energy: 68 },
    similar: [
      { slug: "future", name: "Future", initials: "FT", gradient: "from-blue-600 to-cyan-500" },
      { slug: "21-savage", name: "21 Savage", initials: "21", gradient: "from-red-600 to-orange-500" },
      { slug: "lil-baby", name: "Lil Baby", initials: "LB", gradient: "from-green-500 to-emerald-400" },
      { slug: "travis-scott", name: "Travis Scott", initials: "TS", gradient: "from-amber-500 to-red-500" },
    ],
    topMatches: [
      { title: "Patek Water", artist: "Future ft Young Thug", score: 92 },
      { title: "Scarface", artist: "Zeeky", score: 89 },
      { title: "Having Our Way", artist: "Migos ft Drake", score: 88 },
    ],
    stats: { streams: "82.4B", tracks: "342", matches: "1.2K" },
  },
  future: {
    name: "Future",
    initials: "FT",
    gradient: "from-blue-600 to-cyan-500",
    genres: ["Trap", "Hip Hop", "R&B"],
    dna: { tempo: 84, bass: 94, melody: 62, chord: 70, energy: 88 },
    similar: [
      { slug: "drake", name: "Drake", initials: "DK", gradient: "from-purple-500 to-blue-500" },
      { slug: "21-savage", name: "21 Savage", initials: "21", gradient: "from-red-600 to-orange-500" },
      { slug: "travis-scott", name: "Travis Scott", initials: "TS", gradient: "from-amber-500 to-red-500" },
      { slug: "lil-baby", name: "Lil Baby", initials: "LB", gradient: "from-green-500 to-emerald-400" },
    ],
    topMatches: [
      { title: "Patek Water", artist: "Future ft Young Thug", score: 95 },
      { title: "Wunna", artist: "Gunna ft Young Thug", score: 90 },
      { title: "Said Sum", artist: "Moneybagg Yo", score: 86 },
    ],
    stats: { streams: "28.1B", tracks: "287", matches: "980" },
  },
  "travis-scott": {
    name: "Travis Scott",
    initials: "TS",
    gradient: "from-amber-500 to-red-500",
    genres: ["Hip Hop", "Trap", "Psychedelic"],
    dna: { tempo: 78, bass: 90, melody: 74, chord: 68, energy: 92 },
    similar: [
      { slug: "drake", name: "Drake", initials: "DK", gradient: "from-purple-500 to-blue-500" },
      { slug: "future", name: "Future", initials: "FT", gradient: "from-blue-600 to-cyan-500" },
      { slug: "21-savage", name: "21 Savage", initials: "21", gradient: "from-red-600 to-orange-500" },
      { slug: "lil-baby", name: "Lil Baby", initials: "LB", gradient: "from-green-500 to-emerald-400" },
    ],
    topMatches: [
      { title: "Scarface", artist: "Zeeky", score: 91 },
      { title: "Golden Child", artist: "Lil Durk", score: 87 },
      { title: "Said Sum", artist: "Moneybagg Yo", score: 84 },
    ],
    stats: { streams: "35.6B", tracks: "198", matches: "870" },
  },
  "21-savage": {
    name: "21 Savage",
    initials: "21",
    gradient: "from-red-600 to-orange-500",
    genres: ["Hip Hop", "Trap", "Drill"],
    dna: { tempo: 68, bass: 92, melody: 55, chord: 60, energy: 85 },
    similar: [
      { slug: "drake", name: "Drake", initials: "DK", gradient: "from-purple-500 to-blue-500" },
      { slug: "future", name: "Future", initials: "FT", gradient: "from-blue-600 to-cyan-500" },
      { slug: "lil-baby", name: "Lil Baby", initials: "LB", gradient: "from-green-500 to-emerald-400" },
      { slug: "travis-scott", name: "Travis Scott", initials: "TS", gradient: "from-amber-500 to-red-500" },
    ],
    topMatches: [
      { title: "What Happened To Virgil", artist: "Lil Durk ft Gunna", score: 93 },
      { title: "Golden Child", artist: "Lil Durk", score: 88 },
      { title: "Wunna", artist: "Gunna ft Young Thug", score: 85 },
    ],
    stats: { streams: "19.7B", tracks: "156", matches: "720" },
  },
  "lil-baby": {
    name: "Lil Baby",
    initials: "LB",
    gradient: "from-green-500 to-emerald-400",
    genres: ["Hip Hop", "Trap", "R&B"],
    dna: { tempo: 76, bass: 88, melody: 70, chord: 74, energy: 82 },
    similar: [
      { slug: "drake", name: "Drake", initials: "DK", gradient: "from-purple-500 to-blue-500" },
      { slug: "future", name: "Future", initials: "FT", gradient: "from-blue-600 to-cyan-500" },
      { slug: "21-savage", name: "21 Savage", initials: "21", gradient: "from-red-600 to-orange-500" },
      { slug: "travis-scott", name: "Travis Scott", initials: "TS", gradient: "from-amber-500 to-red-500" },
    ],
    topMatches: [
      { title: "Said Sum", artist: "Moneybagg Yo", score: 91 },
      { title: "Having Our Way", artist: "Migos ft Drake", score: 87 },
      { title: "Patek Water", artist: "Future ft Young Thug", score: 84 },
    ],
    stats: { streams: "24.3B", tracks: "210", matches: "850" },
  },
};

const dnaLabels: Record<string, string> = {
  tempo: "Tempo",
  bass: "Bass Presence",
  melody: "Melody Variation",
  chord: "Chord Progression",
  energy: "Spectral Energy",
};

/* ------------------------------------------------------------------ */
/*  Static generation                                                 */
/* ------------------------------------------------------------------ */

export async function generateStaticParams() {
  return Object.keys(artists).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artist = artists[slug];
  if (!artist) return { title: "Artist Not Found | Zeeky" };
  return {
    title: `${artist.name} - Sound DNA Profile | Zeeky`,
    description: `Explore ${artist.name}'s unique sound DNA, similar artists, and top song matches on Zeeky.`,
  };
}

/* ------------------------------------------------------------------ */
/*  Page component                                                    */
/* ------------------------------------------------------------------ */

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = artists[slug];
  if (!artist) notFound();

  return (
    <div className="space-y-5">
      {/* Back nav */}
      <Link
        href="/app/discover"
        className="inline-flex items-center gap-1 text-text-muted/60 text-[11px] active:text-white transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
          <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back
      </Link>

      {/* Artist header */}
      <div className="text-center">
        <div
          className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${artist.gradient} flex items-center justify-center mb-3`}
        >
          <span className="text-2xl font-bold text-white">{artist.initials}</span>
        </div>
        <h1 className="text-xl font-bold">{artist.name}</h1>
        <div className="flex gap-1.5 justify-center mt-2 flex-wrap">
          {artist.genres.map((genre) => (
            <span
              key={genre}
              className="text-[9px] px-2.5 py-0.5 rounded-full bg-accent-purple/10 text-accent-purple border border-accent-purple/20"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Streams", value: artist.stats.streams },
          { label: "Tracks Analyzed", value: artist.stats.tracks },
          { label: "DNA Matches", value: artist.stats.matches },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface border border-white/5 rounded-xl p-2.5 text-center"
          >
            <div className="text-base font-bold gradient-text">{stat.value}</div>
            <div className="text-[9px] text-text-muted/60 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* DNA profile */}
      <div className="bg-surface border border-white/5 rounded-2xl p-4">
        <h2 className="text-sm font-bold mb-0.5">Sound DNA Profile</h2>
        <p className="text-[10px] text-text-muted/60 mb-3">
          Unique audio fingerprint of {artist.name}
        </p>
        <div className="space-y-2.5">
          {(Object.keys(artist.dna) as (keyof typeof artist.dna)[]).map((key) => (
            <div key={key}>
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-text-muted/70">{dnaLabels[key]}</span>
                <span className="font-mono text-text-muted">{artist.dna[key]}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-blue"
                  style={{ width: `${artist.dna[key]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Similar Artists */}
      <div>
        <h2 className="text-sm font-bold mb-2">Similar Artists</h2>
        <div className="grid grid-cols-2 gap-2">
          {artist.similar.map((sim) => (
            <Link
              key={sim.slug}
              href={`/app/artist/${sim.slug}`}
              className="bg-surface border border-white/5 rounded-xl p-3 flex items-center gap-2.5 active:bg-white/[0.03] transition-colors"
            >
              <div
                className={`w-9 h-9 rounded-full bg-gradient-to-br ${sim.gradient} flex items-center justify-center shrink-0`}
              >
                <span className="text-[10px] font-bold text-white">{sim.initials}</span>
              </div>
              <span className="text-xs font-medium truncate">{sim.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Top DNA Matches */}
      <div>
        <h2 className="text-sm font-bold mb-2">Top DNA Matches</h2>
        <div className="space-y-1.5">
          {artist.topMatches.map((match, i) => (
            <div
              key={match.title}
              className="bg-surface border border-white/5 rounded-xl p-3 flex items-center gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-mono text-accent-purple font-bold">
                  {i + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium truncate">{match.title}</h4>
                <p className="text-[10px] text-text-muted/50 truncate">{match.artist}</p>
              </div>
              <div className="text-right shrink-0">
                <div
                  className={`text-xs font-mono ${
                    match.score >= 90 ? "text-green-400" : "text-accent-purple"
                  }`}
                >
                  {match.score}%
                </div>
                <div className="text-[9px] text-text-muted/40">match</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Score CTA */}
      <Link
        href="/app/score"
        className="block w-full py-3.5 rounded-2xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-bold text-sm text-center active:opacity-90 transition-opacity"
      >
        Score Your Song Against {artist.name}
      </Link>
    </div>
  );
}
