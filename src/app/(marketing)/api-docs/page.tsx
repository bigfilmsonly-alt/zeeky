"use client";

import { useState } from "react";
import Link from "next/link";

const codeExamples = {
  curl: `curl -X POST https://api.zeeky.fm/v1/dna/recommend \\
  -H "Authorization: Bearer zk_live_...your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "seed_track": {
      "title": "Scarface",
      "artist": "Zeeky",
      "isrc": "USRC12345678"
    },
    "limit": 10,
    "min_score": 0.75,
    "filters": {
      "released_after": "2020-01-01",
      "exclude_same_artist": false
    }
  }'`,
  node: `import Zeeky from '@zeeky/sdk';

const zeeky = new Zeeky({
  apiKey: 'zk_live_...your_key',
});

const { recommendations } = await zeeky.dna.recommend({
  seedTrack: {
    title: 'Scarface',
    artist: 'Zeeky',
    isrc: 'USRC12345678',
  },
  limit: 10,
  minScore: 0.75,
  filters: {
    releasedAfter: '2020-01-01',
    excludeSameArtist: false,
  },
});

console.log(recommendations);`,
  python: `from zeeky import Zeeky

client = Zeeky(api_key="zk_live_...your_key")

response = client.dna.recommend(
    seed_track={
        "title": "Scarface",
        "artist": "Zeeky",
        "isrc": "USRC12345678",
    },
    limit=10,
    min_score=0.75,
    filters={
        "released_after": "2020-01-01",
        "exclude_same_artist": False,
    },
)

print(response.recommendations)`,
};

const responseExample = `{
  "request_id": "req_8f3a2b1c",
  "seed": {
    "title": "Scarface",
    "artist": "Zeeky",
    "isrc": "USRC12345678",
    "dna_vector": [84 attributes]
  },
  "recommendations": [
    {
      "rank": 1,
      "title": "Midnight Drip",
      "artist": "Kevo Muney",
      "isrc": "USAT22100234",
      "dna_score": 0.967,
      "shared_attributes": ["dark_timbre", "trap_cadence", "minor_key"],
      "hit_potential": 0.82
    },
    {
      "rank": 2,
      "title": "Ghost Mode",
      "artist": "EST Gee",
      "isrc": "USAT22100891",
      "dna_score": 0.951,
      "shared_attributes": ["bass_heavy", "street_narrative", "808_pattern"],
      "hit_potential": 0.79
    },
    {
      "rank": 3,
      "title": "Pressure",
      "artist": "Rod Wave",
      "isrc": "USAT22200112",
      "dna_score": 0.943,
      "shared_attributes": ["melodic_rap", "emotional_vocal", "slow_build"],
      "hit_potential": 0.91
    },
    // ... 7 more results
  ],
  "meta": {
    "model_version": "dna-v4.2",
    "latency_ms": 47,
    "catalog_size": "108M tracks"
  }
}`;

const endpoints = [
  {
    method: "POST",
    path: "/v1/dna/recommend",
    description: "25 nearest DNA neighbors",
    details:
      "Returns up to 25 tracks with the highest audio-DNA similarity to a seed track. Each result includes a dna_score (0-1), shared audio attributes, and hit potential rating. Supports filtering by release date, genre, territory, and catalog ownership.",
    params: [
      {
        name: "seed_track",
        type: "object",
        required: true,
        desc: "Track identifier (title + artist, ISRC, or internal ID)",
      },
      {
        name: "limit",
        type: "integer",
        required: false,
        desc: "Max results (1-25, default 10)",
      },
      {
        name: "min_score",
        type: "float",
        required: false,
        desc: "Minimum DNA similarity threshold (0-1, default 0.5)",
      },
      {
        name: "filters",
        type: "object",
        required: false,
        desc: "released_after, exclude_same_artist, territories, genres",
      },
    ],
  },
  {
    method: "POST",
    path: "/v1/dna/similar",
    description: "Pairwise similarity score",
    details:
      "Compares two specific tracks and returns a detailed similarity breakdown across all 84 DNA attributes. Ideal for playlist validation, duplicate detection, and editorial curation workflows.",
    params: [
      {
        name: "track_a",
        type: "object",
        required: true,
        desc: "First track identifier",
      },
      {
        name: "track_b",
        type: "object",
        required: true,
        desc: "Second track identifier",
      },
      {
        name: "detail_level",
        type: "string",
        required: false,
        desc: '"summary" | "full" (includes per-attribute scores)',
      },
    ],
  },
  {
    method: "POST",
    path: "/v1/dna/predict_hit",
    description: "Hit potential score",
    details:
      "Analyzes a track's DNA vector against 10 years of Billboard charting data to predict commercial viability. Returns a hit_score (0-1), confidence interval, comparable charting tracks, and recommended release windows.",
    params: [
      {
        name: "track",
        type: "object",
        required: true,
        desc: "Track identifier or raw audio upload",
      },
      {
        name: "market",
        type: "string",
        required: false,
        desc: "Target market: US, UK, GLOBAL (default US)",
      },
      {
        name: "genre_context",
        type: "string",
        required: false,
        desc: "Genre context for benchmarking",
      },
    ],
  },
];

const integrationSteps = [
  {
    step: "01",
    title: "Authenticate",
    description:
      "Request API credentials from your account manager. All requests use Bearer token authentication over TLS 1.3. Keys are scoped to environments (sandbox, staging, production).",
    code: 'Authorization: Bearer zk_live_...your_key',
  },
  {
    step: "02",
    title: "Index Your Catalog",
    description:
      "Submit your catalog via bulk import or streaming ingest. Zeeky processes each track through the 84-attribute DNA pipeline. Average indexing: ~200ms per track. Supports ISRC, UPC, and custom ID mapping.",
    code: "POST /v1/catalog/ingest { tracks: [...] }",
  },
  {
    step: "03",
    title: "Query the Engine",
    description:
      "Call /v1/dna/recommend from your recommendation service. Drop-in replacement for collaborative filtering endpoints. Responses average 47ms P50, <120ms P95.",
    code: "POST /v1/dna/recommend { seed_track, limit }",
  },
  {
    step: "04",
    title: "Stream Feedback",
    description:
      "Send listening events (plays, skips, saves, shares) to the feedback endpoint. The model reweights DNA attributes per-user to improve personalization over time.",
    code: "POST /v1/feedback/event { user_id, track_id, event }",
  },
  {
    step: "05",
    title: "Measure Lift",
    description:
      "Access the analytics dashboard or pull metrics via API. Track session length, skip rate, discovery rate, and retention cohorts. Built-in A/B testing framework included.",
    code: "GET /v1/analytics/lift?period=30d&metric=session_length",
  },
];

const sdks = [
  { name: "Node.js", color: "#68a063" },
  { name: "Python", color: "#3776ab" },
  { name: "Swift", color: "#f05138" },
  { name: "Kotlin", color: "#7f52ff" },
  { name: "Go", color: "#00add8" },
  { name: "Ruby", color: "#cc342d" },
];

type TabKey = keyof typeof codeExamples;

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("curl");
  const [expandedEndpoint, setExpandedEndpoint] = useState<number | null>(0);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#4a90e2]/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#4a90e2]/5 rounded-full blur-[150px]" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-[#9b51e0]/5 rounded-full blur-[150px]" />

        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-16 lg:pt-32 lg:pb-24">
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4a90e2]/10 border border-[#4a90e2]/20 text-xs font-medium text-[#4a90e2]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4a90e2] animate-pulse" />
              API v1 Stable
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#94a3b8]">
              99.95% uptime
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] max-w-4xl">
            A single endpoint.{" "}
            <span className="bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] bg-clip-text text-transparent">
              Drop-in for any DSP.
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-[#94a3b8] max-w-2xl leading-relaxed">
            84 audio-DNA attributes. 108M indexed tracks. Sub-120ms latency.
            Replace collaborative filtering with content-aware intelligence in
            one afternoon.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/book-demo"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Talk to engineering
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
            </Link>
            <a
              href="#endpoints"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-[#94a3b8] font-medium hover:border-white/20 hover:text-white transition-all"
            >
              View endpoints
            </a>
          </div>
        </div>
      </section>

      {/* Live code example */}
      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a1a] overflow-hidden shadow-2xl shadow-black/40">
          {/* Code header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="text-xs text-[#94a3b8]/60 font-mono">
                POST https://api.zeeky.fm/v1/dna/recommend
              </span>
            </div>
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
              {(["curl", "node", "python"] as TabKey[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTab === tab
                      ? "bg-[#4a90e2]/20 text-[#4a90e2]"
                      : "text-[#94a3b8]/60 hover:text-[#94a3b8]"
                  }`}
                >
                  {tab === "node" ? "Node.js" : tab === "python" ? "Python" : "cURL"}
                </button>
              ))}
            </div>
          </div>

          {/* Code content */}
          <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06]">
            {/* Request */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-400 uppercase tracking-wider">
                  Request
                </span>
              </div>
              <pre className="text-sm font-mono text-[#e2e8f0] leading-relaxed overflow-x-auto whitespace-pre">
                {codeExamples[activeTab]}
              </pre>
            </div>

            {/* Response */}
            <div className="p-6 bg-[#080818]">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#4a90e2]/10 text-[#4a90e2] uppercase tracking-wider">
                  Response
                </span>
                <span className="text-[10px] text-[#94a3b8]/40 font-mono">
                  200 OK - 47ms
                </span>
              </div>
              <pre className="text-sm font-mono text-[#e2e8f0]/80 leading-relaxed overflow-x-auto whitespace-pre">
                {responseExample}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section id="endpoints" className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-16">
            <span className="text-xs font-medium text-[#4a90e2] uppercase tracking-widest">
              Endpoints
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
              Three endpoints. Complete intelligence.
            </h2>
            <p className="mt-4 text-[#94a3b8] max-w-xl">
              Everything you need to power discovery, curation, and A&R
              decisions. All endpoints return in under 120ms at P95.
            </p>
          </div>

          <div className="space-y-4">
            {endpoints.map((ep, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/[0.06] bg-[#0a0a1a]/60 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedEndpoint(expandedEndpoint === i ? null : i)
                  }
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-green-500/10 text-green-400 font-mono">
                      {ep.method}
                    </span>
                    <span className="font-mono text-sm text-white">
                      {ep.path}
                    </span>
                    <span className="text-sm text-[#94a3b8]">
                      {ep.description}
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-[#94a3b8]/40 transition-transform shrink-0 ${
                      expandedEndpoint === i ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {expandedEndpoint === i && (
                  <div className="border-t border-white/[0.06] p-6">
                    <p className="text-sm text-[#94a3b8] mb-6 max-w-2xl">
                      {ep.details}
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-[#94a3b8]/60 text-xs uppercase tracking-wider">
                            <th className="pb-3 pr-6 font-medium">
                              Parameter
                            </th>
                            <th className="pb-3 pr-6 font-medium">Type</th>
                            <th className="pb-3 pr-6 font-medium">Required</th>
                            <th className="pb-3 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody className="font-mono">
                          {ep.params.map((p, j) => (
                            <tr
                              key={j}
                              className="border-t border-white/[0.04]"
                            >
                              <td className="py-3 pr-6 text-white">
                                {p.name}
                              </td>
                              <td className="py-3 pr-6 text-[#9b51e0]">
                                {p.type}
                              </td>
                              <td className="py-3 pr-6">
                                {p.required ? (
                                  <span className="text-amber-400">
                                    required
                                  </span>
                                ) : (
                                  <span className="text-[#94a3b8]/40">
                                    optional
                                  </span>
                                )}
                              </td>
                              <td className="py-3 text-[#94a3b8] font-sans">
                                {p.desc}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Guide */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-16">
            <span className="text-xs font-medium text-[#4a90e2] uppercase tracking-widest">
              Integration
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
              Live in five steps
            </h2>
            <p className="mt-4 text-[#94a3b8] max-w-xl">
              Most DSP engineering teams ship a production integration within
              one sprint. Our solutions architects pair with your team through
              launch.
            </p>
          </div>

          <div className="space-y-6">
            {integrationSteps.map((s) => (
              <div
                key={s.step}
                className="group flex flex-col md:flex-row gap-6 md:gap-10 p-6 md:p-8 rounded-xl border border-white/[0.06] bg-[#0a0a1a]/40 hover:border-[#4a90e2]/20 transition-colors"
              >
                <div className="shrink-0">
                  <span className="text-4xl font-bold bg-gradient-to-b from-[#4a90e2] to-[#9b51e0] bg-clip-text text-transparent">
                    {s.step}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
                    {s.description}
                  </p>
                  <code className="inline-block px-3 py-1.5 rounded-md bg-white/5 text-xs font-mono text-[#4a90e2] border border-white/[0.06]">
                    {s.code}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDKs */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-[#4a90e2] uppercase tracking-widest">
              SDKs
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
              First-class SDKs for every stack
            </h2>
            <p className="mt-4 text-[#94a3b8] max-w-lg mx-auto">
              Type-safe, fully documented, and maintained by the Zeeky
              engineering team.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {sdks.map((sdk) => (
              <div
                key={sdk.name}
                className="flex items-center gap-3 px-6 py-3.5 rounded-xl border border-white/[0.06] bg-[#0a0a1a]/60 hover:border-white/[0.12] transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: sdk.color }}
                />
                <span className="text-sm font-medium text-white">
                  {sdk.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance, SLA, Trust */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Compliance */}
            <div className="p-8 rounded-2xl border border-white/[0.06] bg-[#0a0a1a]/40">
              <div className="w-12 h-12 rounded-xl bg-[#4a90e2]/10 flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-[#4a90e2]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Compliance
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-4 h-4 text-green-400 shrink-0"
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
                  <span className="text-sm text-[#94a3b8]">
                    SOC 2 Type II certified
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <svg
                    className="w-4 h-4 text-green-400 shrink-0"
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
                  <span className="text-sm text-[#94a3b8]">
                    GDPR compliant (EU data residency)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <svg
                    className="w-4 h-4 text-green-400 shrink-0"
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
                  <span className="text-sm text-[#94a3b8]">
                    CCPA compliant
                  </span>
                </div>
              </div>
            </div>

            {/* SLA */}
            <div className="p-8 rounded-2xl border border-white/[0.06] bg-[#0a0a1a]/40">
              <div className="w-12 h-12 rounded-xl bg-[#9b51e0]/10 flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-[#9b51e0]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Performance SLA
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] bg-clip-text text-transparent">
                      99.95%
                    </span>
                    <span className="text-sm text-[#94a3b8]">uptime SLA</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] bg-clip-text text-transparent">
                      &lt;120ms
                    </span>
                    <span className="text-sm text-[#94a3b8]">
                      P95 latency
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#94a3b8]/60">
                  Backed by financial credits. Multi-region failover included on
                  Production and Exclusive tiers.
                </p>
              </div>
            </div>

            {/* Infrastructure */}
            <div className="p-8 rounded-2xl border border-white/[0.06] bg-[#0a0a1a]/40">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Infrastructure
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-4 h-4 text-green-400 shrink-0"
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
                  <span className="text-sm text-[#94a3b8]">
                    Dedicated VPC per customer
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <svg
                    className="w-4 h-4 text-green-400 shrink-0"
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
                  <span className="text-sm text-[#94a3b8]">
                    Multi-region (US, EU, APAC)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <svg
                    className="w-4 h-4 text-green-400 shrink-0"
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
                  <span className="text-sm text-[#94a3b8]">
                    TLS 1.3 + encryption at rest
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#4a90e2]/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Ready to upgrade your{" "}
            <span className="bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] bg-clip-text text-transparent">
              recommendation stack
            </span>
            ?
          </h2>
          <p className="mt-6 text-lg text-[#94a3b8] max-w-xl mx-auto">
            Our solutions engineering team will scope your integration, run a
            proof-of-concept on your catalog, and deliver a lift projection
            within two weeks.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/book-demo"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] text-white font-semibold text-lg hover:opacity-90 transition-opacity"
            >
              Talk to engineering
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
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg border border-white/10 text-[#94a3b8] font-medium text-lg hover:border-white/20 hover:text-white transition-all"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
