import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zeeky | Audio-DNA Recommendation Engine for DSPs",
  description:
    "Zeeky is a patented audio-DNA engine that powers smarter discovery and higher retention for streaming platforms. 84 attributes. 100M+ songs. Drop-in API.",
  keywords: [
    "Zeeky",
    "audio DNA",
    "recommendation engine",
    "DSP",
    "music streaming",
    "music recommendation",
    "API",
    "Spotify",
    "Apple Music",
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
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-white text-[#1d1d1f]">
        {children}
      </body>
    </html>
  );
}
