import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DNA API Reference | Zeeky",
  description:
    "Integrate music intelligence into your platform with the Zeeky DNA API. Search songs, find similar tracks, and browse by genre.",
};

/* ------------------------------------------------------------------ */
/*  Endpoint data                                                      */
/* ------------------------------------------------------------------ */

const endpoints = [
  {
    title: "Search Songs",
    method: "GET",
    path: "/api/dna/search?q={query}&limit=20",
    description: "Returns matching songs from the 50K catalog",
    response: `{
  "results": [
    {
      "id": "trk_8f3a2b1c",
      "title": "Midnight Drip",
      "artist": "Kevo Muney",
      "genre": "Hip-Hop",
      "dna_score": 0.967
    },
    {
      "id": "trk_4d2e9f7a",
      "title": "Ghost Mode",
      "artist": "EST Gee",
      "genre": "Hip-Hop",
      "dna_score": 0.951
    }
  ],
  "total": 47,
  "limit": 20
}`,
  },
  {
    title: "Get Similar Songs",
    method: "GET",
    path: "/api/dna/similars?id={songId}&limit=50",
    description:
      "Returns a song and its closest DNA matches sorted by proximity",
    response: `{
  "seed": {
    "id": "trk_8f3a2b1c",
    "title": "Midnight Drip",
    "artist": "Kevo Muney"
  },
  "similars": [
    {
      "id": "trk_7b1c4e9d",
      "title": "Pressure",
      "artist": "Rod Wave",
      "proximity": 0.943
    },
    {
      "id": "trk_2a5f8c3b",
      "title": "Dark Lane",
      "artist": "Lil Durk",
      "proximity": 0.921
    }
  ],
  "limit": 50
}`,
  },
  {
    title: "Browse by Genre",
    method: "GET",
    path: "/api/dna/genres?genre={genre}&limit=50",
    description:
      "Returns songs filtered by genre, or all genres with counts",
    response: `{
  "genre": "Hip-Hop",
  "songs": [
    {
      "id": "trk_8f3a2b1c",
      "title": "Midnight Drip",
      "artist": "Kevo Muney",
      "dna_score": 0.967
    },
    {
      "id": "trk_4d2e9f7a",
      "title": "Ghost Mode",
      "artist": "EST Gee",
      "dna_score": 0.951
    }
  ],
  "total": 1243,
  "limit": 50
}`,
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-28 px-6">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-[#4a90e2]/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#9b51e0]/8 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#4a90e2] mb-4">
            Developer Documentation
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight gradient-text">
            DNA API Reference
          </h1>
          <p className="text-[#94a3b8] max-w-2xl mx-auto text-lg">
            Integrate music intelligence into your platform
          </p>
        </div>
      </section>

      <div className="section-divider max-w-5xl mx-auto" />

      {/* Endpoint Cards */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {endpoints.map((ep) => (
            <div
              key={ep.title}
              className="bg-surface border border-white/5 rounded-2xl overflow-hidden"
            >
              {/* Card header */}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {ep.title}
                </h3>
                <p className="text-[#94a3b8] mb-4">{ep.description}</p>
                <div className="inline-flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-green-500/10 text-green-400 font-mono">
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono text-[#4a90e2]">
                    {ep.path}
                  </code>
                </div>
              </div>

              {/* Response example */}
              <div className="border-t border-white/5">
                <div className="px-8 py-3 border-b border-white/5">
                  <span className="text-xs uppercase tracking-wider text-[#94a3b8]/60 font-medium">
                    Example Response
                  </span>
                </div>
                <div className="bg-[#0a0a1f] p-6 overflow-x-auto">
                  <pre className="font-mono text-xs text-[#e2e8f0]/80 leading-relaxed whitespace-pre">
                    {ep.response}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider max-w-5xl mx-auto" />

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            Ready to integrate?
          </h2>
          <p className="text-[#94a3b8] mb-8 max-w-lg mx-auto">
            Our engineering team will help you scope and ship your integration
            in under two weeks.
          </p>
          <Link
            href="/book-demo"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Book a Demo
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
