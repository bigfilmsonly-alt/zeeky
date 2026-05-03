"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const headingVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

function AnimatedMarketStat() {
  const ref = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState("$0.00B");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const target = 145.42;
    const duration = 2000;
    let animationId: number;
    let hasAnimated = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            hasAnimated = true;
            const startTime = performance.now();

            const animate = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // ease-out cubic
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = eased * target;
              setDisplayValue(`$${current.toFixed(2)}B`);

              if (progress < 1) {
                animationId = requestAnimationFrame(animate);
              }
            };

            animationId = requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div ref={ref} className="text-3xl font-bold gradient-text mb-4">
      {displayValue}
    </div>
  );
}

export default function AI() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const features = [
    {
      title: "Hit Prediction",
      description:
        "Correlates similarities between new songs and historical Billboard playlists to predict success potential.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <path
            d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: "Target Marketing",
      description:
        "Defines the artist's targeted marketing audience by gender, age, and city for precision ad campaigns.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      ),
    },
    {
      title: "Song DNA Analysis",
      description:
        "Extracts 84 attributes from any song including tempo, chord progression, range, pitch, and musical note combinations.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <path
            d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      title: "Music Recommendation",
      description:
        "Finds songs that hold similar DNA from a database of 50,000+ Billboard hits, recommending songs that actually sound the same.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <path
            d="M9 18V5l12-2v13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
          <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
  ];

  return (
    <section id="ai" className="py-16 px-6 relative" ref={sectionRef}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-10"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >
          <motion.h2
            className="text-3xl font-bold mb-3 tracking-wide"
            variants={headingVariants}
          >
            <span className="gradient-text">THE AI</span>
          </motion.h2>
          <motion.p
            className="text-sm text-text-muted max-w-3xl mx-auto leading-relaxed"
            variants={headingVariants}
          >
            Patented technology that can analyze the DNA of a song to provide
            meaningful statistical data, revolutionizing the way entertainment
            content is discovered, produced and consumed.
          </motion.p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          className="grid md:grid-cols-2 gap-4 mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              className="bg-surface border border-white/5 rounded-2xl p-5 transition-all group"
              variants={cardVariants}
              whileHover={{
                y: -4,
                borderColor: "rgba(168, 85, 247, 0.4)",
                boxShadow: "0 0 20px rgba(168, 85, 247, 0.15)",
                transition: { duration: 0.25, ease: "easeOut" as const },
              }}
            >
              <motion.div
                className="w-12 h-12 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple mb-3 group-hover:bg-accent-purple/20 transition-colors"
                whileHover={{
                  scale: 1.1,
                  transition: {
                    duration: 0.6,
                    ease: "easeOut" as const,
                    repeat: Infinity,
                    repeatType: "reverse" as const,
                  },
                }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-base font-bold mb-3">{feature.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Market stat */}
        <div className="text-center bg-gradient-to-r from-accent-purple/5 via-accent-blue/5 to-accent-cyan/5 border border-white/5 rounded-2xl p-6">
          <AnimatedMarketStat />
          <p className="text-text-muted text-sm">
            Expected global AI in marketing market value by 2032, up from $14.7B
            in 2022
          </p>
        </div>
      </div>

      <div className="section-divider mt-16 max-w-4xl mx-auto" />
    </section>
  );
}
