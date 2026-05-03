"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* ─── /app tabs ─── */
const appTabs = [
  { label: "Home", href: "/app" },
  { label: "Discover", href: "/app/discover" },
  { label: "Studio", href: "/app/studio" },
  { label: "Live", href: "/app/live" },
  { label: "Profile", href: "/app/profile" },
];

const appIcons = [
  (a: boolean) => (
    <svg viewBox="0 0 24 24" fill={a ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z" />
    </svg>
  ),
  (a: boolean) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />{a && <circle cx="11" cy="11" r="3" fill="currentColor" stroke="none" />}
    </svg>
  ),
  (a: boolean) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" fill={a ? "currentColor" : "none"} /><circle cx="18" cy="16" r="3" fill={a ? "currentColor" : "none"} />
    </svg>
  ),
  (a: boolean) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.75" y="5.75" width="14.5" height="12.5" rx="3" /><path d="M10 9.5V14.5L15 12L10 9.5Z" fill={a ? "currentColor" : "none"} strokeLinejoin="round" />
    </svg>
  ),
  (a: boolean) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" fill={a ? "currentColor" : "none"} /><path d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6" />
    </svg>
  ),
];

/* ─── /listen tabs ─── */
const listenTabs = [
  { label: "Listen Now", href: "/listen" },
  { label: "Radio", href: "/listen/radio" },
  { label: "Library", href: "/listen/library" },
  { label: "DNA", href: "/listen/dna" },
  { label: "Search", href: "/listen/search" },
];

const listenIcons = [
  /* Listen Now — play-circle */
  (a: boolean) => (
    <svg viewBox="0 0 24 24" fill={a ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="10,8 16,12 10,16" fill={a ? "var(--background)" : "currentColor"} stroke="none" />
    </svg>
  ),
  /* Radio — antenna */
  (a: boolean) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.9 19.1a15 15 0 010-14.2" /><path d="M7.8 16.2a10 10 0 010-8.4" />
      <circle cx="12" cy="12" r="2" fill={a ? "currentColor" : "none"} />
      <path d="M16.2 7.8a10 10 0 010 8.4" /><path d="M19.1 4.9a15 15 0 010 14.2" />
    </svg>
  ),
  /* Library — stack of records */
  (a: boolean) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="6" width="16" height="12" rx="2" fill={a ? "currentColor" : "none"} />
      <line x1="7" y1="3" x2="17" y2="3" strokeWidth="1.5" /><line x1="5.5" y1="4.5" x2="18.5" y2="4.5" strokeWidth="1" opacity="0.5" />
    </svg>
  ),
  /* DNA — double helix */
  (a: boolean) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3c0 4 6 5 6 9s-6 5-6 9" /><path d="M18 3c0 4-6 5-6 9s6 5 6 9" />
      <line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="17" x2="16" y2="17" />
      {a && <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />}
    </svg>
  ),
  /* Search */
  (a: boolean) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
      {a && <circle cx="11" cy="11" r="3" fill="currentColor" stroke="none" />}
    </svg>
  ),
];

/* ===================== Component ===================== */

export default function TabBar() {
  const pathname = usePathname();

  /* /listen routes */
  if (pathname.startsWith("/listen")) {
    return (
      <div className="iphone-tabbar">
        {listenTabs.map((tab, i) => {
          const isActive = tab.href === "/listen"
            ? pathname === "/listen"
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch={true}
              className={`iphone-tab${isActive ? " active" : ""}`}
            >
              {listenIcons[i](isActive)}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    );
  }

  /* /app routes */
  if (pathname.startsWith("/app")) {
    return (
      <div className="iphone-tabbar">
        {appTabs.map((tab, i) => {
          const isActive = tab.href === "/app"
            ? pathname === "/app"
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch={true}
              className={`iphone-tab${isActive ? " active" : ""}`}
            >
              {appIcons[i](isActive)}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    );
  }

  return null;
}
