"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const songs: Record<
  string,
  { artist: string; attributes: Record<string, number> }
> = {
  "Blinding Lights": {
    artist: "The Weeknd",
    attributes: {
      Tempo: 86,
      Energy: 92,
      "Bass Presence": 75,
      "Melody Variation": 68,
      "Instrument Variation": 82,
      Pitch: 71,
      Chroma: 88,
      Rolloff: 79,
    },
  },
  Levitating: {
    artist: "Dua Lipa",
    attributes: {
      Tempo: 78,
      Energy: 85,
      "Bass Presence": 88,
      "Melody Variation": 72,
      "Instrument Variation": 65,
      Pitch: 80,
      Chroma: 74,
      Rolloff: 90,
    },
  },
  Peaches: {
    artist: "Justin Bieber",
    attributes: {
      Tempo: 62,
      Energy: 58,
      "Bass Presence": 82,
      "Melody Variation": 45,
      "Instrument Variation": 70,
      Pitch: 65,
      Chroma: 60,
      Rolloff: 55,
    },
  },
  "Heat Waves": {
    artist: "Glass Animals",
    attributes: {
      Tempo: 70,
      Energy: 64,
      "Bass Presence": 78,
      "Melody Variation": 58,
      "Instrument Variation": 90,
      Pitch: 55,
      Chroma: 82,
      Rolloff: 68,
    },
  },
};

const songNames = Object.keys(songs);

export default function DemoWidget() {
  const [selected, setSelected] = useState(songNames[0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(true);

  const handleSelect = (name: string) => {
    if (name === selected) return;
    setShowResults(false);
    setAnalyzing(true);
    setSelected(name);
    setTimeout(() => {
      setAnalyzing(false);
      setShowResults(true);
    }, 1200);
  };

  const song = songs[selected];
  const hitScore = Math.round(
    Object.values(song.attributes).reduce((a, b) => a + b, 0) /
      Object.keys(song.attributes).length
  );

  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-6 md:p-8">
      <h3 className="text-xl font-bold mb-2">Live Analysis Demo</h3>
      <p className="text-text-muted text-sm mb-6">
        Select a track to see DNA extract and score its audio attributes.
      </p>

      {/* Song selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {songNames.map((name) => (
          <button
            key={name}
            onClick={() => handleSelect(name)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              selected === name
                ? "bg-accent-purple/20 border border-accent-purple/50 text-white"
                : "bg-white/5 border border-white/10 text-text-muted hover:border-white/20"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Analyzing state */}
      <AnimatePresence mode="wait">
        {analyzing && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3 py-12"
          >
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-accent-purple rounded-full"
                  animate={{ height: [12, 32, 12] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
            <span className="text-text-muted text-sm">
              Extracting audio DNA...
            </span>
          </motion.div>
        )}

        {showResults && !analyzing && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div>
                <div className="font-bold">{selected}</div>
                <div className="text-text-muted text-sm">{song.artist}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-xs text-text-muted uppercase tracking-wider">
                  Hit Score
                </div>
                <div className="text-2xl font-bold gradient-text">
                  {hitScore}%
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(song.attributes).map(([attr, value], i) => (
                <div key={attr}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-muted">{attr}</span>
                    <span className="text-white/80 font-mono">{value}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, #8b5cf6, ${value > 75 ? "#06b6d4" : "#3b82f6"})`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.08,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
