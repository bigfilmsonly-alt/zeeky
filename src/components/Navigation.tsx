"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const sectionIds = ["company", "label", "ai", "results", "technology", "contact"];

const navLinks = [
  { label: "Company", href: "#company" },
  { label: "Label", href: "#label" },
  { label: "AI", href: "#ai" },
  { label: "Results", href: "#results" },
  { label: "Technology", href: "#technology" },
  { label: "Contact", href: "#contact" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  /* Scroll detection for nav background */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Intersection Observer for active section highlighting */
  const setupObservers = useCallback(() => {
    // The scroll container is .iphone-content, not the window
    const scrollRoot = document.querySelector(".iphone-content");

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry with the highest intersection ratio that is intersecting
        let bestEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
              bestEntry = entry;
            }
          }
        }
        if (bestEntry) {
          setActiveSection(bestEntry.target.id);
        }
      },
      {
        root: scrollRoot,
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    const elements: Element[] = [];
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        elements.push(el);
      }
    }

    return () => {
      for (const el of elements) {
        observer.unobserve(el);
      }
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    // Small delay to ensure DOM is ready and .iphone-content exists
    const timeout = setTimeout(setupObservers, 100);
    return () => clearTimeout(timeout);
  }, [setupObservers]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#050510]/90 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Zeeky" width={32} height={32} className="w-8 h-8 object-contain" />
          <span className="text-xl font-bold tracking-wider gradient-text">
            ZEEKY
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="/search"
            className="px-4 py-1.5 text-sm font-semibold bg-gradient-to-r from-accent-purple to-accent-blue rounded-full text-white hover:opacity-90 transition-opacity tracking-wide"
          >
            DNA Search
          </a>
          {navLinks.map((link) => {
            const sectionId = link.href.replace("#", "");
            const isActive = activeSection === sectionId;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors tracking-wide uppercase ${
                  isActive
                    ? "text-accent-purple font-medium"
                    : "text-text-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground"
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {mobileOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#050510]/95 backdrop-blur-xl border-t border-white/5 px-6 pb-6">
          <a
            href="/search"
            onClick={() => setMobileOpen(false)}
            className="block py-3 text-sm font-bold gradient-text tracking-wide uppercase"
          >
            DNA Song Search
          </a>
          {navLinks.map((link) => {
            const sectionId = link.href.replace("#", "");
            const isActive = activeSection === sectionId;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block py-3 text-sm transition-colors tracking-wide uppercase ${
                  isActive
                    ? "text-accent-purple font-medium"
                    : "text-text-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>
      )}
    </nav>
  );
}

