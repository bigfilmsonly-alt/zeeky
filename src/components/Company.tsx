"use client";

import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
    },
  },
};

const paragraphVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function Company() {
  return (
    <section id="company" className="py-16 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left: Content — fades in from the left */}
          <motion.div
            initial={{ opacity: 0, x: -48 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" as const }}
          >
            <h2 className="text-3xl font-bold mb-4 tracking-wide">
              <span className="gradient-text">THE COMPANY</span>
            </h2>
            <motion.div
              className="space-y-4 text-sm text-text-muted leading-relaxed"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.p variants={paragraphVariants}>
                Zeeky Entertainment Inc. is a music and technology company
                providing innovative solutions for the creation, identification
                and recommendation of hits. ZE operates as a private music label
                that distributes its music through TuneCore.
              </motion.p>
              <motion.p variants={paragraphVariants}>
                ZE has purchased the non exclusive rights for the use of Hitlab
                Inc.&apos;s patented Artificial Intelligence technology intended
                for music recommendation, playlisting and hit potential purposes.
                The Company holds the rights to use, sell, license and market the
                recommendation engine globally.
              </motion.p>
              <motion.p variants={paragraphVariants}>
                Hitlab Inc. applies the latest AI knowledge extraction algorithms
                designed to analyze vast amounts of data quickly and accurately
                to extract meaningful insights and solutions from databases in
                different fields such as music, imagery, health and natural
                resources for prediction purposes.
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Right: Visual — fades in from the right */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 48 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: "easeOut" as const, delay: 0.15 }}
          >
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-surface to-surface-light border border-white/5 overflow-hidden relative">
              {/* Animated cube grid */}
              <div className="absolute inset-0 flex items-center justify-center">
                <CubeGrid />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="section-divider mt-16 max-w-4xl mx-auto" />
    </section>
  );
}

function CubeGrid() {
  const rows = 6;
  const cols = 6;
  return (
    <svg viewBox="0 0 300 300" className="w-3/4 h-3/4 opacity-60">
      <defs>
        <linearGradient id="cubeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {Array.from({ length: rows * cols }, (_, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = col * 45 + 20;
        const y = row * 45 + 20;
        // Distance from center drives the delay, creating a ripple-like stagger
        const cx = (cols - 1) / 2;
        const cy = (rows - 1) / 2;
        const dist = Math.sqrt((col - cx) ** 2 + (row - cy) ** 2);
        const delay = dist * 0.45; // seconds
        const duration = 2.8 + dist * 0.3; // slightly different speed per ring
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width="35"
            height="35"
            rx="4"
            fill="url(#cubeGrad)"
            style={{
              animation: `cube-breathe ${duration}s ease-in-out ${delay}s infinite`,
            }}
          />
        );
      })}
    </svg>
  );
}
