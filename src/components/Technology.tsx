"use client";

import { motion } from "framer-motion";
import WaveformBackground from "./technology/WaveformBackground";
import ParticleField from "./technology/ParticleField";
import AnimatedCounter from "./technology/AnimatedCounter";
import AttributeTag from "./technology/AttributeTag";
import SimilarityGraph from "./technology/SimilarityGraph";
import DemoWidget from "./technology/DemoWidget";
import FormulaPlayground from "./technology/FormulaPlayground";
import AudioComparison from "./technology/AudioComparison";
import RadarChart from "./technology/RadarChart";

const attributes = [
  "Tempo",
  "Chord Progression",
  "Range",
  "Pitch",
  "Musical Notes",
  "MFCC",
  "Chroma",
  "Bass Presence",
  "Bass Variation",
  "Instrument Variation",
  "Melody Variation",
  "Percussion Variation",
  "Spectral Variation",
  "Spectrum Variation",
  "Rolloff",
  "Key & Mode",
];

const applications = [
  "Playlist Personalization",
  "Similar Personalization",
  "User/Song Recommendation",
  "User Profiling",
  "Matching & Similarity",
  "User Clustering",
  "Feature Finding",
  "Logical Algebra",
];

const steps = [
  {
    step: "01",
    title: "Extract",
    description:
      "The AI extracts 84 audio attributes from any song using advanced signal processing, creating a unique mathematical signature.",
  },
  {
    step: "02",
    title: "Analyze",
    description:
      "Sound patterns are compared against millions of successful and unsuccessful songs across all genres from the past decade of Billboard hits.",
  },
  {
    step: "03",
    title: "Predict",
    description:
      "Using proximity in Hilbert space, the AI measures the mathematical distance between songs to predict hit potential and find similar tracks.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function Technology() {
  return (
    <section id="technology" className="py-16 px-6 relative overflow-hidden">
      {/* Particle constellation background */}
      <ParticleField />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Heading with waveform */}
        <div className="text-center mb-10 relative">
          <div className="absolute inset-0 -top-8 -bottom-8 overflow-hidden rounded-3xl">
            <WaveformBackground />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6 tracking-wide">
              <span className="gradient-text">AI CORE</span>
            </h2>
            <p className="text-sm text-text-muted max-w-3xl mx-auto leading-relaxed">
              DNA (Digital Nuance Analysis) is the integrated foundational
              software for music recommendation with advanced analysis and
              scoring at the core of this AI.
            </p>
          </div>
        </div>

        {/* How it works — staggered scroll animation */}
        <motion.div
          className="grid md:grid-cols-3 gap-4 mb-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {steps.map((item) => (
            <motion.div
              key={item.step}
              variants={cardVariants}
              className="bg-surface border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-accent-purple/20 transition-colors"
            >
              <div className="absolute top-4 right-4 text-6xl font-bold text-white/[0.03] group-hover:text-white/[0.06] transition-colors">
                {item.step}
              </div>
              <div className="text-sm font-mono text-accent-purple mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-bold mb-3">{item.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Attributes grid with animated counters and tooltips */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-lg font-bold mb-6">
              <AnimatedCounter target={84} /> Extracted Attributes
            </h3>
            <p className="text-text-muted mb-8 leading-relaxed">
              DNA uses musical pattern extraction and state of the art signal
              processing to isolate music attributes and transform them into
              quantifiable mathematical equations. Generation of{" "}
              <span className="text-white font-semibold">
                <AnimatedCounter target={66000} suffix="+" />
              </span>{" "}
              features describing the sound, with selection of 20 features for
              clustering known music.
            </p>
            <div className="flex flex-wrap gap-2">
              {attributes.map((attr) => (
                <AttributeTag key={attr} name={attr} />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-lg font-bold mb-6">Applications</h3>
            <p className="text-text-muted mb-8 leading-relaxed">
              User and music models are represented by a prediction model using
              machine learning where learning is done on song attributes with a
              wide range of applications.
            </p>
            <div className="space-y-3">
              {applications.map((app, i) => (
                <motion.div
                  key={app}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="flex items-center gap-4 p-2 rounded-xl hover:bg-white/[0.02] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 flex items-center justify-center text-xs font-mono text-accent-purple shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <span className="text-sm">{app}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Interactive demos section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h3 className="text-3xl font-bold text-center mb-4">
            <span className="gradient-text">Interactive Demos</span>
          </h3>
          <p className="text-text-muted text-center max-w-2xl mx-auto mb-12">
            Explore how DNA processes, compares, and visualizes music data.
          </p>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Live demo widget */}
            <DemoWidget />

            {/* Radar chart */}
            <RadarChart />

            {/* Similarity graph */}
            <SimilarityGraph />

            {/* Audio comparison */}
            <AudioComparison />
          </div>
        </motion.div>

        {/* Interactive formula */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <FormulaPlayground />
        </motion.div>
      </div>

      <div className="section-divider mt-16 max-w-4xl mx-auto relative z-10" />
    </section>
  );
}
