"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Animated counter hook – uses IntersectionObserver + rAF           */
/* ------------------------------------------------------------------ */

function useCountUp(
  end: number,
  duration = 2000,
): [React.RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setCount(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [animate]);

  return [ref, count];
}

/* ------------------------------------------------------------------ */
/*  Parse a stat value like "77M+" into { num, suffix }               */
/* ------------------------------------------------------------------ */

function parseStat(value: string): { num: number; suffix: string } {
  const match = value.match(/^(\d+)(.*)$/);
  if (!match) return { num: 0, suffix: value };
  return { num: parseInt(match[1], 10), suffix: match[2] };
}

/* ------------------------------------------------------------------ */
/*  Single animated stat card                                         */
/* ------------------------------------------------------------------ */

function StatCard({ value, label }: { value: string; label: string }) {
  const { num, suffix } = parseStat(value);
  const [ref, count] = useCountUp(num, 2000);

  return (
    <div ref={ref}>
      <div className="text-2xl font-bold gradient-text mb-2">
        {count}
        {suffix}
      </div>
      <div className="text-sm text-text-muted">{label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Framer-motion variants                                            */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const fadeLeftVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const fadeRightVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const tagVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.08,
    transition: { duration: 0.2, ease: "easeOut" as const },
  },
};

/* ------------------------------------------------------------------ */
/*  Label component                                                   */
/* ------------------------------------------------------------------ */

export default function Label() {
  const stats = [
    { value: "10+", label: "Years on TuneCore" },
    { value: "77M+", label: "Views on Pull Up Wit Ah Stick" },
    { value: "10M+", label: "SahBabii Streams" },
    { value: "8M+", label: "Zeeky Views" },
  ];

  return (
    <section id="label" className="py-16 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-4 tracking-wide">
          <span className="gradient-text">THE LABEL</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Content – fade in from the left */}
          <motion.div
            className="space-y-6 text-sm text-text-muted leading-relaxed"
            variants={fadeLeftVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <p>
              The Company has produced a musical song and sound recording
              presently entitled &quot;SCARFACE&quot; performed by the artist
              known as Zeeky aka Xavier Gauthier.
            </p>
            <p>
              ZE has a history with TuneCore for 10 years, and has distributed
              music by various artists such as SahBabii; the label produced the
              music video for the song &quot;Pull Up Wit Ah Stick&quot;, which
              gathered 77 million+ views. SahBabii has over 10 million streams
              on TuneCore, and was subsequently signed with Warner Music Group.
            </p>
            <p>
              ZE is launching an album called &quot;C&apos;est la vie&quot;,
              with the first single titled &quot;Scarface&quot;. The AI engine
              has identified the target market for &quot;Scarface&quot; to be
              same as the audiences of artists such as Lil Uzi Vert, Drake,
              Future, and 21 Savage.
            </p>
          </motion.div>

          {/* Stats grid – staggered cards, fade in from the right */}
          <motion.div
            className="grid grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={cardVariants}
                whileHover={{
                  scale: 1.04,
                  borderColor: "rgba(168,85,247,0.4)",
                  transition: { duration: 0.2, ease: "easeOut" as const },
                }}
                className="bg-surface border border-white/5 rounded-2xl p-4 text-center hover:border-accent-purple/30 transition-colors"
              >
                <StatCard value={stat.value} label={stat.label} />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Album preview */}
        <div className="mt-12 bg-surface border border-white/5 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Album art – scale + glow on hover */}
            <motion.div
              whileHover={{
                scale: 1.06,
                boxShadow: "0 0 24px rgba(168,85,247,0.35)",
                transition: { duration: 0.3, ease: "easeOut" as const },
              }}
              className="w-32 h-32 rounded-xl bg-gradient-to-br from-accent-purple/30 to-accent-blue/30 border border-white/10 flex items-center justify-center shrink-0 cursor-pointer"
            >
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text">CLV</div>
                <div className="text-xs text-text-muted mt-2 tracking-widest uppercase">
                  C&apos;est la vie
                </div>
              </div>
            </motion.div>
            <div>
              <h3 className="text-lg font-bold mb-3">
                C&apos;est la vie
              </h3>
              <p className="text-text-muted leading-relaxed">
                The upcoming album featuring the lead single
                &quot;Scarface&quot; along with &quot;Gold&quot; and more. Each
                track analyzed by our AI engine to identify target markets and
                maximize reach through precision marketing.
              </p>
              <div className="flex gap-3 mt-6">
                <motion.span
                  variants={tagVariants}
                  initial="rest"
                  whileHover="hover"
                  className="px-4 py-1.5 bg-accent-purple/10 border border-accent-purple/20 rounded-full text-xs text-accent-purple cursor-pointer"
                >
                  Hip Hop
                </motion.span>
                <motion.span
                  variants={tagVariants}
                  initial="rest"
                  whileHover="hover"
                  className="px-4 py-1.5 bg-accent-blue/10 border border-accent-blue/20 rounded-full text-xs text-accent-blue cursor-pointer"
                >
                  Trap
                </motion.span>
                <motion.span
                  variants={tagVariants}
                  initial="rest"
                  whileHover="hover"
                  className="px-4 py-1.5 bg-accent-cyan/10 border border-accent-cyan/20 rounded-full text-xs text-accent-cyan cursor-pointer"
                >
                  Pop/R&apos;n&apos;B
                </motion.span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-divider mt-16 max-w-4xl mx-auto" />
    </section>
  );
}
