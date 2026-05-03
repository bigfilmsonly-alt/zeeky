"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const defaultWeights = [
  { label: "Genre", value: 80, color: "#8b5cf6" },
  { label: "Tempo", value: 60, color: "#3b82f6" },
  { label: "Energy", value: 70, color: "#06b6d4" },
  { label: "Melody", value: 50, color: "#a78bfa" },
];

export default function FormulaPlayground() {
  const [weights, setWeights] = useState(defaultWeights);

  const recommendation = Math.round(
    weights.reduce((sum, w) => sum + w.value, 0) / weights.length
  );

  const updateWeight = (index: number, value: number) => {
    setWeights((prev) =>
      prev.map((w, i) => (i === index ? { ...w, value } : w))
    );
  };

  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-5">
      <h3 className="text-base font-bold mb-2 text-center">
        Automatic Attribute Weight
      </h3>
      <p className="text-text-muted text-center max-w-3xl mx-auto mb-8 leading-relaxed">
        DNA calibrates weight automatically by tracking user behavior, feedback,
        and social data. Drag the sliders to see how weights affect recommendations.
      </p>

      {/* Sliders */}
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        {weights.map((w, i) => (
          <div key={w.label}>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-muted">{w.label} weight</span>
              <span className="font-mono" style={{ color: w.color }}>
                {w.value}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={w.value}
              onChange={(e) => updateWeight(i, parseInt(e.target.value))}
              className="w-full accent-accent-purple h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer"
            />
          </div>
        ))}
      </div>

      {/* Live formula */}
      <div className="bg-background rounded-xl p-6 font-mono text-center text-sm md:text-base">
        <div className="text-text-muted mb-3 flex flex-wrap items-center justify-center gap-1">
          {weights.map((w, i) => (
            <span key={w.label}>
              (<span style={{ color: w.color }}>{w.value}</span>
              <span className="text-white/40"> * </span>
              <span className="text-white/60">{w.label.toLowerCase()}</span>)
              {i < weights.length - 1 && (
                <span className="text-white/40"> + </span>
              )}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className="text-white/40">=</span>
          <motion.span
            key={recommendation}
            initial={{ scale: 1.3, color: "#06b6d4" }}
            animate={{ scale: 1, color: "#8b5cf6" }}
            className="text-3xl font-bold"
          >
            {recommendation}%
          </motion.span>
          <span className="text-text-muted text-sm">match score</span>
        </div>
      </div>
    </div>
  );
}
