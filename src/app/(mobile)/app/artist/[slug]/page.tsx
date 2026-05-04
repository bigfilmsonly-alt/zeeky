"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SongResult {
  id: number;
  artist: string;
  title: string;
  year: number;
  genre: string;
  peak: number;
  weeks: number;
  rank: number;
  dhsScore: number;
  energyTotal: number;
  energyNorm: number;
}

interface SimilarSong {
  id: number;
  artist: string;
  title: string;
  year: number;
  genre: string;
  peak: number;
  similarity: number;
  dhsScore: number;
}

interface ArtistProfile {
  name: string;
  initials: string;
  genres: string[];
  tracks: number;
  avgDhsScore: number;
  avgEnergy: number;
  songs: SongResult[];
  similarArtists: { slug: string; name: string; initials: string }[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const gradients = [
  "from-purple-500 to-blue-500",
  "from-blue-600 to-cyan-500",
  "from-red-600 to-orange-500",
  "from-green-500 to-emerald-400",
  "from-amber-500 to-red-500",
  "from-pink-500 to-rose-400",
  "from-indigo-500 to-purple-400",
  "from-teal-500 to-cyan-400",
];

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function ArtistPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;
    const decodedSlug = decodeURIComponent(slug);

    async function fetchArtist() {
      setLoading(true);
      setNotFound(false);

      try {
        // Search for songs by this artist
        const searchRes = await fetch(
          `/api/dna/search?q=${encodeURIComponent(decodedSlug)}&limit=20`
        );
        const searchResults: SongResult[] = await searchRes.json();

        // Filter results to only songs where artist name matches (case-insensitive contains)
        const artistQuery = decodedSlug.replace(/-/g, " ");
        const artistSongs = searchResults.filter((song) =>
          song.artist.toLowerCase().includes(artistQuery.toLowerCase())
        );

        if (cancelled) return;

        if (artistSongs.length === 0) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        // Build artist profile from matched songs
        const artistName = artistSongs[0].artist;
        const initials = getInitials(artistName);

        // Collect unique genres
        const genreSet = new Set<string>();
        for (const song of artistSongs) {
          for (const g of song.genre.split(",")) {
            const genre = g.trim();
            if (genre && genre !== "Music") {
              genreSet.add(genre);
            }
          }
        }

        // Calculate average dhsScore and energy
        const avgDhsScore = Math.round(
          artistSongs.reduce((sum, s) => sum + s.dhsScore, 0) /
            artistSongs.length
        );
        const avgEnergy = Math.round(
          artistSongs.reduce((sum, s) => sum + s.energyNorm, 0) /
            artistSongs.length
        );

        // Sort songs by dhsScore descending for top matches
        const sortedSongs = [...artistSongs].sort(
          (a, b) => b.dhsScore - a.dhsScore
        );

        // Fetch similar artists from the first song
        let similarArtists: { slug: string; name: string; initials: string }[] =
          [];
        try {
          const similarsRes = await fetch(
            `/api/dna/similars?id=${artistSongs[0].id}&limit=20`
          );
          if (similarsRes.ok) {
            const similarsData: { song: SongResult; similars: SimilarSong[] } =
              await similarsRes.json();

            // Group similar songs by artist (excluding current artist)
            const artistCounts: Record<string, number> = {};
            for (const sim of similarsData.similars) {
              if (
                sim.artist.toLowerCase() !== artistName.toLowerCase()
              ) {
                artistCounts[sim.artist] =
                  (artistCounts[sim.artist] || 0) + 1;
              }
            }

            // Top 5 most-appearing artists
            similarArtists = Object.entries(artistCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([name]) => ({
                slug: slugify(name),
                name,
                initials: getInitials(name),
              }));
          }
        } catch {
          // Silently ignore similar artists fetch failure
        }

        if (cancelled) return;

        setArtist({
          name: artistName,
          initials,
          genres: Array.from(genreSet).slice(0, 5),
          tracks: artistSongs.length,
          avgDhsScore,
          avgEnergy,
          songs: sortedSongs,
          similarArtists,
        });
      } catch {
        if (!cancelled) {
          setNotFound(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchArtist();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  /* ---------------------------------------------------------------- */
  /*  Loading state                                                    */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="inline-flex items-center gap-1 text-text-muted/60 text-[11px]">
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
        </div>
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-white/5 animate-pulse mb-3" />
          <div className="h-5 w-32 mx-auto bg-white/5 rounded animate-pulse mb-2" />
          <div className="h-3 w-48 mx-auto bg-white/5 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface border border-white/5 rounded-xl p-2.5 h-14 animate-pulse"
            />
          ))}
        </div>
        <div className="bg-surface border border-white/5 rounded-2xl p-4 h-48 animate-pulse" />
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Not found state                                                  */
  /* ---------------------------------------------------------------- */

  if (notFound || !artist) {
    return (
      <div className="space-y-5">
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
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-3">
            <span className="text-2xl text-text-muted/40">?</span>
          </div>
          <h1 className="text-lg font-bold mb-1">Artist Not Found</h1>
          <p className="text-xs text-text-muted/60">
            No songs found for &ldquo;
            {decodeURIComponent(slug).replace(/-/g, " ")}
            &rdquo; in the DNA catalog.
          </p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  DNA profile bars                                                 */
  /* ---------------------------------------------------------------- */

  const dnaData = [
    { label: "Hit Score", value: artist.avgDhsScore },
    { label: "Spectral Energy", value: artist.avgEnergy },
    {
      label: "Consistency",
      value:
        artist.songs.length > 1
          ? Math.round(
              100 -
                (Math.max(...artist.songs.map((s) => s.dhsScore)) -
                  Math.min(...artist.songs.map((s) => s.dhsScore)))
            )
          : 80,
    },
    {
      label: "Chart Performance",
      value: Math.min(
        100,
        Math.round(
          artist.songs.reduce((sum, s) => sum + Math.min(s.peak, 100), 0) /
            artist.songs.length
        )
      ),
    },
  ];

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

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
          className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${getGradient(artist.name)} flex items-center justify-center mb-3`}
        >
          <span className="text-2xl font-bold text-white">
            {artist.initials}
          </span>
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
          { label: "Tracks", value: String(artist.tracks) },
          { label: "Avg Hit Score", value: `${artist.avgDhsScore}%` },
          { label: "Avg Energy", value: `${artist.avgEnergy}%` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface border border-white/5 rounded-xl p-2.5 text-center"
          >
            <div className="text-base font-bold gradient-text">
              {stat.value}
            </div>
            <div className="text-[9px] text-text-muted/60 mt-0.5">
              {stat.label}
            </div>
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
          {dnaData.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className="text-text-muted/70">{item.label}</span>
                <span className="font-mono text-text-muted">
                  {item.value}%
                </span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-blue"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Similar Artists */}
      {artist.similarArtists.length > 0 && (
        <div>
          <h2 className="text-sm font-bold mb-2">Similar Artists</h2>
          <div className="grid grid-cols-2 gap-2">
            {artist.similarArtists.map((sim) => (
              <Link
                key={sim.slug}
                href={`/app/artist/${sim.slug}`}
                className="bg-surface border border-white/5 rounded-xl p-3 flex items-center gap-2.5 active:bg-white/[0.03] transition-colors"
              >
                <div
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${getGradient(sim.name)} flex items-center justify-center shrink-0`}
                >
                  <span className="text-[10px] font-bold text-white">
                    {sim.initials}
                  </span>
                </div>
                <span className="text-xs font-medium truncate">
                  {sim.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Top DNA Matches */}
      <div>
        <h2 className="text-sm font-bold mb-2">Top DNA Matches</h2>
        <div className="space-y-1.5">
          {artist.songs.slice(0, 5).map((song, i) => (
            <div
              key={song.id}
              className="bg-surface border border-white/5 rounded-xl p-3 flex items-center gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-mono text-accent-purple font-bold">
                  {i + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium truncate">{song.title}</h4>
                <p className="text-[10px] text-text-muted/50 truncate">
                  {song.artist}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div
                  className={`text-xs font-mono ${
                    song.dhsScore >= 90 ? "text-green-400" : "text-accent-purple"
                  }`}
                >
                  Hit: {song.dhsScore}%
                </div>
                <div className="text-[9px] text-text-muted/40">score</div>
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
