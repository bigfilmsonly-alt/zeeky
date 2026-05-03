"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const descriptions: Record<string, string> = {
  Tempo: "Beats per minute — the speed and rhythm of the track",
  "Chord Progression": "Sequence of chords — the harmonic structure",
  Range: "Frequency range — spread between lowest and highest notes",
  Pitch: "Perceived frequency — how high or low the sound is",
  "Musical Notes": "Discrete pitch values — the melody's building blocks",
  MFCC: "Mel-frequency cepstral coefficients — captures tonal texture",
  Chroma: "Pitch class profiles — harmonic content independent of octave",
  "Bass Presence": "Low-frequency energy — the weight and power of bass",
  "Bass Variation": "Changes in bass over time — dynamic low-end movement",
  "Instrument Variation": "Diversity of instruments — timbral richness",
  "Melody Variation": "Melodic changes — how the melody evolves",
  "Percussion Variation": "Rhythmic changes — beat pattern diversity",
  "Spectral Variation": "Frequency content changes — tonal movement over time",
  "Spectrum Variation": "Overall spectral flux — how the sound spectrum evolves",
  Rolloff: "Frequency below which 85% of energy lies — brightness measure",
  "Key & Mode": "Musical key and major/minor — the emotional foundation",
};

export default function AttributeTag({ name }: { name: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.span
        className="inline-block px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-text-muted cursor-default"
        whileHover={{
          borderColor: "rgba(139, 92, 246, 0.5)",
          backgroundColor: "rgba(139, 92, 246, 0.1)",
        }}
      >
        {name}
      </motion.span>
      <AnimatePresence>
        {hovered && descriptions[name] && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-xs text-text-muted whitespace-nowrap z-50"
          >
            {descriptions[name]}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-surface-light border-r border-b border-white/10 rotate-45 -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
