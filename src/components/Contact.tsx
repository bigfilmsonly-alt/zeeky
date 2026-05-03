"use client";

import { motion } from "framer-motion";

const headingVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
      delay: i * 0.15,
    },
  }),
};

const bannerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function Contact() {
  return (
    <section id="contact" className="py-16 px-6 relative">
      <div className="max-w-4xl mx-auto text-center">
        {/* Heading entrance */}
        <motion.h2
          className="text-3xl font-bold mb-3 tracking-wide"
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <span className="gradient-text">GET IN TOUCH</span>
        </motion.h2>
        <motion.p
          className="text-sm text-text-muted mb-8 max-w-2xl mx-auto"
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          Interested in our AI powered music intelligence platform? Reach out to
          learn more about licensing, partnerships, or artist services.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {/* Xavier card */}
          <motion.div
            className="bg-surface border border-white/5 rounded-2xl p-5 transition-colors"
            custom={0}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            whileHover={{
              boxShadow: "0 0 20px 2px rgba(139, 92, 246, 0.25)",
            }}
          >
            <div className="w-12 h-12 mx-auto rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple mb-4">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <path
                  d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle
                  cx="9"
                  cy="7"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <h3 className="font-bold mb-2">Xavier Gauthier</h3>
            <p className="text-sm text-text-muted">Founder, ZEEKY</p>
          </motion.div>

          {/* Email card */}
          <motion.a
            href="mailto:xavzeeky@gmail.com"
            className="bg-surface border border-white/5 rounded-2xl p-5 transition-colors block"
            custom={1}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            whileHover={{
              boxShadow: "0 0 20px 2px rgba(59, 130, 246, 0.25)",
            }}
          >
            <div className="w-12 h-12 mx-auto rounded-xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue mb-4">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <rect
                  x="2"
                  y="4"
                  width="20"
                  height="16"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M22 7l-10 7L2 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 className="font-bold mb-2">Email</h3>
            <p className="text-sm text-accent-blue">xavzeeky@gmail.com</p>
          </motion.a>

          {/* Phone card */}
          <motion.a
            href="tel:+15145465913"
            className="bg-surface border border-white/5 rounded-2xl p-5 transition-colors block"
            custom={2}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            whileHover={{
              boxShadow: "0 0 20px 2px rgba(6, 182, 212, 0.25)",
            }}
          >
            <div className="w-12 h-12 mx-auto rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan mb-4">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <path
                  d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 className="font-bold mb-2">Phone</h3>
            <p className="text-sm text-accent-cyan">+1 (514) 546-5913</p>
          </motion.a>
        </div>

        {/* AI Playlists link */}
        <motion.div
          className="bg-gradient-to-r from-accent-purple/10 via-accent-blue/10 to-accent-cyan/10 border border-white/5 rounded-2xl p-5"
          variants={bannerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <p className="text-text-muted mb-4">
            Check out our AI powered playlist platform
          </p>
          <div className="text-base font-semibold gradient-text">
            aiplaylists.com
          </div>
        </motion.div>
      </div>
    </section>
  );
}
