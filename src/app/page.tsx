"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── TYPES ───
interface Neighbor { t: string; a: string; p: number }
interface Genre { n: string; p: number; c: string }
interface City { n: string; v: string }
interface Market { hit: number; conf: string; demo: string; reach: string; cities: City[] }
interface Sample {
  track: string; artist: string; album: string; score: number; isrc: string;
  indexed: boolean;
  radarPcts: Record<string, number>;
  neighbors: Neighbor[];
  genres: Genre[];
  market: Market;
}
interface PlaylistDef {
  tag: string; tagColor: string; name: string; count: number; duration: string;
  tracks: { t: string; a: string }[];
}

// ─── DATA ───
const SAMPLES: Record<string, Sample> = {
  harlem: {
    track: "Harlem Shake", artist: "Future ft Young Thug", album: "SUPER SLIMEY",
    score: 91, isrc: "USUM71710041", indexed: true,
    radarPcts: { TEMPO: 82, CHROMA: 88, BASS: 94, ROLLOFF: 73, MELODY: 62, PERC: 86, MFCC: 90 },
    neighbors: [
      { t: "Scarface", a: "Zeeky", p: 87.0 },
      { t: "Having Our Way", a: "Migos ft Drake", p: 86.4 },
      { t: "Patek Water", a: "Future ft Young Thug", p: 86.1 },
      { t: "Sup Mate", a: "Young Thug ft Future", p: 85.9 },
      { t: "mop", a: "Gunna, Young Thug", p: 85.4 },
      { t: "Said Sum", a: "Moneybagg Yo", p: 84.7 },
      { t: "Way 2 Sexy", a: "Drake ft Future & Young Thug", p: 84.5 },
      { t: "I'm The Plug", a: "Drake ft Future", p: 84.2 },
      { t: "Petty Too", a: "Lil Durk", p: 83.9 },
      { t: "Glock In My Lap", a: "21 Savage ft Metro Boomin", p: 83.7 },
    ],
    genres: [
      { n: "Trap Rap", p: 42.1, c: "#f5c542" }, { n: "Southern Hip-Hop", p: 25.8, c: "#ff6b6b" },
      { n: "Outliers", p: 14.5, c: "#9b9b9b" }, { n: "Pop Rap", p: 10.3, c: "#7ed957" },
      { n: "Drill", p: 7.3, c: "#4a90e2" },
    ],
    market: { hit: 91, conf: "\u00B13%", demo: "M 18-34", reach: "4.8M", cities: [{ n: "Atlanta", v: "58K" }, { n: "Houston", v: "42K" }, { n: "New York", v: "38K" }, { n: "LA", v: "34K" }, { n: "Chicago", v: "27K" }] },
  },
  having: {
    track: "Having Our Way", artist: "Migos ft Drake", album: "Culture III",
    score: 88, isrc: "USUM72105678", indexed: true,
    radarPcts: { TEMPO: 80, CHROMA: 82, BASS: 89, ROLLOFF: 74, MELODY: 70, PERC: 85, MFCC: 86 },
    neighbors: [
      { t: "Harlem Shake", a: "Future ft Young Thug", p: 86.4 },
      { t: "Scarface", a: "Zeeky", p: 86.1 },
      { t: "Said Sum", a: "Moneybagg Yo", p: 86.0 },
      { t: "Golden Child", a: "Lil Durk", p: 85.7 },
      { t: "What Happened To Virgil", a: "Lil Durk ft Gunna", p: 85.3 },
      { t: "I'm The Plug", a: "Drake ft Future", p: 85.1 },
      { t: "mop", a: "Gunna, Young Thug", p: 84.6 },
      { t: "Wants and Needs", a: "Drake ft Lil Baby", p: 84.2 },
      { t: "Way 2 Sexy", a: "Drake ft Future & Young Thug", p: 83.9 },
      { t: "Knife Talk", a: "Drake ft 21 Savage", p: 83.5 },
    ],
    genres: [
      { n: "Trap Rap", p: 36.8, c: "#f5c542" }, { n: "Pop Rap", p: 24.5, c: "#7ed957" },
      { n: "Southern Hip-Hop", p: 22.1, c: "#ff6b6b" }, { n: "Outliers", p: 10.4, c: "#9b9b9b" },
      { n: "Drill", p: 6.2, c: "#4a90e2" },
    ],
    market: { hit: 88, conf: "\u00B14%", demo: "M 18-34", reach: "4.2M", cities: [{ n: "Atlanta", v: "52K" }, { n: "Los Angeles", v: "38K" }, { n: "Houston", v: "34K" }, { n: "New York", v: "31K" }, { n: "Chicago", v: "25K" }] },
  },
  golden_child: {
    track: "Golden Child", artist: "Lil Durk", album: "The Voice",
    score: 85, isrc: "USAT22100234", indexed: true,
    radarPcts: { TEMPO: 74, CHROMA: 80, BASS: 88, ROLLOFF: 66, MELODY: 72, PERC: 80, MFCC: 84 },
    neighbors: [
      { t: "What Happened To Virgil", a: "Lil Durk ft Gunna", p: 91.2 },
      { t: "Scarface", a: "Zeeky", p: 85.9 },
      { t: "Having Our Way", a: "Migos ft Drake", p: 85.7 },
      { t: "Said Sum", a: "Moneybagg Yo", p: 84.8 },
      { t: "Harlem Shake", a: "Future ft Young Thug", p: 84.1 },
      { t: "poochie gown", a: "Gunna", p: 83.6 },
      { t: "mop", a: "Gunna, Young Thug", p: 83.2 },
      { t: "All My Life", a: "Lil Durk ft J. Cole", p: 82.8 },
      { t: "Broadway Girls", a: "Lil Durk ft Morgan Wallen", p: 82.1 },
      { t: "Ahhh Ha", a: "Lil Durk", p: 81.5 },
    ],
    genres: [
      { n: "Trap Rap", p: 38.1, c: "#f5c542" }, { n: "Southern Hip-Hop", p: 25.6, c: "#ff6b6b" },
      { n: "Drill", p: 16.8, c: "#4a90e2" }, { n: "Pop Rap", p: 12.3, c: "#7ed957" },
      { n: "Outliers", p: 7.2, c: "#9b9b9b" },
    ],
    market: { hit: 85, conf: "\u00B14%", demo: "M 18-29", reach: "3.1M", cities: [{ n: "Chicago", v: "42K" }, { n: "Atlanta", v: "35K" }, { n: "Houston", v: "28K" }, { n: "Los Angeles", v: "24K" }, { n: "New York", v: "21K" }] },
  },
  scarface: {
    track: "Scarface", artist: "Zeeky", album: "C'est la vie",
    score: 87, isrc: "USAT22408391", indexed: false,
    radarPcts: { TEMPO: 78, CHROMA: 84, BASS: 92, ROLLOFF: 71, MELODY: 65, PERC: 82, MFCC: 88 },
    neighbors: [
      { t: "Harlem Shake", a: "Future ft Young Thug", p: 87.0 },
      { t: "Having Our Way", a: "Migos ft Drake", p: 86.1 },
      { t: "Golden Child", a: "Lil Durk", p: 85.9 },
      { t: "Said Sum", a: "Moneybagg Yo", p: 85.0 },
      { t: "What Happened To Virgil", a: "Lil Durk ft Gunna", p: 85.9 },
      { t: "mop", a: "Gunna, Young Thug", p: 84.8 },
      { t: "Sup Mate", a: "Young Thug ft Future", p: 84.8 },
      { t: "poochie gown", a: "Gunna", p: 84.7 },
      { t: "I'm The Plug", a: "Drake ft Future", p: 84.3 },
      { t: "NC-17", a: "Travis Scott", p: 84.1 },
    ],
    genres: [
      { n: "Trap Rap", p: 39.4, c: "#f5c542" }, { n: "Southern Hip-Hop", p: 27.5, c: "#ff6b6b" },
      { n: "Outliers", p: 16.2, c: "#9b9b9b" }, { n: "Pop Rap", p: 9.2, c: "#7ed957" },
      { n: "Drill", p: 7.7, c: "#4a90e2" },
    ],
    market: { hit: 89, conf: "\u00B14%", demo: "M 18-34", reach: "2.4M", cities: [{ n: "Atlanta", v: "32K" }, { n: "Houston", v: "28K" }, { n: "Los Angeles", v: "25K" }, { n: "New York", v: "22K" }, { n: "Chicago", v: "19K" }] },
  },
};

// ─── PLAYLIST GENERATOR ───
function generatePlaylists(s: Sample): PlaylistDef[] {
  const nb = s.neighbors;
  const pureTracks = nb.slice(0, 10).concat(
    nb.slice(0, 10).map(n => ({ t: n.t + " (Remix)", a: n.a, p: n.p - 2 })),
    [{ t: "BACKGROUND", a: "Zeeky", p: 80 }, { t: "Carefree", a: "Zeeky", p: 79 }, { t: "Midnight Sun", a: "DJ Khaled ft Future", p: 78 }, { t: "Lit", a: "Travis Scott", p: 77 }, { t: "On God", a: "Lil Baby", p: 76 }]
  ).slice(0, 25);
  const tempoTracks = nb.filter((_, i) => i % 2 === 0).concat(
    [{ t: "Lifestyle", a: "Young Thug ft Rich Homie Quan", p: 84 }, { t: "Stir Fry", a: "Migos", p: 83 }, { t: "Bad and Boujee", a: "Migos ft Lil Uzi Vert", p: 82 },
     { t: "XO Tour Llif3", a: "Lil Uzi Vert", p: 81 }, { t: "Rockstar", a: "Post Malone ft 21 Savage", p: 80 },
     { t: "HUMBLE.", a: "Kendrick Lamar", p: 79 }, { t: "DNA.", a: "Kendrick Lamar", p: 78 },
     { t: "Praise The Lord", a: "A$AP Rocky ft Skepta", p: 77 }, { t: "Magnolia", a: "Playboi Carti", p: 76 },
     { t: "Drip Too Hard", a: "Lil Baby ft Gunna", p: 75 }]
  ).slice(0, 20);
  const moodTracks = nb.slice(2, 8).concat(
    [{ t: "Come Through", a: "H.E.R. ft Chris Brown", p: 82 }, { t: "Essence", a: "Wizkid ft Tems", p: 81 },
     { t: "Peaches", a: "Justin Bieber", p: 80 }, { t: "Stay", a: "The Kid LAROI ft Justin Bieber", p: 79 },
     { t: "Industry Baby", a: "Lil Nas X ft Jack Harlow", p: 78 }, { t: "Heat Waves", a: "Glass Animals", p: 77 },
     { t: "Levitating", a: "Dua Lipa ft DaBaby", p: 76 }, { t: "Kiss Me More", a: "Doja Cat ft SZA", p: 75 },
     { t: "Good 4 U", a: "Olivia Rodrigo", p: 74 }, { t: "Save Your Tears", a: "The Weeknd", p: 73 },
     { t: "Blinding Lights", a: "The Weeknd", p: 72 }, { t: "MONTERO", a: "Lil Nas X", p: 71 }]
  ).slice(0, 18);
  const genreTracks = [
    { t: "Controlla", a: "Drake", p: 83 }, { t: "One Dance", a: "Drake ft Wizkid", p: 82 },
    { t: "Crew", a: "GoldLink ft Brent Faiyaz", p: 81 }, { t: "Best Part", a: "Daniel Caesar ft H.E.R.", p: 80 },
    ...nb.slice(0, 5),
    { t: "After Hours", a: "The Weeknd", p: 79 }, { t: "Die For You", a: "The Weeknd", p: 78 },
    { t: "Super Gremlin", a: "Kodak Black", p: 77 }, { t: "Wait For U", a: "Future ft Drake & Tems", p: 76 },
    { t: "Pushin P", a: "Gunna ft Future & Young Thug", p: 75 }, { t: "First Class", a: "Jack Harlow", p: 74 },
  ].slice(0, 15);
  const eraTracks = [
    { t: "In Da Club", a: "50 Cent", p: 80 }, { t: "Gin and Juice", a: "Snoop Dogg", p: 79 },
    { t: "Juicy", a: "The Notorious B.I.G.", p: 78 }, { t: "California Love", a: "2Pac", p: 77 },
    ...nb.slice(0, 4),
    { t: "Alright", a: "Kendrick Lamar", p: 76 }, { t: "m.A.A.d city", a: "Kendrick Lamar", p: 75 },
    { t: "Trap Queen", a: "Fetty Wap", p: 74 }, { t: "Panda", a: "Desiigner", p: 73 },
    { t: "Bodak Yellow", a: "Cardi B", p: 72 }, { t: "Lucid Dreams", a: "Juice WRLD", p: 71 },
    { t: "Mo Bamba", a: "Sheck Wes", p: 70 }, { t: "Sicko Mode", a: "Travis Scott", p: 69 },
  ].slice(0, 16);
  const curatorTracks = nb.slice(0, 6).concat(
    [{ t: "God's Plan", a: "Drake", p: 85 }, { t: "Laugh Now Cry Later", a: "Drake ft Lil Durk", p: 84 },
     { t: "Life Is Good", a: "Future ft Drake", p: 83 }, { t: "Wants and Needs", a: "Drake ft Lil Baby", p: 82 },
     { t: "Fair Trade", a: "Drake ft Travis Scott", p: 81 }, { t: "Knife Talk", a: "Drake ft 21 Savage", p: 80 },
     { t: "Jimmy Cooks", a: "Drake ft 21 Savage", p: 79 }, { t: "Rich Flex", a: "Drake & 21 Savage", p: 78 },
     { t: "Spin Bout U", a: "Drake & 21 Savage", p: 77 }, { t: "Search & Rescue", a: "Drake", p: 76 }]
  ).slice(0, 14);

  return [
    { tag: "PURE DNA", tagColor: "#4a90e2", name: "Pure DNA Match", count: pureTracks.length, duration: "1h 22m", tracks: pureTracks.map(t => ({ t: t.t, a: t.a })) },
    { tag: "TEMPO MATCH", tagColor: "#00ff88", name: "Tempo Twins", count: tempoTracks.length, duration: "58m", tracks: tempoTracks.map(t => ({ t: t.t, a: t.a })) },
    { tag: "MOOD", tagColor: "#f5c542", name: "Mood Match", count: moodTracks.length, duration: "52m", tracks: moodTracks.map(t => ({ t: t.t, a: t.a })) },
    { tag: "GENRE BRIDGE", tagColor: "#9b51e0", name: "Genre Cross-Cut", count: genreTracks.length, duration: "44m", tracks: genreTracks.map(t => ({ t: t.t, a: t.a })) },
    { tag: "ERA", tagColor: "#ff6b6b", name: "Era Mix", count: eraTracks.length, duration: "48m", tracks: eraTracks.map(t => ({ t: t.t, a: t.a })) },
    { tag: "EDITORIAL", tagColor: "#6aa9ff", name: "Apple Music Curator Pick", count: curatorTracks.length, duration: "40m", tracks: curatorTracks.map(t => ({ t: t.t, a: t.a })) },
  ];
}

// ─── iTunes CACHES ───
const artCache = new Map<string, string>();
const previewCache = new Map<string, string>();

async function fetchFromItunes(track: string, artist: string): Promise<{ art: string; preview: string }> {
  const key = `${track}|${artist}`;
  if (artCache.has(key) && previewCache.has(key)) {
    return { art: artCache.get(key)!, preview: previewCache.get(key)! };
  }
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(track + " " + artist)}&entity=song&limit=1`);
    const data = await res.json();
    const r = data.results?.[0];
    const art = r?.artworkUrl100?.replace("100x100", "300x300") || "";
    const preview = r?.previewUrl || "";
    if (art) artCache.set(key, art);
    if (preview) previewCache.set(key, preview);
    return { art, preview };
  } catch {
    return { art: "", preview: "" };
  }
}

async function fetchArtwork(track: string, artist: string): Promise<string> {
  const key = `${track}|${artist}`;
  if (artCache.has(key)) return artCache.get(key)!;
  const { art } = await fetchFromItunes(track, artist);
  return art;
}

async function fetchPreview(track: string, artist: string): Promise<string> {
  const key = `${track}|${artist}`;
  if (previewCache.has(key)) return previewCache.get(key)!;
  const { preview } = await fetchFromItunes(track, artist);
  return preview;
}

// ─── COMPONENT ───
export default function ZeekyPage() {
  const [mode, setMode] = useState<"b2b" | "b2c">("b2b");
  const [sampleKey, setSampleKey] = useState("scarface");
  const [sample, setSample] = useState<Sample>(SAMPLES.scarface);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [indexedFlash, setIndexedFlash] = useState(false);
  const [resultsTab, setResultsTab] = useState("playlists");
  const [latency, setLatency] = useState(117);
  const [analyzeStep, setAnalyzeStep] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [genreAnimated, setGenreAnimated] = useState(true);
  const [activeTab, setActiveTab] = useState("demo");
  const [displayScore, setDisplayScore] = useState(87);
  const [artworks, setArtworks] = useState<Record<string, string>>({});
  const [nowPlaying, setNowPlaying] = useState<{ track: string; artist: string } | null>(null);
  const [expandedPlaylist, setExpandedPlaylist] = useState<number | null>(null);
  const [playlists, setPlaylists] = useState<PlaylistDef[]>(() => generatePlaylists(SAMPLES.scarface));

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Init audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.addEventListener("ended", () => { setIsPlaying(false); setProgress(0); });
    audioRef.current.addEventListener("timeupdate", () => {
      const a = audioRef.current!;
      if (a.duration) setProgress((a.currentTime / a.duration) * 100);
    });
    return () => { audioRef.current?.pause(); };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") { e.preventDefault(); toggleAudio(); }
      if (e.code === "Tab") {
        e.preventDefault();
        const tabs = ["playlists", "neighbors", "radar", "genres", "market", "json"];
        const cur = tabs.indexOf(resultsTab);
        setResultsTab(tabs[(cur + 1) % tabs.length]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  // Fetch artworks for current sample's neighbors
  useEffect(() => {
    const allTracks = [
      { t: sample.track, a: sample.artist },
      ...sample.neighbors,
    ];
    allTracks.forEach(({ t, a }) => {
      fetchArtwork(t, a).then(url => {
        if (url) setArtworks(prev => ({ ...prev, [`${t}|${a}`]: url }));
      });
    });
    // Also fetch for playlist tracks (first 4 of each for mosaic)
    const pl = generatePlaylists(sample);
    pl.forEach(p => {
      p.tracks.slice(0, 4).forEach(tr => {
        fetchArtwork(tr.t, tr.a).then(url => {
          if (url) setArtworks(prev => ({ ...prev, [`${tr.t}|${tr.a}`]: url }));
        });
      });
    });
  }, [sample]);

  const showToast = useCallback((text: string) => {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }, []);

  const playTrack = useCallback(async (track: string, artist: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    setNowPlaying({ track, artist });
    showToast(`Loading "${track}"...`);
    const url = await fetchPreview(track, artist);
    if (url) {
      audio.src = url;
      audio.play().catch(() => {});
      setIsPlaying(true);
      setProgress(0);
      showToast(`Now playing: ${track}`);
    } else {
      showToast(`Preview not available for "${track}"`);
    }
  }, [showToast]);

  const toggleAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) { audio.play().catch(() => {}); setIsPlaying(true); }
    else { audio.pause(); setIsPlaying(false); }
  }, []);

  const runAnalysis = useCallback((key: string) => {
    if (isAnalyzing) return;
    const s = SAMPLES[key];
    if (!s) return;
    setSampleKey(key);

    if (s.indexed) {
      // INDEXED path: green flash, instant recall
      setIsAnalyzing(true);
      setShowResults(false);
      setIndexedFlash(true);
      setTimeout(() => {
        setIndexedFlash(false);
        setSample(s);
        setPlaylists(generatePlaylists(s));
        setShowResults(true);
        setIsAnalyzing(false);
        setLatency(22);
        setGenreAnimated(false);
        setTimeout(() => setGenreAnimated(true), 50);
        // Animated score counter
        let frame = 0;
        const target = s.score;
        const dur = 40;
        const counter = setInterval(() => {
          frame++;
          const prog = Math.min(frame / dur, 1);
          const eased = 1 - Math.pow(1 - prog, 3);
          setDisplayScore(Math.round(eased * target));
          if (frame >= dur) clearInterval(counter);
        }, 20);
      }, 400);
    } else {
      // UNRELEASED path: full analyzing animation
      setIsAnalyzing(true);
      setShowResults(false);
      setGenreAnimated(false);
      const steps = [
        "Computing chroma vectors...",
        "Extracting MFCC coefficients...",
        "Mapping to Hilbert space...",
        "Querying 100M-song index...",
        "Ranking by proximity...",
      ];
      let i = 0;
      setAnalyzeStep(steps[0]);
      const iv = setInterval(() => {
        i++;
        if (i < steps.length) setAnalyzeStep(steps[i]);
      }, 280);
      setTimeout(() => {
        clearInterval(iv);
        setSample(s);
        setPlaylists(generatePlaylists(s));
        setShowResults(true);
        setIsAnalyzing(false);
        setLatency(90 + Math.floor(Math.random() * 50));
        setTimeout(() => setGenreAnimated(true), 50);
        let frame = 0;
        const target = s.score;
        const dur = 40;
        const counter = setInterval(() => {
          frame++;
          const prog = Math.min(frame / dur, 1);
          const eased = 1 - Math.pow(1 - prog, 3);
          setDisplayScore(Math.round(eased * target));
          if (frame >= dur) clearInterval(counter);
        }, 20);
      }, 1500);
    }
  }, [isAnalyzing]);

  const getArt = (track: string, artist: string) => artworks[`${track}|${artist}`] || "";

  const radarKeys = Object.keys(sample.radarPcts);
  const radarPoints = radarKeys.map((_, i) => {
    const angle = (i / radarKeys.length) * Math.PI * 2 - Math.PI / 2;
    const r = (Object.values(sample.radarPcts)[i] / 100) * 90;
    return [160 + r * Math.cos(angle), 120 + r * Math.sin(angle)];
  });

  const curTime = Math.floor((progress / 100) * 30);
  const remTime = 30 - curTime;

  const sampleKeys = Object.keys(SAMPLES) as string[];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />

      <div className="app">
        {/* TOPBAR */}
        <div className="topbar">
          <div className="brand">
            <div className="brand-mark"><span>Z</span></div>
            <span>ZEEKY</span>
          </div>
          <div className="status-pill">
            <span className="dot" />
            <span>API &middot; LIVE &middot; 100M</span>
          </div>
          <button className="menu-btn" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>

        {/* HERO */}
        <section className="hero">
          <div className="hero-eyebrow">
            <span className="dot" />
            <span>PATENTED &middot; 84 ATTRIBUTES &middot; 100M SONGS</span>
          </div>
          <h1>The recommendation engine, <em>running live</em> in your browser.</h1>
          <p className="hero-sub">Drop a song. Get the 25 nearest neighbors in 84-dimensional DNA space. The same engine we license to DSPs.</p>
          <div className="audience-toggle">
            <button className={`audience-btn ${mode === "b2b" ? "active" : ""}`} onClick={() => setMode("b2b")}>
              <span className="micro">&#x25B8; FOR DSPs</span><span>License the Engine</span>
            </button>
            <button className={`audience-btn b2c ${mode === "b2c" ? "active" : ""}`} onClick={() => setMode("b2c")}>
              <span className="micro">&#x25B8; FOR LISTENERS</span><span>Try the Player</span>
            </button>
          </div>
        </section>

        {/* DEMO CARD */}
        <div className="demo-card">
          <div className="demo-header">
            <div className="demo-tag"><span className="dot" /><span>LIVE ENGINE &middot; DNA-V3.2</span></div>
            <div className="demo-meta">&#9201; {latency}ms</div>
          </div>
          <div className="input-zone">
            <div className="input-label">&#x25B8; ANALYZE A SEED TRACK</div>
            <div className="input-row">
              <input type="text" placeholder="Paste Spotify URL, ISRC, or song name..." />
              <button className="analyze-btn" onClick={() => runAnalysis(sampleKey)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                Analyze
              </button>
            </div>
            <div className="samples">
              {sampleKeys.map(k => {
                const s = SAMPLES[k];
                return (
                  <button
                    key={k}
                    className={`sample-chip ${sampleKey === k ? "active" : ""} ${s.indexed ? "indexed" : ""}`}
                    onClick={() => runAnalysis(k)}
                  >
                    {s.indexed && <span className="indexed-dot" />}
                    {s.track.length > 14 ? s.track.slice(0, 14) + "..." : s.track}
                  </button>
                );
              })}
            </div>
          </div>

          {/* INDEXED FLASH */}
          {indexedFlash && (
            <div className="indexed-flash">
              <div className="indexed-flash-text">INDEXED &middot; INSTANT RECALL &middot; 22ms</div>
            </div>
          )}

          {/* ANALYZING ANIMATION */}
          {isAnalyzing && !indexedFlash && !sample.indexed && (
            <div className="analyzing">
              <div className="analyzing-bars">
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className="analyzing-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
              <div className="analyzing-text">&#x25B8; EXTRACTING 84 ATTRIBUTES</div>
              <div className="analyzing-step">{analyzeStep}</div>
            </div>
          )}

          {/* RESULTS */}
          {showResults && !isAnalyzing && (
            <div className="results">
              <div className="results-header">
                <div className="results-art">
                  {getArt(sample.track, sample.artist)
                    ? <img src={getArt(sample.track, sample.artist)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
                    : <div className="art-placeholder" />
                  }
                </div>
                <div className="results-meta">
                  <div className="results-track">{sample.track}</div>
                  <div className="results-artist">{sample.artist} &middot; {sample.album}</div>
                  <span className={`results-isrc ${sample.indexed ? "indexed" : "new"}`}>
                    {sample.indexed ? "INDEXED" : "NEW"}
                  </span>
                </div>
                <div className="results-score">
                  <div className="results-score-num">{displayScore}</div>
                  <div className="results-score-label">DNA Match</div>
                </div>
              </div>

              {/* TABS */}
              <div className="results-tabs">
                {["playlists", "neighbors", "radar", "genres", "market", "json"].map(t => (
                  <button
                    key={t}
                    className={`results-tab ${resultsTab === t ? "active" : ""}`}
                    onClick={() => { setResultsTab(t); if (t === "genres") setTimeout(() => setGenreAnimated(true), 50); }}
                  >
                    {t === "playlists" ? <>Playlists <span className="badge">6</span></> :
                     t === "json" ? "API Response" :
                     t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              {/* PLAYLISTS TAB */}
              {resultsTab === "playlists" && (
                <div className="playlists-container">
                  {playlists.map((pl, idx) => (
                    <div key={idx} className={`playlist-card ${expandedPlaylist === idx ? "expanded" : ""}`}>
                      <div className="playlist-head" onClick={() => setExpandedPlaylist(expandedPlaylist === idx ? null : idx)}>
                        <div className="playlist-cover">
                          {pl.tracks.slice(0, 4).map((tr, ti) => (
                            <div key={ti} className="playlist-cover-cell">
                              {getArt(tr.t, tr.a)
                                ? <img src={getArt(tr.t, tr.a)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : <div className="art-placeholder-small" />
                              }
                            </div>
                          ))}
                        </div>
                        <div className="playlist-info">
                          <div className="playlist-tag" style={{ color: pl.tagColor, borderColor: pl.tagColor + "44", background: pl.tagColor + "18" }}>{pl.tag}</div>
                          <div className="playlist-name">{pl.name}</div>
                          <div className="playlist-sub">{pl.count} tracks &middot; {pl.duration}</div>
                        </div>
                        <div className="playlist-chevron">{expandedPlaylist === idx ? "\u25B2" : "\u25BC"}</div>
                      </div>
                      {expandedPlaylist === idx && (
                        <div className="playlist-body">
                          <div className="playlist-tracks">
                            {pl.tracks.map((tr, ti) => (
                              <div key={ti} className="pl-track" onClick={() => playTrack(tr.t, tr.a)}>
                                <div className="pl-track-num">{String(ti + 1).padStart(2, "0")}</div>
                                <div className="pl-track-art">
                                  {getArt(tr.t, tr.a)
                                    ? <img src={getArt(tr.t, tr.a)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : <div className="art-placeholder-tiny" />
                                  }
                                </div>
                                <div className="pl-track-info">
                                  <div className="pl-track-title">{tr.t}</div>
                                  <div className="pl-track-artist">{tr.a}</div>
                                </div>
                                <button className="pl-track-play" onClick={(e) => { e.stopPropagation(); playTrack(tr.t, tr.a); }}>
                                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="playlist-actions">
                            <button className="playlist-action-btn apple-btn" onClick={() => playTrack(pl.tracks[0].t, pl.tracks[0].a)}>
                              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }}><path d="M8 5v14l11-7z" /></svg>
                              Open in Apple Music
                            </button>
                            <button className="playlist-action-btn export-btn" onClick={() => showToast(`Playlist "${pl.name}" exported`)}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                              Export
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* NEIGHBORS TAB */}
              {resultsTab === "neighbors" && (
                <div className="neighbors">
                  {sample.neighbors.map((n, i) => (
                    <div key={i} className="neighbor" onClick={() => playTrack(n.t, n.a)} style={{ cursor: "pointer" }}>
                      <div className="neighbor-rank">
                        {nowPlaying?.track === n.t
                          ? <span style={{ color: "var(--blue-2)" }}>&#9654;</span>
                          : String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="neighbor-art">
                        {getArt(n.t, n.a)
                          ? <img src={getArt(n.t, n.a)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div className="art-placeholder-small" style={{ width: "100%", height: "100%" }} />
                        }
                      </div>
                      <div className="neighbor-info">
                        <div className="neighbor-title" style={nowPlaying?.track === n.t ? { color: "var(--blue-2)" } : undefined}>{n.t}</div>
                        <div className="neighbor-artist">{n.a}</div>
                      </div>
                      <div className="neighbor-bar"><div className="neighbor-bar-fill" style={{ width: `${n.p}%` }} /></div>
                      <div className="neighbor-pct">{n.p.toFixed(1)}%</div>
                      <button className="neighbor-apple" onClick={(e) => { e.stopPropagation(); playTrack(n.t, n.a); }}>
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* RADAR TAB */}
              {resultsTab === "radar" && (
                <div className="radar-wrap">
                  <svg className="radar-svg" viewBox="0 0 320 240">
                    <defs>
                      <radialGradient id="rg" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#9b51e0" stopOpacity="0.1" />
                      </radialGradient>
                    </defs>
                    <g stroke="rgba(255,255,255,0.08)" fill="none">
                      {[100, 75, 50, 25].map(r => <circle key={r} cx="160" cy="120" r={r} />)}
                    </g>
                    <polygon
                      points={radarPoints.map(p => p.join(",")).join(" ")}
                      fill="url(#rg)" stroke="#4a90e2" strokeWidth="1.5"
                    />
                    {radarPoints.map(([x, y], i) => (
                      <circle key={i} cx={x} cy={y} r="3" fill="#4a90e2" />
                    ))}
                    {radarKeys.map((k, i) => {
                      const a = (i / radarKeys.length) * Math.PI * 2 - Math.PI / 2;
                      return (
                        <text key={k} x={160 + 115 * Math.cos(a)} y={120 + 115 * Math.sin(a)}
                          textAnchor="middle" dominantBaseline="middle"
                          fill="rgba(255,255,255,0.65)" fontFamily="JetBrains Mono,monospace" fontSize="9" fontWeight="500">
                          {k}
                        </text>
                      );
                    })}
                  </svg>
                  <div className="radar-legend">
                    {Object.entries(sample.radarPcts).map(([k, v]) => (
                      <div key={k} className="radar-attr">
                        <span className="radar-attr-name">{k}</span>
                        <span className="radar-attr-val">{v}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GENRES TAB */}
              {resultsTab === "genres" && (
                <div className="genres">
                  {sample.genres.map(g => (
                    <div key={g.n} className="genre-bar">
                      <div className="genre-label">{g.n}</div>
                      <div className="genre-bar-track">
                        <div className="genre-bar-fill" style={{
                          width: genreAnimated ? `${g.p}%` : "0",
                          background: g.c,
                          transition: "width 0.8s cubic-bezier(0.2,0.8,0.2,1)"
                        }} />
                      </div>
                      <div className="genre-pct">{g.p}%</div>
                    </div>
                  ))}
                </div>
              )}

              {/* MARKET TAB */}
              {resultsTab === "market" && (
                <div className="market">
                  <div className="market-grid">
                    <div className="market-stat"><div className="market-stat-label">Hit Score</div><div className="market-stat-val">{sample.market.hit}%</div></div>
                    <div className="market-stat"><div className="market-stat-label">Confidence</div><div className="market-stat-val">{sample.market.conf}</div></div>
                    <div className="market-stat"><div className="market-stat-label">Core Demo</div><div className="market-stat-val">{sample.market.demo}</div></div>
                    <div className="market-stat"><div className="market-stat-label">Reach</div><div className="market-stat-val">{sample.market.reach}</div></div>
                  </div>
                  <div className="input-label" style={{ marginTop: 14 }}>&#x25B8; TOP CITIES</div>
                  {sample.market.cities.map((c, i) => (
                    <div key={c.n} className="market-city">
                      <div className="market-city-rank">{i + 1}</div>
                      <div className="market-city-name">{c.n}</div>
                      <div className="market-city-num">{c.v}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* JSON TAB */}
              {resultsTab === "json" && (
                <div className="json-pane">
                  <pre>{`# POST /v1/dna/recommend · 200 OK · ${latency}ms\n{\n  "seed": "${sample.track} — ${sample.artist}",\n  "isrc": "${sample.isrc}",\n  "dna_score": ${(sample.score / 100).toFixed(3)},\n  "playlists_generated": 6,\n  "results": [\n${sample.neighbors.slice(0, 5).map(n => `    { "track": "${n.t}", "artist": "${n.a}", "score": ${(n.p / 100).toFixed(3)} }`).join(",\n")},\n    // + ${sample.neighbors.length - 5} more\n  ],\n  "latency_ms": ${latency},\n  "engine": "dna-v3.2"\n}`}</pre>
                </div>
              )}

              {/* RESULTS FOOTER */}
              <div className="results-footer">
                <button className="footer-btn apple" onClick={() => playTrack(sample.track, sample.artist)}>
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  Play Preview
                </button>
                <button className="footer-btn api" onClick={() => {
                  navigator.clipboard?.writeText(
                    `curl https://api.zeeky.fm/v1/dna/recommend -H "Authorization: Bearer $ZEEKY_KEY" -d '{"seed_track":"isrc:${sample.isrc}","limit":25}'`
                  ).then(() => showToast("API call copied"));
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                  Copy API Call
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ENGINE SECTION */}
        <section className="section" id="engine">
          <div className="section-eyebrow">&#x25B8; THE ENGINE</div>
          <h2 className="section-title">Tags are <em>subjective</em>.<br />DNA is <em>math</em>.</h2>
          <p className="section-sub">DSPs rely on human-tagged metadata to decide what plays next. We extract 84 mathematical attributes from the audio file itself and project every song onto a unit sphere in Hilbert space. Recommendation becomes geometry.</p>
          <div className="pillars">
            <div className="pillar">
              <div className="pillar-label">&#x25B8; INDEX</div>
              <div className="pillar-h">100M songs, fingerprinted.</div>
              <div className="pillar-p">Continuously expanding. Every song ranked by genre, tempo, mood, and Billboard correlation across 84 attributes.</div>
            </div>
            <div className="pillar">
              <div className="pillar-label">&#x25B8; MATCH</div>
              <div className="pillar-h">Proximity in 84-D space.</div>
              <div className="pillar-p">Find the 25 nearest neighbors to any track in &lt;120ms. Distance is the angle between two vectors in Hilbert space.</div>
            </div>
            <div className="pillar">
              <div className="pillar-label">&#x25B8; GENERATE</div>
              <div className="pillar-h">6 playlists per seed.</div>
              <div className="pillar-p">Pure DNA, Tempo, Mood, Genre Cross-Cut, Era Mix, and Curator Pick. Every seed generates six listenable playlists instantly.</div>
            </div>
          </div>
        </section>

        {/* STATS TICKER */}
        <div className="ticker">
          <div className="ticker-stat"><div className="ticker-num">100M+</div><div className="ticker-desc">Indexed Songs</div></div>
          <div className="ticker-stat"><div className="ticker-num">&lt;25ms</div><div className="ticker-desc">Indexed Recall</div></div>
          <div className="ticker-stat"><div className="ticker-num">6</div><div className="ticker-desc">Playlists / Seed</div></div>
          <div className="ticker-stat"><div className="ticker-num">99.97%</div><div className="ticker-desc">Uptime</div></div>
        </div>

        {/* DSP GRID */}
        <section className="section">
          <div className="section-eyebrow">&#x25B8; DEPLOYMENTS</div>
          <h2 className="section-title">Built for the platforms<br />that <em>shape listening</em>.</h2>
          <p className="section-sub">Non-exclusive licensing today. Exclusive acquisition tomorrow.</p>
          <div className="dsp-grid">
            {[
              { name: "Apple Music", meta: "B2C affiliate · revenue active", status: "live" },
              { name: "Tier-1 DSP", meta: "A/B pilot · 2.4M cohort · +18% session", status: "pilot" },
              { name: "Streaming Major", meta: "Technical eval scheduled Q2", status: "queue" },
              { name: "Tidal · YT Music · Amazon", meta: "Outbound in motion", status: "queue" },
            ].map(d => (
              <div key={d.name} className="dsp-card">
                <div className={`dsp-status ${d.status}`} />
                <div className="dsp-info">
                  <div className="dsp-name">{d.name}</div>
                  <div className="dsp-meta">{d.meta}</div>
                </div>
                <div className={`dsp-tag ${d.status}`}>{d.status.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section className="section" id="pricing">
          <div className="section-eyebrow">&#x25B8; LICENSING</div>
          <h2 className="section-title">Three ways to<br /><em>plug us in</em>.</h2>
          <p className="section-sub">Start non-exclusive. Scale to category-exclusive. End at acquisition.</p>
          <div className="pricing-grid">
            <div className="price-card">
              <div className="price-tier">&#x25B8; TIER 01</div>
              <div className="price-name">Pilot</div>
              <div className="price-tagline">Test the engine. Prove the lift. Decide.</div>
              <div className="price-amount">
                <div className="price-num">$25K<span>/mo</span></div>
                <div className="price-per">90-day pilot &middot; 2M API calls</div>
              </div>
              <ul className="price-features">
                <li>1 environment</li>
                <li>A/B dashboard</li>
                <li>Slack support &middot; 24h SLA</li>
              </ul>
              <button className="price-cta" onClick={() => window.location.href = "mailto:partnerships@zeeky.fm?subject=Pilot%20Inquiry"}>Start a Pilot &rarr;</button>
            </div>
            <div className="price-card featured">
              <div className="price-tier">&#x25B8; TIER 02</div>
              <div className="price-name">Production</div>
              <div className="price-tagline">Full deployment. Non-exclusive.</div>
              <div className="price-amount">
                <div className="price-num">$200K<span>/yr+</span></div>
                <div className="price-per">Base + usage above 50M queries</div>
              </div>
              <ul className="price-features">
                <li>Unlimited environments</li>
                <li>SOC 2 Type II</li>
                <li>Dedicated infra &middot; &lt;120ms P95</li>
                <li>Co-marketing rights</li>
                <li>Quarterly model retraining</li>
              </ul>
              <button className="price-cta" onClick={() => window.location.href = "mailto:partnerships@zeeky.fm?subject=Production%20License"}>Talk to Sales &rarr;</button>
            </div>
            <div className="price-card">
              <div className="price-tier">&#x25B8; TIER 03</div>
              <div className="price-name">Exclusive</div>
              <div className="price-tagline">Category lock. The final license before acquisition.</div>
              <div className="price-amount">
                <div className="price-num" style={{ fontSize: 24 }}>Custom</div>
                <div className="price-per">8-figure floor &middot; multi-year</div>
              </div>
              <ul className="price-features">
                <li>Category exclusivity</li>
                <li>Patent licensing rights</li>
                <li>Source code escrow</li>
                <li>First right to acquire</li>
              </ul>
              <button className="price-cta" onClick={() => window.location.href = "mailto:partnerships@zeeky.fm?subject=Exclusive%20Inquiry"}>Inquire Privately &rarr;</button>
            </div>
          </div>
        </section>

        {/* EXIT QUOTE */}
        <section className="section">
          <div className="exit-quote">
            Non-exclusive licensing builds the customer base.<br />
            <em>Exclusive licensing</em> builds the moat.<br />
            Acquisition is the <em>endgame</em>.
          </div>
          <div className="exit-meta">&#x25B8; ZEEKY ENTERTAINMENT INC. &middot; BUILT FOR ACQUISITION</div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="footer-meta">
            &copy; 2026 ZEEKY ENTERTAINMENT INC.<br />
            PATENTED HITLAB AI &middot; LICENSED GLOBALLY<br />
            <span style={{ color: "var(--acid)" }}>&#x25CF;</span> API STATUS: OPERATIONAL
          </div>
        </footer>
      </div>

      {/* STICKY MINI PLAYER */}
      {nowPlaying && (
        <div className="mini-player">
          <div className="mini-player-art">
            {getArt(nowPlaying.track, nowPlaying.artist)
              ? <img src={getArt(nowPlaying.track, nowPlaying.artist)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div className="art-placeholder-tiny" />
            }
          </div>
          <div className="mini-player-info">
            <div className="mini-player-track">{nowPlaying.track}</div>
            <div className="mini-player-artist">{nowPlaying.artist}</div>
          </div>
          <div className="mini-player-progress">
            <div className="mini-player-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <button className="mini-player-btn" onClick={toggleAudio}>
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}>
              {isPlaying ? <path d="M6 4h4v16H6zM14 4h4v16h-4z" /> : <path d="M8 5v14l11-7z" />}
            </svg>
          </button>
        </div>
      )}

      {/* BOTTOM TAB BAR */}
      <div className="tab-bar">
        <button className={`tab-btn ${activeTab === "engine" ? "active" : ""}`} onClick={() => { setActiveTab("engine"); document.getElementById("engine")?.scrollIntoView({ behavior: "smooth" }); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/></svg>
          <span>Engine</span>
        </button>
        <button className={`tab-btn ${activeTab === "demo" ? "active" : ""}`} onClick={() => { setActiveTab("demo"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"/></svg>
          <span>Analyze</span>
        </button>
        <button className={`tab-btn ${activeTab === "playlists" ? "active" : ""}`} onClick={() => { setActiveTab("playlists"); setResultsTab("playlists"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          <span>Playlists</span>
        </button>
        <button className={`tab-btn ${activeTab === "pricing" ? "active" : ""}`} onClick={() => { setActiveTab("pricing"); document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/></svg>
          <span>Pricing</span>
        </button>
        <button className={`tab-btn ${activeTab === "listen" ? "active" : ""}`} onClick={() => { setActiveTab("listen"); if (sample.neighbors.length > 0) playTrack(sample.neighbors[0].t, sample.neighbors[0].a); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none"/></svg>
          <span>Listen</span>
        </button>
      </div>

      {/* TOAST */}
      <div className={`toast ${toast ? "show" : ""}`}>
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        <span>{toast}</span>
      </div>
    </>
  );
}

// ─── CSS ───
const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,system-ui,sans-serif;background:#000;color:#fff;overscroll-behavior-y:none;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;line-height:1.5}
button{font-family:inherit;background:none;border:none;color:inherit;cursor:pointer;outline:none}
input,select,textarea{font-family:inherit;outline:none}
a{color:inherit;text-decoration:none}

:root{
  --bg:#050507;--bg-2:#0a0a14;
  --blue:#4a90e2;--blue-2:#6aa9ff;--blue-glow:rgba(74,144,226,0.4);
  --violet:#9b51e0;
  --apple:#fa233b;
  --acid:#00ff88;
  --gold:#f5c542;
  --line:rgba(255,255,255,0.08);--line-2:rgba(255,255,255,0.14);
  --muted:rgba(255,255,255,0.55);
}

/* ─── APP SHELL ─── */
.app{min-height:100vh;min-height:100dvh;background:radial-gradient(ellipse 80% 40% at 20% 0%,rgba(74,144,226,0.12),transparent 60%),radial-gradient(ellipse 70% 50% at 80% 100%,rgba(155,81,224,0.08),transparent 70%),#050507;overflow-x:hidden}

/* ─── TOPBAR ─── */
.topbar{position:sticky;top:0;z-index:50;background:rgba(5,5,7,0.7);backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid var(--line);padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.brand{display:flex;align-items:center;gap:8px;font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:1px}
.brand-mark{width:22px;height:22px;display:flex;align-items:center;justify-content:center;background:#fff;border-radius:5px}
.brand-mark span{font-family:'Bebas Neue',sans-serif;color:#000;font-size:18px;line-height:1;transform:skewX(-10deg);margin-top:-1px}
.status-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;background:rgba(0,255,136,0.08);border:1px solid rgba(0,255,136,0.25);border-radius:100px;font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--acid);letter-spacing:0.8px;font-weight:600;text-transform:uppercase;white-space:nowrap}
.status-pill .dot{width:5px;height:5px;border-radius:50%;background:var(--acid);box-shadow:0 0 8px var(--acid);animation:pulse 1.6s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.4)}}
.menu-btn{width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center}
.menu-btn:active{transform:scale(0.94)}
.menu-btn svg{width:14px;height:14px}

/* ─── HERO ─── */
.hero{padding:36px 18px 28px;position:relative}
.hero-eyebrow{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;background:rgba(74,144,226,0.1);border:1px solid rgba(74,144,226,0.25);border-radius:100px;font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--blue-2);letter-spacing:1px;font-weight:600;margin-bottom:22px}
.hero-eyebrow .dot{width:5px;height:5px;border-radius:50%;background:var(--blue-2);box-shadow:0 0 6px var(--blue-2);animation:pulse 1.6s ease-in-out infinite}
.hero h1{font-size:38px;font-weight:800;letter-spacing:-1.5px;line-height:1;margin-bottom:18px}
.hero h1 em{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;color:var(--blue-2);letter-spacing:-0.5px}
.hero-sub{font-size:15px;color:rgba(255,255,255,0.7);line-height:1.5;margin-bottom:24px}

/* ─── AUDIENCE TOGGLE ─── */
.audience-toggle{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px;background:rgba(255,255,255,0.04);border:1px solid var(--line);border-radius:14px;margin-bottom:20px}
.audience-btn{padding:11px 8px;border-radius:10px;font-size:13px;font-weight:600;color:var(--muted);transition:all 0.2s ease;display:flex;flex-direction:column;align-items:center;gap:2px}
.audience-btn .micro{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.8px;opacity:0.7}
.audience-btn.active{background:rgba(74,144,226,0.15);color:#fff;box-shadow:0 1px 0 rgba(255,255,255,0.05) inset}
.audience-btn.active.b2c{background:rgba(155,81,224,0.12)}

/* ─── DEMO CARD ─── */
.demo-card{margin:0 18px 32px;border:1px solid rgba(74,144,226,0.25);border-radius:18px;overflow:hidden;background:radial-gradient(ellipse at top right,rgba(74,144,226,0.18),transparent 60%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01));backdrop-filter:blur(10px)}
.demo-header{padding:14px 18px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:10px;background:rgba(0,0,0,0.2)}
.demo-tag{display:inline-flex;align-items:center;gap:6px;font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--blue-2);letter-spacing:1.2px;font-weight:600;text-transform:uppercase}
.demo-tag .dot{width:5px;height:5px;border-radius:50%;background:var(--acid);box-shadow:0 0 8px var(--acid);animation:pulse 1.6s ease-in-out infinite}
.demo-meta{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:0.8px}

/* ─── INPUT ZONE ─── */
.input-zone{padding:18px}
.input-label{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);letter-spacing:1.2px;font-weight:600;text-transform:uppercase;margin-bottom:8px}
.input-row{display:flex;gap:8px;background:rgba(0,0,0,0.4);border:1px solid var(--line-2);border-radius:12px;padding:4px 4px 4px 12px;transition:border-color 0.2s ease}
.input-row:focus-within{border-color:var(--blue)}
.input-row input{flex:1;background:transparent;border:none;color:#fff;font-size:14px;padding:10px 0;min-width:0}
.input-row input::placeholder{color:rgba(255,255,255,0.35)}
.analyze-btn{padding:0 16px;background:linear-gradient(135deg,var(--blue),var(--violet));border-radius:9px;font-size:13px;font-weight:700;letter-spacing:-0.1px;color:#fff;display:flex;align-items:center;gap:6px;flex-shrink:0;transition:transform 0.15s ease}
.analyze-btn:active{transform:scale(0.96)}
.analyze-btn svg{width:12px;height:12px}

/* ─── SAMPLE CHIPS ─── */
.samples{margin-top:14px;display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none}
.samples::-webkit-scrollbar{display:none}
.sample-chip{flex-shrink:0;padding:6px 12px;background:rgba(255,255,255,0.05);border:1px solid var(--line);border-radius:100px;font-size:11px;font-weight:500;color:rgba(255,255,255,0.75);display:flex;align-items:center;gap:6px;transition:all 0.15s ease;white-space:nowrap}
.sample-chip:active{transform:scale(0.96)}
.sample-chip.active{background:rgba(74,144,226,0.15);border-color:rgba(74,144,226,0.4);color:#fff}
.sample-chip.indexed{border-color:rgba(0,255,136,0.3)}
.sample-chip.indexed.active{border-color:rgba(0,255,136,0.5);background:rgba(0,255,136,0.08)}
.indexed-dot{width:5px;height:5px;border-radius:50%;background:var(--acid);box-shadow:0 0 6px var(--acid);flex-shrink:0}

/* ─── INDEXED FLASH ─── */
.indexed-flash{padding:28px 20px;text-align:center;border-top:1px solid var(--line);background:rgba(0,255,136,0.08);animation:flashIn 0.4s ease}
.indexed-flash-text{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--acid);letter-spacing:1.4px;font-weight:700;text-transform:uppercase}
@keyframes flashIn{0%{background:rgba(0,255,136,0.25)}100%{background:rgba(0,255,136,0.08)}}

/* ─── ANALYZING ─── */
.analyzing{padding:28px 20px;text-align:center;border-top:1px solid var(--line)}
.analyzing-bars{display:flex;gap:3px;justify-content:center;height:32px;align-items:end;margin-bottom:14px}
.analyzing-bar{width:4px;background:linear-gradient(180deg,var(--blue),var(--violet));border-radius:2px;animation:barPulse 1.2s ease-in-out infinite}
@keyframes barPulse{0%,100%{height:8px;opacity:0.4}50%{height:32px;opacity:1}}
.analyzing-text{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--blue-2);letter-spacing:1px;margin-bottom:4px}
.analyzing-step{font-size:11px;color:var(--muted)}

/* ─── RESULTS ─── */
.results{border-top:1px solid var(--line)}
.results-header{padding:18px 18px 14px;display:flex;align-items:center;gap:12px}
.results-art{width:56px;height:56px;border-radius:8px;overflow:hidden;flex-shrink:0;box-shadow:0 4px 14px rgba(0,0,0,0.4)}
.results-meta{flex:1;min-width:0}
.results-track{font-size:16px;font-weight:700;letter-spacing:-0.3px;margin-bottom:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.results-artist{font-size:13px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:4px}
.results-isrc{font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;letter-spacing:1px;padding:2px 7px;border-radius:4px;text-transform:uppercase}
.results-isrc.indexed{background:rgba(0,255,136,0.12);color:var(--acid);border:1px solid rgba(0,255,136,0.3)}
.results-isrc.new{background:rgba(245,197,66,0.12);color:var(--gold);border:1px solid rgba(245,197,66,0.3)}
.results-score{text-align:right;flex-shrink:0}
.results-score-num{font-size:24px;font-weight:800;letter-spacing:-1px;color:var(--blue-2);font-variant-numeric:tabular-nums;line-height:1}
.results-score-label{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--muted);letter-spacing:0.8px;text-transform:uppercase;margin-top:2px}

/* ─── RESULTS TABS ─── */
.results-tabs{display:flex;padding:0 18px;gap:14px;border-bottom:1px solid var(--line);overflow-x:auto;scrollbar-width:none}
.results-tabs::-webkit-scrollbar{display:none}
.results-tab{padding:10px 0 12px;font-size:12px;font-weight:600;color:var(--muted);border-bottom:2px solid transparent;transition:all 0.2s ease;flex-shrink:0;position:relative;top:1px;display:flex;align-items:center;gap:5px}
.results-tab.active{color:#fff;border-bottom-color:var(--blue)}
.badge{font-family:'JetBrains Mono',monospace;font-size:9px;background:rgba(74,144,226,0.2);color:var(--blue-2);padding:1px 5px;border-radius:4px;font-weight:700}

/* ─── PLAYLISTS ─── */
.playlists-container{padding:10px 14px 14px}
.playlist-card{border:1px solid var(--line);border-radius:14px;overflow:hidden;margin-bottom:10px;background:rgba(255,255,255,0.02);transition:border-color 0.2s}
.playlist-card.expanded{border-color:rgba(74,144,226,0.3)}
.playlist-head{display:flex;align-items:center;gap:12px;padding:12px 14px;cursor:pointer;transition:background 0.15s}
.playlist-head:hover{background:rgba(255,255,255,0.03)}
.playlist-cover{width:48px;height:48px;border-radius:8px;overflow:hidden;flex-shrink:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:1px;background:rgba(255,255,255,0.06)}
.playlist-cover-cell{overflow:hidden}
.playlist-info{flex:1;min-width:0}
.playlist-tag{font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;letter-spacing:1px;padding:2px 6px;border-radius:3px;border:1px solid;display:inline-block;margin-bottom:3px;text-transform:uppercase}
.playlist-name{font-size:13px;font-weight:700;letter-spacing:-0.2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.playlist-sub{font-size:10px;color:var(--muted);font-family:'JetBrains Mono',monospace;letter-spacing:0.3px}
.playlist-chevron{font-size:10px;color:var(--muted);flex-shrink:0;width:20px;text-align:center}
.playlist-body{border-top:1px solid var(--line);background:rgba(0,0,0,0.15)}
.playlist-tracks{max-height:300px;overflow-y:auto;scrollbar-width:none}
.playlist-tracks::-webkit-scrollbar{display:none}
.pl-track{display:flex;align-items:center;gap:8px;padding:8px 14px;border-bottom:0.5px solid rgba(84,84,88,0.2);cursor:pointer;transition:background 0.1s}
.pl-track:hover{background:rgba(255,255,255,0.03)}
.pl-track:last-child{border-bottom:none}
.pl-track-num{width:18px;font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted);text-align:right;flex-shrink:0}
.pl-track-art{width:32px;height:32px;border-radius:4px;overflow:hidden;flex-shrink:0}
.pl-track-info{flex:1;min-width:0}
.pl-track-title{font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pl-track-artist{font-size:10px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pl-track-play{width:26px;height:26px;background:linear-gradient(135deg,var(--blue),var(--violet));border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;transition:transform 0.15s}
.pl-track-play:active{transform:scale(0.9)}
.pl-track-play svg{width:12px;height:12px}
.playlist-actions{display:flex;gap:8px;padding:10px 14px;border-top:1px solid var(--line)}
.playlist-action-btn{flex:1;padding:9px;border-radius:8px;font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;transition:transform 0.15s}
.playlist-action-btn:active{transform:scale(0.97)}
.apple-btn{background:linear-gradient(135deg,var(--blue),var(--violet));color:#fff;box-shadow:0 3px 10px rgba(74,144,226,0.25)}
.export-btn{background:rgba(74,144,226,0.12);border:1px solid rgba(74,144,226,0.3);color:var(--blue-2)}

/* ─── NEIGHBORS ─── */
.neighbors{padding:6px 0 14px}
.neighbor{display:flex;align-items:center;gap:10px;padding:10px 18px;border-bottom:0.5px solid rgba(84,84,88,0.3)}
.neighbor:last-child{border-bottom:none}
.neighbor-rank{width:18px;font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);text-align:right;flex-shrink:0;font-weight:500}
.neighbor-art{width:38px;height:38px;border-radius:5px;overflow:hidden;flex-shrink:0}
.neighbor-info{flex:1;min-width:0}
.neighbor-title{font-size:13px;font-weight:600;letter-spacing:-0.1px;margin-bottom:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.neighbor-artist{font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.neighbor-bar{width:32px;height:3px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;flex-shrink:0}
.neighbor-bar-fill{height:100%;background:linear-gradient(90deg,var(--blue),var(--violet))}
.neighbor-pct{font-family:'JetBrains Mono',monospace;font-size:11px;color:#fff;font-weight:600;width:38px;text-align:right;flex-shrink:0;font-variant-numeric:tabular-nums}
.neighbor-apple{width:30px;height:30px;background:linear-gradient(135deg,var(--blue),var(--violet));border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;box-shadow:0 2px 6px rgba(74,144,226,0.25);transition:transform 0.15s ease}
.neighbor-apple:active{transform:scale(0.92)}
.neighbor-apple svg{width:13px;height:13px}

/* ─── RADAR ─── */
.radar-wrap{padding:14px}
.radar-svg{width:100%;height:auto;display:block}
.radar-legend{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:0 6px 8px;margin-top:6px}
.radar-attr{display:flex;justify-content:space-between;align-items:center;font-family:'JetBrains Mono',monospace;font-size:10px;padding:5px 8px;background:rgba(255,255,255,0.03);border-radius:6px}
.radar-attr-name{color:var(--muted);letter-spacing:0.5px}
.radar-attr-val{color:var(--blue-2);font-weight:600}

/* ─── GENRES ─── */
.genres{padding:14px 18px}
.genre-bar{display:grid;grid-template-columns:90px 1fr 44px;gap:10px;align-items:center;margin-bottom:10px}
.genre-bar:last-child{margin-bottom:0}
.genre-label{font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.genre-bar-track{height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden}
.genre-bar-fill{height:100%;border-radius:3px}
.genre-pct{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;color:#fff;text-align:right;font-variant-numeric:tabular-nums}

/* ─── MARKET ─── */
.market{padding:14px 18px}
.market-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
.market-stat{background:rgba(255,255,255,0.03);border:0.5px solid var(--line);border-radius:10px;padding:10px 12px}
.market-stat-label{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:0.8px;margin-bottom:4px;text-transform:uppercase}
.market-stat-val{font-size:18px;font-weight:700;letter-spacing:-0.4px;font-variant-numeric:tabular-nums}
.market-city{display:grid;grid-template-columns:14px 1fr 50px;gap:8px;align-items:center;padding:7px 0;border-bottom:0.5px solid rgba(84,84,88,0.2);font-size:12px}
.market-city:last-child{border-bottom:none}
.market-city-rank{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted)}
.market-city-name{font-weight:500}
.market-city-num{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--blue-2);text-align:right;font-weight:600}

/* ─── JSON ─── */
.json-pane{padding:14px 18px}
.json-pane pre{background:rgba(0,0,0,0.4);border:1px solid var(--line);border-radius:10px;padding:14px;color:rgba(255,255,255,0.75);overflow-x:auto;font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.5;white-space:pre-wrap;word-break:break-all}

/* ─── RESULTS FOOTER ─── */
.results-footer{padding:14px 18px;border-top:1px solid var(--line);display:flex;gap:8px;background:rgba(0,0,0,0.2)}
.footer-btn{flex:1;padding:11px;border-radius:10px;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;transition:transform 0.15s ease}
.footer-btn:active{transform:scale(0.97)}
.footer-btn.apple{background:linear-gradient(135deg,var(--blue),var(--violet));color:#fff;box-shadow:0 4px 12px rgba(74,144,226,0.25)}
.footer-btn.api{background:rgba(74,144,226,0.12);border:1px solid rgba(74,144,226,0.3);color:var(--blue-2)}
.footer-btn svg{width:13px;height:13px;flex-shrink:0}

/* ─── ART PLACEHOLDERS ─── */
.art-placeholder{width:100%;height:100%;background:linear-gradient(135deg,#1a1a2e,#0a0a14);border-radius:8px}
.art-placeholder-small{width:100%;height:100%;background:linear-gradient(135deg,#1a1a2e,#2a0a2a);border-radius:4px}
.art-placeholder-tiny{width:100%;height:100%;background:linear-gradient(135deg,#0a0a14,#1a0a2e);border-radius:3px}

/* ─── SECTION ─── */
.section{padding:48px 18px;border-top:1px solid var(--line)}
.section-eyebrow{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--blue-2);letter-spacing:1.4px;font-weight:600;text-transform:uppercase;margin-bottom:14px;display:flex;align-items:center;gap:8px}
.section-eyebrow::before{content:'';width:14px;height:1px;background:var(--blue-2)}
.section-title{font-size:30px;font-weight:800;letter-spacing:-1.2px;line-height:1.05;margin-bottom:14px}
.section-title em{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;color:var(--blue-2)}
.section-sub{font-size:14px;color:rgba(255,255,255,0.6);line-height:1.5;margin-bottom:24px}

/* ─── PILLARS ─── */
.pillars{display:grid;gap:10px}
.pillar{padding:18px;background:rgba(255,255,255,0.03);border:1px solid var(--line);border-radius:14px}
.pillar-label{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--blue-2);letter-spacing:1.2px;font-weight:600;margin-bottom:10px}
.pillar-h{font-size:16px;font-weight:700;letter-spacing:-0.2px;margin-bottom:6px}
.pillar-p{font-size:13px;color:rgba(255,255,255,0.6);line-height:1.5}

/* ─── TICKER ─── */
.ticker{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;padding:0 18px 32px;margin-top:-16px}
.ticker-stat{padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid var(--line);border-radius:10px}
.ticker-num{font-size:18px;font-weight:800;letter-spacing:-0.5px;font-variant-numeric:tabular-nums;line-height:1.1}
.ticker-desc{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--muted);letter-spacing:0.8px;text-transform:uppercase;margin-top:3px}

/* ─── DSP GRID ─── */
.dsp-grid{display:grid;gap:8px}
.dsp-card{padding:14px 16px;background:rgba(255,255,255,0.02);border:1px solid var(--line);border-radius:12px;display:flex;align-items:center;gap:12px}
.dsp-status{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.dsp-status.live{background:var(--acid);box-shadow:0 0 8px var(--acid);animation:pulse 1.6s ease-in-out infinite}
.dsp-status.pilot{background:#ffaa3a;box-shadow:0 0 8px rgba(255,170,58,0.6)}
.dsp-status.queue{background:rgba(255,255,255,0.3)}
.dsp-info{flex:1;min-width:0}
.dsp-name{font-size:14px;font-weight:700;letter-spacing:-0.2px}
.dsp-meta{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);letter-spacing:0.5px;margin-top:2px}
.dsp-tag{font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;letter-spacing:0.8px;flex-shrink:0;padding:4px 8px;border-radius:4px}
.dsp-tag.live{background:rgba(0,255,136,0.12);color:var(--acid)}
.dsp-tag.pilot{background:rgba(255,170,58,0.12);color:#ffaa3a}
.dsp-tag.queue{background:rgba(255,255,255,0.06);color:var(--muted)}

/* ─── PRICING ─── */
.pricing-grid{display:grid;gap:12px}
.price-card{padding:20px;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,0.02);position:relative}
.price-card.featured{border-color:rgba(74,144,226,0.4);background:radial-gradient(ellipse at top,rgba(74,144,226,0.12),transparent 70%),rgba(255,255,255,0.04)}
.price-card.featured::before{content:'MOST DEPLOYED';position:absolute;top:14px;right:14px;font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:1px;color:var(--blue-2);background:rgba(74,144,226,0.15);padding:3px 7px;border-radius:4px;font-weight:700}
.price-tier{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.2px;color:var(--muted);text-transform:uppercase;margin-bottom:8px;font-weight:600}
.price-name{font-size:22px;font-weight:800;letter-spacing:-0.5px;margin-bottom:4px}
.price-tagline{font-size:12px;color:rgba(255,255,255,0.55);margin-bottom:16px;line-height:1.4}
.price-amount{margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid var(--line)}
.price-num{font-size:32px;font-weight:800;letter-spacing:-1.5px;line-height:1}
.price-num span{font-size:13px;font-weight:500;color:var(--muted);letter-spacing:0}
.price-per{font-size:11px;color:var(--muted);margin-top:4px}
.price-features{list-style:none;margin-bottom:18px;display:flex;flex-direction:column;gap:8px}
.price-features li{font-size:12px;color:rgba(255,255,255,0.75);display:flex;align-items:flex-start;gap:8px;line-height:1.4}
.price-features li::before{content:'';width:13px;height:13px;background:rgba(74,144,226,0.15);border-radius:50%;flex-shrink:0;margin-top:2px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234a90e2'%3E%3Cpath d='M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z'/%3E%3C/svg%3E");background-size:9px;background-position:center;background-repeat:no-repeat}
.price-cta{width:100%;padding:11px;border-radius:100px;background:rgba(255,255,255,0.06);border:1px solid var(--line-2);color:#fff;font-size:12px;font-weight:600;transition:all 0.2s}
.price-cta:active{transform:scale(0.97)}
.price-card.featured .price-cta{background:var(--blue);border-color:var(--blue)}

/* ─── EXIT QUOTE ─── */
.exit-quote{font-family:'Instrument Serif',serif;font-size:24px;line-height:1.3;letter-spacing:-0.5px;margin-bottom:18px;font-weight:400;text-align:center}
.exit-quote em{font-style:italic;color:var(--blue-2)}
.exit-meta{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);letter-spacing:1.2px;text-transform:uppercase;text-align:center}

/* ─── FOOTER ─── */
footer{padding:32px 18px 100px;border-top:1px solid var(--line);background:#000}
.footer-meta{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:0.8px;text-align:center;line-height:1.7}

/* ─── BOTTOM TAB BAR ─── */
.tab-bar{position:fixed;bottom:0;left:0;right:0;z-index:90;display:flex;justify-content:space-around;align-items:flex-start;padding:8px 4px 6px;background:rgba(5,5,7,0.92);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-top:0.5px solid rgba(255,255,255,0.08);max-width:520px;margin:0 auto}
.tab-btn{display:flex;flex-direction:column;align-items:center;gap:2px;padding:2px 0;min-width:0;color:rgba(255,255,255,0.35);background:none;border:none;cursor:pointer;font-size:9px;font-weight:600;letter-spacing:0.3px;transition:color 0.2s;-webkit-tap-highlight-color:transparent;font-family:'JetBrains Mono',monospace}
.tab-btn svg{width:20px;height:20px;transition:transform 0.2s}
.tab-btn:hover{color:rgba(255,255,255,0.6)}
.tab-btn.active{color:var(--blue-2)}
.tab-btn.active svg{transform:scale(1.1)}

/* ─── MINI PLAYER ─── */
.mini-player{position:fixed;bottom:56px;left:0;right:0;z-index:100;background:rgba(5,5,7,0.94);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid var(--line);padding:8px 14px;display:flex;align-items:center;gap:10px;max-width:520px;margin:0 auto}
.mini-player-art{width:40px;height:40px;border-radius:6px;overflow:hidden;flex-shrink:0}
.mini-player-info{flex:1;min-width:0}
.mini-player-track{font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mini-player-artist{font-size:10px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mini-player-progress{position:absolute;top:-2px;left:0;right:0;height:2px;background:rgba(255,255,255,0.1)}
.mini-player-progress-fill{height:100%;background:linear-gradient(90deg,var(--blue),var(--violet));transition:width 0.3s linear}
.mini-player-btn{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform 0.15s}
.mini-player-btn:active{transform:scale(0.9)}

/* ─── TOAST ─── */
.toast{position:fixed;top:62px;left:50%;transform:translateX(-50%) translateY(-100px);background:linear-gradient(135deg,var(--blue),var(--violet));color:#fff;padding:10px 18px;border-radius:100px;font-size:12px;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(74,144,226,0.4);transition:transform 0.3s cubic-bezier(0.32,0.72,0,1);display:flex;align-items:center;gap:8px;white-space:nowrap;max-width:calc(100vw - 36px)}
.toast.show{transform:translateX(-50%) translateY(0)}
.toast svg{width:14px;height:14px;flex-shrink:0}

/* ─── DESKTOP ─── */
@media(min-width:720px){
  .app{max-width:520px;margin:0 auto;box-shadow:0 0 100px rgba(74,144,226,0.1);border-left:1px solid var(--line);border-right:1px solid var(--line)}
  .ticker{grid-template-columns:repeat(4,1fr)}
  .market-grid{grid-template-columns:repeat(4,1fr)}
}

*::-webkit-scrollbar{display:none}
`;
