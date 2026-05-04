"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Framer-motion variants                                             */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.25 },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

const buttonContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

/* ------------------------------------------------------------------ */
/*  Typing-text component                                              */
/* ------------------------------------------------------------------ */

function TypingText({
  text,
  startDelay = 0,
  speed = 35,
  className,
}: {
  text: string;
  startDelay?: number;
  speed?: number;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let idx = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const startTyping = () => {
      const tick = () => {
        idx += 1;
        setDisplayed(text.slice(0, idx));
        if (idx < text.length) {
          timeout = setTimeout(tick, speed);
        } else {
          setDone(true);
        }
      };
      timeout = setTimeout(tick, speed);
    };

    const delay = setTimeout(startTyping, startDelay);

    return () => {
      clearTimeout(delay);
      clearTimeout(timeout);
    };
  }, [text, startDelay, speed]);

  return (
    <span className={className}>
      {displayed}
      {!done && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{
            repeat: Infinity,
            duration: 0.6,
            ease: "easeOut" as const,
          }}
          className="inline-block w-[2px] h-[1em] bg-accent-purple/70 align-middle ml-0.5 translate-y-[1px]"
        />
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Hero component                                                */
/* ------------------------------------------------------------------ */

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgControls = useAnimation();

  /* Kick off SVG draw animation on mount */
  useEffect(() => {
    svgControls.start("visible");
  }, [svgControls]);

  /* ---- particle canvas (unchanged) ---- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      hue: number;

      constructor(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.hue = Math.random() > 0.5 ? 260 : 220;
      }

      update(w: number, h: number) {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, ${this.opacity})`;
        ctx.fill();
      }
    }

    function resize() {
      const parent = canvas!.parentElement!;
      canvas!.width = parent.clientWidth;
      canvas!.height = parent.clientHeight;
    }

    function init() {
      resize();
      particles = Array.from(
        { length: 30 },
        () => new Particle(canvas!.width, canvas!.height)
      );
    }

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(139, 92, 246, ${0.1 * (1 - dist / 100)})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      particles.forEach((p) => {
        p.update(canvas!.width, canvas!.height);
        p.draw(ctx!);
      });
      drawConnections();
      animationId = requestAnimationFrame(animate);
    }

    init();
    animate();
    const parent = canvas!.parentElement!;
    const observer = new ResizeObserver(resize);
    observer.observe(parent);

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, []);

  /* ---- SVG stroke-draw variants ---- */
  const svgPathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 1.5, ease: "easeOut" as const },
    },
  };

  const svgLineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 1.2, ease: "easeOut" as const, delay: 0.4 },
    },
  };

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-accent-purple/20 rounded-full blur-[80px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent-blue/20 rounded-full blur-[80px] animate-pulse-glow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-cyan/10 rounded-full blur-[100px]" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo mark -- SVG stroke draw animation */}
          <motion.div
            className="mx-auto mb-4 w-20 h-20 relative"
            variants={fadeUpVariants}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="heroLogoGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <motion.path
                d="M25 20h50L35 50h30L25 80"
                stroke="url(#heroLogoGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={svgPathVariants}
                initial="hidden"
                animate={svgControls}
              />
              <motion.line
                x1="50"
                y1="12"
                x2="50"
                y2="88"
                stroke="url(#heroLogoGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                variants={svgLineVariants}
                initial="hidden"
                animate={svgControls}
              />
            </svg>
          </motion.div>

          {/* Heading -- staggered fade-in */}
          <motion.h1
            className="text-4xl font-bold tracking-wider mb-3"
            variants={fadeUpVariants}
          >
            <span className="gradient-text">ZEEKY</span>
          </motion.h1>

          <motion.p
            className="text-base text-text-muted mb-2 tracking-wide"
            variants={fadeUpVariants}
          >
            Entertainment Inc.
          </motion.p>

          {/* Tagline -- typing animation */}
          <motion.p
            className="text-sm text-text-muted/70 max-w-2xl mx-auto mb-8 leading-relaxed"
            variants={fadeUpVariants}
          >
            <TypingText
              text="AI powered music intelligence for the creation, identification, and recommendation of hits"
              startDelay={900}
              speed={35}
            />
          </motion.p>

          {/* CTA buttons -- staggered slide-up entrance */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={buttonContainerVariants}
          >
            <motion.a
              href="/search"
              className="px-8 py-4 text-base bg-gradient-to-r from-accent-purple to-accent-blue rounded-full text-white font-bold tracking-wide hover:opacity-90 transition-opacity glow-purple"
              variants={buttonVariants}
            >
              Search 9,914 Songs by DNA
            </motion.a>
            <motion.a
              href="#ai"
              className="px-6 py-3 text-sm border border-white/10 rounded-full text-foreground font-semibold tracking-wide hover:bg-white/5 transition-colors"
              variants={buttonVariants}
            >
              How It Works
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
