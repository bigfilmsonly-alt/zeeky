import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import IPhoneFrame from "@/components/IPhoneFrame";
import { PlayerProvider } from "@/lib/player-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZEEKY Entertainment | AI Powered Music Intelligence",
  description:
    "Zeeky Entertainment Inc. is a music and technology company providing innovative AI solutions for the creation, identification and recommendation of hits.",
  keywords: [
    "Zeeky",
    "AI music",
    "hit prediction",
    "music recommendation",
    "DNA technology",
    "digital nuance analysis",
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Zeeky",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#050510",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden">
        <PlayerProvider>
          <IPhoneFrame>{children}</IPhoneFrame>
        </PlayerProvider>
      </body>
    </html>
  );
}
