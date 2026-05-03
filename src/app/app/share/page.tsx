"use client";

import ShareCard from "@/components/ShareCard";

const sampleData = {
  score: 89,
  trackName: "Scarface",
  artistName: "Zeeky",
  similarArtists: ["Drake", "Future", "21 Savage"],
  dnaAttributes: [
    { name: "Trap Influence", value: 0.92 },
    { name: "Vocal Energy", value: 0.85 },
    { name: "Bass Weight", value: 0.78 },
  ],
};

export default function SharePage() {
  return (
    <div className="flex flex-col items-center py-4 min-h-full">
      <h1 className="text-sm font-bold mb-3 tracking-wide">
        <span className="gradient-text">Share My Score</span>
      </h1>
      <ShareCard
        score={sampleData.score}
        trackName={sampleData.trackName}
        artistName={sampleData.artistName}
        similarArtists={sampleData.similarArtists}
        dnaAttributes={sampleData.dnaAttributes}
      />
    </div>
  );
}
