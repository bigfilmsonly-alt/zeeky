"use client";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 pt-4 pb-20 animate-page-in">
      {children}
    </div>
  );
}
