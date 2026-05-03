"use client";

import { motion } from "framer-motion";

const footerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function Footer() {
  return (
    <motion.footer
      className="border-t border-white/5 py-8 px-6"
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.svg
            viewBox="0 0 100 100"
            className="w-6 h-6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            whileHover={{
              scale: 1.2,
              rotate: 15,
              transition: { duration: 0.3, ease: "easeOut" as const },
            }}
          >
            <defs>
              <linearGradient
                id="footerGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <path
              d="M25 20h50L35 50h30L25 80"
              stroke="url(#footerGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="50"
              y1="15"
              x2="50"
              y2="85"
              stroke="url(#footerGrad)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </motion.svg>
          <span className="text-sm text-text-muted">
            Zeeky Entertainment Inc.
          </span>
        </div>
        <p className="text-xs text-text-muted/60">
          Powered by Hitlab Inc. patented AI technology
        </p>
      </div>
    </motion.footer>
  );
}
