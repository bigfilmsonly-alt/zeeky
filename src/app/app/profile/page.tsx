import Link from "next/link";

const roles = [
  { name: "Listener", active: true, color: "bg-accent-purple" },
  { name: "Artist", active: true, color: "bg-accent-blue" },
  { name: "Streamer", active: false, color: "bg-accent-cyan" },
];

const stats = [
  { label: "Songs Analyzed", value: "127" },
  { label: "Playlists", value: "8" },
  { label: "DNA Matches", value: "342" },
];

const menuItems = [
  { label: "Notifications", icon: "bell" },
  { label: "Audio Quality", icon: "sliders" },
  { label: "Connected Services", icon: "link" },
  { label: "Privacy & Data", icon: "shield" },
  { label: "Help & Support", icon: "help" },
  { label: "About Zeeky", icon: "info" },
];

export default function ProfilePage() {
  return (
    <div className="space-y-5">
      {/* Profile Header */}
      <div className="text-center pt-2">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center mb-2">
          <span className="text-lg font-bold text-white">XG</span>
        </div>
        <h1 className="text-base font-bold">Xavier Gauthier</h1>
        <p className="text-xs text-text-muted/60">@zeeky</p>
        <div className="flex gap-1.5 justify-center mt-2">
          {roles.map((role) => (
            <span
              key={role.name}
              className={`text-[9px] px-2.5 py-0.5 rounded-full ${
                role.active
                  ? `${role.color}/10 text-white border border-white/10`
                  : "bg-white/5 text-text-muted/50"
              }`}
            >
              {role.name}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface border border-white/5 rounded-xl p-2.5 text-center">
            <div className="text-base font-bold gradient-text">{stat.value}</div>
            <div className="text-[9px] text-text-muted/60 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Subscription */}
      <div className="bg-gradient-to-r from-accent-purple/10 via-accent-blue/10 to-accent-cyan/10 border border-white/5 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold">Zeeky Pro</h3>
            <p className="text-[10px] text-text-muted/50 mt-0.5">Unlimited AI analysis</p>
          </div>
          <button className="px-3.5 py-1.5 rounded-xl bg-accent-purple text-white text-xs font-medium">
            Unlock Fan Intel
          </button>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-2.5 p-3 text-left active:bg-white/[0.02] transition-colors ${
              i < menuItems.length - 1 ? "border-b border-white/5" : ""
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              <MenuIcon name={item.icon} />
            </div>
            <span className="text-xs flex-1">{item.label}</span>
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-text-muted/30">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>

      {/* Sign Out */}
      <Link
        href="/"
        className="block w-full py-2.5 text-center text-xs text-text-muted/60 border border-white/5 rounded-xl active:bg-white/[0.02] transition-colors"
      >
        Sign Out
      </Link>

      <p className="text-center text-[9px] text-text-muted/30 pb-2">
        Zeeky Entertainment Inc. &middot; Powered by Hitlab AI
      </p>
    </div>
  );
}

function MenuIcon({ name }: { name: string }) {
  const cls = "w-3.5 h-3.5 text-text-muted/60";
  const props = { viewBox: "0 0 24 24", fill: "none", className: cls } as const;
  const s = { stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "bell":
      return <svg {...props}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 01-3.46 0" {...s} /></svg>;
    case "sliders":
      return <svg {...props}><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" {...s} /></svg>;
    case "link":
      return <svg {...props}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" {...s} /></svg>;
    case "shield":
      return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...s} /></svg>;
    case "help":
      return <svg {...props}><circle cx="12" cy="12" r="10" {...s} /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" {...s} /></svg>;
    case "info":
      return <svg {...props}><circle cx="12" cy="12" r="10" {...s} /><path d="M12 16v-4M12 8h.01" {...s} /></svg>;
    default:
      return null;
  }
}
