"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

/* ===================== Component ===================== */

export default function TabBar() {
  const pathname = usePathname();

  if (!pathname.startsWith("/app")) return null;

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
