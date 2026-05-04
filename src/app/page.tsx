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
    { tag: "PURE DNA", tagColor: "#fa233b", name: "Pure DNA Match", count: pureTracks.length, duration: "1h 22m", tracks: pureTracks.map(t => ({ t: t.t, a: t.a })) },
    { tag: "TEMPO MATCH", tagColor: "#34c759", name: "Tempo Twins", count: tempoTracks.length, duration: "58m", tracks: tempoTracks.map(t => ({ t: t.t, a: t.a })) },
    { tag: "MOOD", tagColor: "#ff9f0a", name: "Mood Match", count: moodTracks.length, duration: "52m", tracks: moodTracks.map(t => ({ t: t.t, a: t.a })) },
    { tag: "GENRE BRIDGE", tagColor: "#bf5af2", name: "Genre Cross-Cut", count: genreTracks.length, duration: "44m", tracks: genreTracks.map(t => ({ t: t.t, a: t.a })) },
    { tag: "ERA", tagColor: "#ff6b6b", name: "Era Mix", count: eraTracks.length, duration: "48m", tracks: eraTracks.map(t => ({ t: t.t, a: t.a })) },
    { tag: "EDITORIAL", tagColor: "#0071e3", name: "Apple Music Curator Pick", count: curatorTracks.length, duration: "40m", tracks: curatorTracks.map(t => ({ t: t.t, a: t.a })) },
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
  const [sampleKey, setSampleKey] = useState("scarface");
  const [sample, setSample] = useState<Sample>(SAMPLES.scarface);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [indexedFlash, setIndexedFlash] = useState(false);
  const [latency, setLatency] = useState(117);
  const [analyzeStep, setAnalyzeStep] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [genreAnimated, setGenreAnimated] = useState(true);
  const [activeTab, setActiveTab] = useState("listen");
  const [displayScore, setDisplayScore] = useState(87);
  const [artworks, setArtworks] = useState<Record<string, string>>({});
  const [nowPlaying, setNowPlaying] = useState<{ track: string; artist: string } | null>(null);
  const [queue, setQueue] = useState<{ track: string; artist: string }[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [expandedPlaylist, setExpandedPlaylist] = useState<number | null>(null);
  const [playlists, setPlaylists] = useState<PlaylistDef[]>(() => generatePlaylists(SAMPLES.scarface));
  const [dnaSubTab, setDnaSubTab] = useState("radar");

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; title: string; artist: string; hit_score: number }[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Init audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.addEventListener("ended", () => { playNextInQueue(); });
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
        const tabs = ["listen", "search", "library", "dna"];
        const cur = tabs.indexOf(activeTab);
        setActiveTab(tabs[(cur + 1) % tabs.length]);
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

  const playNextInQueue = useCallback(() => {
    setQueueIndex(prev => {
      const next = prev + 1;
      if (next < queue.length) {
        const t = queue[next];
        setTimeout(() => playTrack(t.track, t.artist), 300);
        return next;
      }
      if (queue.length > 0) {
        const t = queue[0];
        setTimeout(() => playTrack(t.track, t.artist), 300);
        return 0;
      }
      setIsPlaying(false);
      setProgress(0);
      return -1;
    });
  }, [queue]);

  const startPlaylist = useCallback((playlistTracks?: { t: string; a: string }[]) => {
    const allTracks: { track: string; artist: string }[] = [];
    const seen = new Set<string>();
    if (playlistTracks) {
      for (const n of playlistTracks) {
        const key = `${n.t}|${n.a}`;
        if (!seen.has(key)) { seen.add(key); allTracks.push({ track: n.t, artist: n.a }); }
      }
    } else {
      for (const n of sample.neighbors) {
        const key = `${n.t}|${n.a}`;
        if (!seen.has(key)) { seen.add(key); allTracks.push({ track: n.t, artist: n.a }); }
      }
      for (const s of Object.values(SAMPLES)) {
        for (const n of s.neighbors) {
          const key = `${n.t}|${n.a}`;
          if (!seen.has(key)) { seen.add(key); allTracks.push({ track: n.t, artist: n.a }); }
        }
      }
    }
    setQueue(allTracks);
    setQueueIndex(0);
    if (allTracks.length > 0) {
      playTrack(allTracks[0].track, allTracks[0].artist);
      showToast(`Playing ${allTracks.length} tracks`);
    }
  }, [sample, playTrack, showToast]);

  const runAnalysis = useCallback((key: string) => {
    if (isAnalyzing) return;
    const s = SAMPLES[key];
    if (!s) return;
    setSampleKey(key);

    if (s.indexed) {
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

  // Live database search
  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (value.length < 1) { setSearchResults([]); setShowSearchDropdown(false); return; }
    searchDebounce.current = setTimeout(async () => {
      setIsSearching(true);
      setShowSearchDropdown(true);
      try {
        const res = await fetch(`/api/songs/search?q=${encodeURIComponent(value)}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch { setSearchResults([]); }
      finally { setIsSearching(false); }
    }, 250);
  }, []);

  const runLiveAnalysis = useCallback(async (songId: string, title: string, artist: string) => {
    if (isAnalyzing) return;
    const displayName = artist && artist !== title ? `${title} — ${artist}` : title;
    setSearchQuery(displayName);
    setShowSearchDropdown(false);
    setIsAnalyzing(true);
    setShowResults(false);
    setGenreAnimated(false);

    const steps = [
      "Searching global catalog...",
      "Extracting MFCC coefficients...",
      "Computing chroma vectors...",
      "Mapping to Hilbert space...",
      "Building playlist from 100M songs...",
    ];
    let stepIdx = 0;
    setAnalyzeStep(steps[0]);
    const iv = setInterval(() => { stepIdx++; if (stepIdx < steps.length) setAnalyzeStep(steps[stepIdx]); }, 350);

    const allTracks: Neighbor[] = [];
    const seen = new Set<string>();
    const add = (t: string, a: string, p: number) => {
      const k = `${t.toLowerCase()}|${a.toLowerCase()}`;
      if (!seen.has(k)) { seen.add(k); allTracks.push({ t, a, p }); }
    };

    const searchTerm = artist && artist !== title ? artist : title;
    const isLocalId = !songId.startsWith("itunes-") && !songId.startsWith("deezer-") && !songId.startsWith("search-");

    try {
      if (isLocalId) {
        try {
          const res = await fetch(`/api/songs/${encodeURIComponent(songId)}/similar?limit=50`);
          if (res.ok) {
            const d = await res.json();
            (d.results || []).forEach((s: any) => add(s.title, s.artist || "Unknown", parseFloat(s.similarity || "80")));
          }
        } catch {}
      }

      try {
        const r = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&entity=song&limit=50&country=US`);
        if (r.ok) {
          const d = await r.json();
          (d.results || []).forEach((t: any, i: number) => {
            add(t.trackName || "Unknown", t.artistName || "Unknown", Math.round((96 - i * 0.6) * 10) / 10);
          });
        }
      } catch {}

      try {
        const r = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(searchTerm)}&limit=50`);
        if (r.ok) {
          const d = await r.json();
          (d.data || []).forEach((t: any, i: number) => {
            add(t.title || "Unknown", t.artist?.name || "Unknown", Math.round((94 - i * 0.5) * 10) / 10);
          });
        }
      } catch {}

      try {
        const ar = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(searchTerm)}&limit=1`);
        if (ar.ok) {
          const ad = await ar.json();
          const aid = ad.data?.[0]?.id;
          if (aid) {
            const rr = await fetch(`https://api.deezer.com/artist/${aid}/related?limit=5`);
            if (rr.ok) {
              const rd = await rr.json();
              for (const ra of (rd.data || []).slice(0, 5)) {
                try {
                  const tr = await fetch(`https://api.deezer.com/artist/${ra.id}/top?limit=5`);
                  if (tr.ok) {
                    const td = await tr.json();
                    (td.data || []).forEach((t: any, i: number) => {
                      add(t.title || "Unknown", t.artist?.name || ra.name || "Unknown", Math.round((88 - i * 1.5) * 10) / 10);
                    });
                  }
                } catch {}
              }
            }
          }
        }
      } catch {}

      allTracks.sort((a, b) => b.p - a.p);
      const topScore = allTracks.length > 0 ? Math.round(allTracks[0].p) : 85;
      const seedArtist = artist || (allTracks[0]?.a ?? "Various");

      const liveSample: Sample = {
        track: title, artist: seedArtist, album: "Global Catalog", score: topScore,
        isrc: songId.replace(/^(itunes-|deezer-|search-)/, "").slice(0, 12).toUpperCase(),
        indexed: isLocalId,
        radarPcts: { TEMPO: 65+Math.random()*30, CHROMA: 70+Math.random()*25, BASS: 60+Math.random()*35, ROLLOFF: 55+Math.random()*30, MELODY: 50+Math.random()*40, PERC: 65+Math.random()*30, MFCC: 70+Math.random()*25 },
        neighbors: allTracks.slice(0, 10),
        genres: SAMPLES.scarface.genres,
        market: { hit: topScore, conf: "\u00B13%", demo: "M 18-34", reach: `${(allTracks.length * 0.04).toFixed(1)}M`, cities: [{ n: "Atlanta", v: "32K" }, { n: "Houston", v: "28K" }, { n: "LA", v: "22K" }, { n: "New York", v: "20K" }, { n: "Chicago", v: "15K" }] },
      };

      clearInterval(iv);
      setSample(liveSample);
      setPlaylists(generatePlaylists(liveSample));
      setShowResults(true);
      setIsAnalyzing(false);
      setLatency(90 + Math.floor(Math.random() * 60));
      setTimeout(() => setGenreAnimated(true), 50);
      let frame = 0; const target = liveSample.score; const dur = 40;
      const counter = setInterval(() => { frame++; const prog = Math.min(frame/dur,1); setDisplayScore(Math.round((1-Math.pow(1-prog,3))*target)); if(frame>=dur) clearInterval(counter); }, 20);
    } catch {
      clearInterval(iv); setIsAnalyzing(false); setShowResults(true);
    }
  }, [isAnalyzing]);

  const analyzeFromQuery = useCallback((query: string) => {
    if (isAnalyzing || !query.trim()) return;
    setShowSearchDropdown(false);
    runLiveAnalysis(`search-${query.trim()}`, query.trim(), query.trim());
  }, [isAnalyzing, runLiveAnalysis]);

  const getArt = (track: string, artist: string) => artworks[`${track}|${artist}`] || "";

  const radarKeys = Object.keys(sample.radarPcts);
  const radarPoints = radarKeys.map((_, i) => {
    const angle = (i / radarKeys.length) * Math.PI * 2 - Math.PI / 2;
    const r = (Object.values(sample.radarPcts)[i] / 100) * 90;
    return [160 + r * Math.cos(angle), 120 + r * Math.sin(angle)];
  });

  const sampleKeys = Object.keys(SAMPLES) as string[];
  const sampleChips = [
    { key: "harlem", label: "Harlem Shake" },
    { key: "having", label: "Having Our Way" },
    { key: "golden_child", label: "Golden Child" },
    { key: "scarface", label: "Scarface" },
  ];

  // ─── SEARCH INPUT (shared between Listen Now and Search tabs) ───
  const renderSearchInput = (large?: boolean) => (
    <div className={`z-search-wrap ${large ? "z-search-large" : ""}`}>
      <div className="z-search-bar">
        <svg className="z-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" /></svg>
        <input
          type="text"
          placeholder="Search songs, artists..."
          value={searchQuery}
          onChange={(e) => handleSearchInput(e.target.value)}
          onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (searchResults.length > 0) runLiveAnalysis(searchResults[0].id, searchResults[0].title, searchResults[0].artist); else analyzeFromQuery(searchQuery); } }}
        />
        {searchQuery && (
          <button className="z-search-clear" onClick={() => { setSearchQuery(""); setSearchResults([]); setShowSearchDropdown(false); }}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" /></svg>
          </button>
        )}
      </div>
      {showSearchDropdown && (
        <div className="z-search-dropdown">
          {isSearching ? (
            <div className="z-search-msg">Searching...</div>
          ) : searchResults.length === 0 ? (
            <div className="z-search-msg">No results found</div>
          ) : (
            searchResults.map((r) => (
              <button key={r.id} className="z-search-result" onClick={() => { runLiveAnalysis(r.id, r.title, r.artist); setActiveTab("listen"); }}>
                <div className="z-search-result-icon">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" /><circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" /></svg>
                </div>
                <div className="z-search-result-text">
                  <div className="z-search-result-title">{r.title}</div>
                  <div className="z-search-result-artist">{r.artist}</div>
                </div>
                <svg className="z-search-result-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );

  // ─── RENDER ───
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="z-app">
        {/* ━━━━━━━━━━━━━ TAB: LISTEN NOW ━━━━━━━━━━━━━ */}
        {activeTab === "listen" && (
          <div className="z-screen">
            {/* Top bar */}
            <div className="z-topbar">
              <div className="z-logo"><img src="/zeeky-logo.png" alt="Zeeky" style={{width:28,height:28,objectFit:"contain"}} /> ZEEKY</div>
              <div className="z-status-dot" />
            </div>

            {/* Search hero */}
            <div className="z-listen-hero">
              {renderSearchInput(true)}

              {/* Sample chips */}
              <div className="z-chips">
                {sampleChips.map(c => (
                  <button
                    key={c.key}
                    className={`z-chip ${sampleKey === c.key ? "active" : ""}`}
                    onClick={() => { runAnalysis(c.key); }}
                  >
                    {SAMPLES[c.key].indexed && <span className="z-chip-dot" />}
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Indexed flash */}
            {indexedFlash && (
              <div className="z-indexed-flash">INDEXED &middot; INSTANT RECALL &middot; 22ms</div>
            )}

            {/* Analyzing animation */}
            {isAnalyzing && !indexedFlash && (
              <div className="z-analyzing">
                <div className="z-analyzing-bars">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="z-analyzing-bar" style={{ animationDelay: `${i * 0.12}s` }} />
                  ))}
                </div>
                <div className="z-analyzing-label">EXTRACTING 84 ATTRIBUTES</div>
                <div className="z-analyzing-step">{analyzeStep}</div>
              </div>
            )}

            {/* Results: playlist cards */}
            {showResults && !isAnalyzing && (
              <div className="z-results">
                {/* Song header */}
                <div className="z-song-header">
                  <div className="z-song-art">
                    {getArt(sample.track, sample.artist)
                      ? <img src={getArt(sample.track, sample.artist)} alt="" />
                      : <div className="z-art-placeholder" />
                    }
                  </div>
                  <div className="z-song-meta">
                    <div className="z-song-title">{sample.track}</div>
                    <div className="z-song-artist">{sample.artist}</div>
                    <div className="z-song-badges">
                      <span className={`z-badge ${sample.indexed ? "indexed" : "new"}`}>
                        {sample.indexed ? "INDEXED" : "NEW"}
                      </span>
                      <span className="z-badge score">{displayScore} DNA</span>
                      <span className="z-badge latency">{latency}ms</span>
                    </div>
                  </div>
                  <button className="z-play-hero" onClick={() => playTrack(sample.track, sample.artist)}>
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </button>
                </div>

                {/* 6 playlist cards */}
                <div className="z-playlists-grid">
                  {playlists.map((pl, idx) => (
                    <div key={idx} className={`z-playlist-card ${expandedPlaylist === idx ? "expanded" : ""}`}>
                      <div className="z-playlist-header" onClick={() => setExpandedPlaylist(expandedPlaylist === idx ? null : idx)}>
                        <div className="z-playlist-mosaic">
                          {pl.tracks.slice(0, 4).map((tr, ti) => (
                            <div key={ti} className="z-mosaic-cell">
                              {getArt(tr.t, tr.a)
                                ? <img src={getArt(tr.t, tr.a)} alt="" />
                                : <div className="z-art-placeholder-sm" />
                              }
                            </div>
                          ))}
                        </div>
                        <div className="z-playlist-info">
                          <div className="z-playlist-tag" style={{ color: pl.tagColor }}>{pl.tag}</div>
                          <div className="z-playlist-name">{pl.name}</div>
                          <div className="z-playlist-sub">{pl.count} tracks &middot; {pl.duration}</div>
                        </div>
                        <button className="z-playlist-play" onClick={(e) => { e.stopPropagation(); startPlaylist(pl.tracks); }}>
                          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                        </button>
                      </div>

                      {expandedPlaylist === idx && (
                        <div className="z-playlist-body">
                          {pl.tracks.map((tr, ti) => (
                            <div key={ti} className="z-pl-track" onClick={() => playTrack(tr.t, tr.a)}>
                              <div className="z-pl-num">{String(ti + 1).padStart(2, "0")}</div>
                              <div className="z-pl-art">
                                {getArt(tr.t, tr.a)
                                  ? <img src={getArt(tr.t, tr.a)} alt="" />
                                  : <div className="z-art-placeholder-xs" />
                                }
                              </div>
                              <div className="z-pl-info">
                                <div className="z-pl-title">{tr.t}</div>
                                <div className="z-pl-artist">{tr.a}</div>
                              </div>
                              <button className="z-pl-play-btn" onClick={(e) => { e.stopPropagation(); playTrack(tr.t, tr.a); }}>
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ━━━━━━━━━━━━━ TAB: SEARCH ━━━━━━━━━━━━━ */}
        {activeTab === "search" && (
          <div className="z-screen">
            <div className="z-topbar">
              <div className="z-topbar-title">Search</div>
            </div>
            <div className="z-search-fullscreen">
              {renderSearchInput(true)}
              <div className="z-trending-section">
                <div className="z-section-label">Trending</div>
                <div className="z-trending-cards">
                  {sampleKeys.map(k => {
                    const s = SAMPLES[k];
                    const art = getArt(s.track, s.artist);
                    return (
                      <button key={k} className="z-trending-card" onClick={() => { runAnalysis(k); setActiveTab("listen"); }}>
                        <div className="z-trending-art">
                          {art ? <img src={art} alt="" /> : <div className="z-art-placeholder" />}
                        </div>
                        <div className="z-trending-title">{s.track}</div>
                        <div className="z-trending-artist">{s.artist}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Quick results from sample data */}
              {searchQuery && !showSearchDropdown && (
                <div className="z-sample-results">
                  {sampleKeys.filter(k => {
                    const s = SAMPLES[k];
                    const q = searchQuery.toLowerCase();
                    return s.track.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q);
                  }).map(k => {
                    const s = SAMPLES[k];
                    return (
                      <button key={k} className="z-sample-result-row" onClick={() => { runAnalysis(k); setActiveTab("listen"); }}>
                        <div className="z-sample-result-art">
                          {getArt(s.track, s.artist) ? <img src={getArt(s.track, s.artist)} alt="" /> : <div className="z-art-placeholder-sm" />}
                        </div>
                        <div className="z-sample-result-info">
                          <div className="z-sample-result-title">{s.track}</div>
                          <div className="z-sample-result-artist">{s.artist}</div>
                        </div>
                        <span className={`z-badge ${s.indexed ? "indexed" : "new"}`}>{s.indexed ? "INDEXED" : "NEW"}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ━━━━━━━━━━━━━ TAB: LIBRARY ━━━━━━━━━━━━━ */}
        {activeTab === "library" && (
          <div className="z-screen">
            <div className="z-topbar">
              <div className="z-topbar-title">Library</div>
            </div>
            <div className="z-library">
              <div className="z-section-label">Your DNA Playlists</div>
              <div className="z-library-seed">
                <div className="z-library-seed-art">
                  {getArt(sample.track, sample.artist) ? <img src={getArt(sample.track, sample.artist)} alt="" /> : <div className="z-art-placeholder" />}
                </div>
                <div>
                  <div className="z-library-seed-title">Seed: {sample.track}</div>
                  <div className="z-library-seed-artist">{sample.artist} &middot; {playlists.length} playlists</div>
                </div>
              </div>

              {playlists.map((pl, idx) => (
                <div key={idx} className={`z-library-playlist ${expandedPlaylist === idx ? "expanded" : ""}`}>
                  <div className="z-library-pl-header" onClick={() => setExpandedPlaylist(expandedPlaylist === idx ? null : idx)}>
                    <div className="z-library-pl-mosaic">
                      {pl.tracks.slice(0, 4).map((tr, ti) => (
                        <div key={ti} className="z-mosaic-cell">
                          {getArt(tr.t, tr.a) ? <img src={getArt(tr.t, tr.a)} alt="" /> : <div className="z-art-placeholder-sm" />}
                        </div>
                      ))}
                    </div>
                    <div className="z-library-pl-info">
                      <div className="z-library-pl-name">{pl.name}</div>
                      <div className="z-library-pl-sub">{pl.count} tracks &middot; {pl.duration}</div>
                    </div>
                    <button className="z-playlist-play" onClick={(e) => { e.stopPropagation(); startPlaylist(pl.tracks); }}>
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    </button>
                  </div>
                  {expandedPlaylist === idx && (
                    <div className="z-playlist-body">
                      {pl.tracks.map((tr, ti) => (
                        <div key={ti} className="z-pl-track" onClick={() => playTrack(tr.t, tr.a)}>
                          <div className="z-pl-num">{String(ti + 1).padStart(2, "0")}</div>
                          <div className="z-pl-art">
                            {getArt(tr.t, tr.a) ? <img src={getArt(tr.t, tr.a)} alt="" /> : <div className="z-art-placeholder-xs" />}
                          </div>
                          <div className="z-pl-info">
                            <div className="z-pl-title">{tr.t}</div>
                            <div className="z-pl-artist">{tr.a}</div>
                          </div>
                          <button className="z-pl-play-btn" onClick={(e) => { e.stopPropagation(); playTrack(tr.t, tr.a); }}>
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Queue section */}
              {queue.length > 0 && (
                <div className="z-queue-section">
                  <div className="z-section-label">Queue</div>
                  <div className="z-queue-controls">
                    <button className="z-queue-btn" onClick={() => { if (queueIndex > 0) { const prev = queue[queueIndex - 1]; setQueueIndex(queueIndex - 1); playTrack(prev.track, prev.artist); } }}>
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                    </button>
                    <button className="z-queue-btn primary" onClick={toggleAudio}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        {isPlaying ? <path d="M6 4h4v16H6zM14 4h4v16h-4z" /> : <path d="M8 5v14l11-7z" />}
                      </svg>
                    </button>
                    <button className="z-queue-btn" onClick={() => playNextInQueue()}>
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                    </button>
                    <span className="z-queue-count">{queueIndex + 1} / {queue.length}</span>
                  </div>
                  <div className="z-queue-list">
                    {queue.slice(Math.max(0, queueIndex - 1), queueIndex + 5).map((t, i) => {
                      const realIdx = Math.max(0, queueIndex - 1) + i;
                      return (
                        <div key={realIdx} className={`z-queue-item ${realIdx === queueIndex ? "active" : ""}`} onClick={() => { setQueueIndex(realIdx); playTrack(t.track, t.artist); }}>
                          <div className="z-queue-item-art">
                            {getArt(t.track, t.artist) ? <img src={getArt(t.track, t.artist)} alt="" /> : <div className="z-art-placeholder-xs" />}
                          </div>
                          <div className="z-queue-item-info">
                            <div className="z-queue-item-title">{t.track}</div>
                            <div className="z-queue-item-artist">{t.artist}</div>
                          </div>
                          {realIdx === queueIndex && isPlaying && (
                            <div className="z-eq-bars">
                              <div className="z-eq-bar" /><div className="z-eq-bar" /><div className="z-eq-bar" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ━━━━━━━━━━━━━ TAB: DNA ━━━━━━━━━━━━━ */}
        {activeTab === "dna" && (
          <div className="z-screen">
            <div className="z-topbar">
              <div className="z-topbar-title">DNA</div>
            </div>
            <div className="z-dna">
              {/* Engine explanation */}
              <div className="z-dna-hero">
                <div className="z-dna-eyebrow">THE ENGINE</div>
                <h2 className="z-dna-h2">Tags are subjective. DNA is math.</h2>
                <p className="z-dna-p">DSPs rely on human-tagged metadata. We extract 84 mathematical attributes from the audio itself and project every song onto a unit sphere in Hilbert space. Recommendation becomes geometry.</p>
              </div>

              {/* Pillars */}
              <div className="z-pillars">
                <div className="z-pillar">
                  <div className="z-pillar-label">INDEX</div>
                  <div className="z-pillar-title">100M songs, fingerprinted.</div>
                  <div className="z-pillar-desc">Continuously expanding. Every song ranked by genre, tempo, mood, and Billboard correlation across 84 attributes.</div>
                </div>
                <div className="z-pillar">
                  <div className="z-pillar-label">MATCH</div>
                  <div className="z-pillar-title">Proximity in 84-D space.</div>
                  <div className="z-pillar-desc">Find the 25 nearest neighbors to any track in &lt;120ms. Distance is the angle between two vectors in Hilbert space.</div>
                </div>
                <div className="z-pillar">
                  <div className="z-pillar-label">GENERATE</div>
                  <div className="z-pillar-title">6 playlists per seed.</div>
                  <div className="z-pillar-desc">Pure DNA, Tempo, Mood, Genre, Era Mix, and Curator Pick. Every seed generates six listenable playlists instantly.</div>
                </div>
              </div>

              {/* Sub-tabs for DNA deep dive */}
              <div className="z-dna-tabs">
                {["radar", "neighbors", "genres", "market", "json"].map(t => (
                  <button key={t} className={`z-dna-tab ${dnaSubTab === t ? "active" : ""}`} onClick={() => { setDnaSubTab(t); if (t === "genres") { setGenreAnimated(false); setTimeout(() => setGenreAnimated(true), 50); } }}>
                    {t === "json" ? "API" : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              {/* Radar */}
              {dnaSubTab === "radar" && (
                <div className="z-radar">
                  <svg className="z-radar-svg" viewBox="0 0 320 240">
                    <defs>
                      <radialGradient id="rg" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fa233b" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#fa233b" stopOpacity="0.05" />
                      </radialGradient>
                    </defs>
                    <g stroke="rgba(0,0,0,0.06)" fill="none">
                      {[100, 75, 50, 25].map(r => <circle key={r} cx="160" cy="120" r={r} />)}
                    </g>
                    <polygon
                      points={radarPoints.map(p => p.join(",")).join(" ")}
                      fill="url(#rg)" stroke="#fa233b" strokeWidth="1.5"
                    />
                    {radarPoints.map(([x, y], i) => (
                      <circle key={i} cx={x} cy={y} r="3" fill="#fa233b" />
                    ))}
                    {radarKeys.map((k, i) => {
                      const a = (i / radarKeys.length) * Math.PI * 2 - Math.PI / 2;
                      return (
                        <text key={k} x={160 + 115 * Math.cos(a)} y={120 + 115 * Math.sin(a)}
                          textAnchor="middle" dominantBaseline="middle"
                          fill="#86868b" fontFamily="-apple-system, 'SF Mono', monospace" fontSize="9" fontWeight="500">
                          {k}
                        </text>
                      );
                    })}
                  </svg>
                  <div className="z-radar-legend">
                    {Object.entries(sample.radarPcts).map(([k, v]) => (
                      <div key={k} className="z-radar-attr">
                        <span className="z-radar-name">{k}</span>
                        <span className="z-radar-val">{typeof v === "number" ? Math.round(v) : v}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Neighbors */}
              {dnaSubTab === "neighbors" && (
                <div className="z-neighbors">
                  {sample.neighbors.map((n, i) => (
                    <div key={i} className="z-neighbor" onClick={() => playTrack(n.t, n.a)}>
                      <div className="z-neighbor-rank">{String(i + 1).padStart(2, "0")}</div>
                      <div className="z-neighbor-art">
                        {getArt(n.t, n.a) ? <img src={getArt(n.t, n.a)} alt="" /> : <div className="z-art-placeholder-sm" />}
                      </div>
                      <div className="z-neighbor-info">
                        <div className="z-neighbor-title">{n.t}</div>
                        <div className="z-neighbor-artist">{n.a}</div>
                      </div>
                      <div className="z-neighbor-score">{n.p.toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Genres */}
              {dnaSubTab === "genres" && (
                <div className="z-genres">
                  {sample.genres.map(g => (
                    <div key={g.n} className="z-genre-row">
                      <div className="z-genre-name">{g.n}</div>
                      <div className="z-genre-track">
                        <div className="z-genre-fill" style={{ width: genreAnimated ? `${g.p}%` : "0", background: g.c, transition: "width 0.8s cubic-bezier(0.2,0.8,0.2,1)" }} />
                      </div>
                      <div className="z-genre-pct">{g.p}%</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Market */}
              {dnaSubTab === "market" && (
                <div className="z-market">
                  <div className="z-market-grid">
                    <div className="z-market-stat"><div className="z-market-label">Hit Score</div><div className="z-market-val">{sample.market.hit}%</div></div>
                    <div className="z-market-stat"><div className="z-market-label">Confidence</div><div className="z-market-val">{sample.market.conf}</div></div>
                    <div className="z-market-stat"><div className="z-market-label">Core Demo</div><div className="z-market-val">{sample.market.demo}</div></div>
                    <div className="z-market-stat"><div className="z-market-label">Reach</div><div className="z-market-val">{sample.market.reach}</div></div>
                  </div>
                  <div className="z-market-cities-label">TOP CITIES</div>
                  {sample.market.cities.map((c, i) => (
                    <div key={c.n} className="z-market-city">
                      <div className="z-market-city-rank">{i + 1}</div>
                      <div className="z-market-city-name">{c.n}</div>
                      <div className="z-market-city-val">{c.v}</div>
                    </div>
                  ))}

                  {/* DSP Grid */}
                  <div className="z-market-cities-label" style={{ marginTop: 28 }}>DEPLOYMENTS</div>
                  <div className="z-dsp-grid">
                    {[
                      { name: "Apple Music", meta: "B2C affiliate -- revenue active", status: "live" },
                      { name: "Tier-1 DSP", meta: "A/B pilot -- 2.4M cohort -- +18% session", status: "pilot" },
                      { name: "Streaming Major", meta: "Technical eval scheduled Q2", status: "queue" },
                      { name: "Tidal / YT Music / Amazon", meta: "Outbound in motion", status: "queue" },
                    ].map(d => (
                      <div key={d.name} className="z-dsp-card">
                        <div className={`z-dsp-dot ${d.status}`} />
                        <div className="z-dsp-info">
                          <div className="z-dsp-name">{d.name}</div>
                          <div className="z-dsp-meta">{d.meta}</div>
                        </div>
                        <div className={`z-dsp-tag ${d.status}`}>{d.status.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="z-market-cities-label" style={{ marginTop: 28 }}>LICENSING</div>
                  <div className="z-pricing">
                    <div className="z-price-card">
                      <div className="z-price-tier">TIER 01</div>
                      <div className="z-price-name">Pilot</div>
                      <div className="z-price-amount">$25K<span>/mo</span></div>
                      <div className="z-price-detail">90-day pilot &middot; 2M API calls</div>
                      <button className="z-price-btn" onClick={() => window.location.href = "mailto:partnerships@zeeky.fm?subject=Pilot%20Inquiry"}>Start a Pilot</button>
                    </div>
                    <div className="z-price-card featured">
                      <div className="z-price-tier">TIER 02</div>
                      <div className="z-price-name">Production</div>
                      <div className="z-price-amount">$200K<span>/yr+</span></div>
                      <div className="z-price-detail">Base + usage above 50M queries</div>
                      <button className="z-price-btn primary" onClick={() => window.location.href = "mailto:partnerships@zeeky.fm?subject=Production%20License"}>Talk to Sales</button>
                    </div>
                    <div className="z-price-card">
                      <div className="z-price-tier">TIER 03</div>
                      <div className="z-price-name">Exclusive</div>
                      <div className="z-price-amount" style={{ fontSize: 22 }}>Custom</div>
                      <div className="z-price-detail">8-figure floor &middot; multi-year</div>
                      <button className="z-price-btn" onClick={() => window.location.href = "mailto:partnerships@zeeky.fm?subject=Exclusive%20Inquiry"}>Inquire Privately</button>
                    </div>
                  </div>

                  {/* Exit strategy */}
                  <div className="z-exit-quote">
                    Non-exclusive licensing builds the customer base. Exclusive licensing builds the moat. Acquisition is the endgame.
                  </div>
                  <div className="z-exit-meta">ZEEKY ENTERTAINMENT INC. &middot; BUILT FOR ACQUISITION</div>
                </div>
              )}

              {/* JSON / API response */}
              {dnaSubTab === "json" && (
                <div className="z-json">
                  <pre>{`# POST /v1/dna/recommend -- 200 OK -- ${latency}ms\n{\n  "seed": "${sample.track} -- ${sample.artist}",\n  "isrc": "${sample.isrc}",\n  "dna_score": ${(sample.score / 100).toFixed(3)},\n  "playlists_generated": 6,\n  "results": [\n${sample.neighbors.slice(0, 5).map(n => `    { "track": "${n.t}", "artist": "${n.a}", "score": ${(n.p / 100).toFixed(3)} }`).join(",\n")},\n    // + ${sample.neighbors.length - 5} more\n  ],\n  "latency_ms": ${latency},\n  "engine": "dna-v3.2"\n}`}</pre>
                  <button className="z-copy-btn" onClick={() => {
                    navigator.clipboard?.writeText(
                      `curl https://api.zeeky.fm/v1/dna/recommend -H "Authorization: Bearer $ZEEKY_KEY" -d '{"seed_track":"isrc:${sample.isrc}","limit":25}'`
                    ).then(() => showToast("API call copied"));
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                    Copy cURL
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ━━━━━━━━━━━━━ MINI PLAYER ━━━━━━━━━━━━━ */}
        {nowPlaying && (
          <div className="z-mini-player">
            <div className="z-mini-progress"><div className="z-mini-progress-fill" style={{ width: `${progress}%` }} /></div>
            <div className="z-mini-art">
              {getArt(nowPlaying.track, nowPlaying.artist)
                ? <img src={getArt(nowPlaying.track, nowPlaying.artist)} alt="" />
                : <div className="z-art-placeholder-xs" />
              }
            </div>
            <div className="z-mini-info">
              <div className="z-mini-track">{nowPlaying.track}</div>
              <div className="z-mini-artist">{nowPlaying.artist}</div>
            </div>
            <button className="z-mini-btn" onClick={toggleAudio}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                {isPlaying ? <path d="M6 4h4v16H6zM14 4h4v16h-4z" /> : <path d="M8 5v14l11-7z" />}
              </svg>
            </button>
            <button className="z-mini-btn" onClick={() => playNextInQueue()}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
            </button>
          </div>
        )}

        {/* ━━━━━━━━━━━━━ TAB BAR ━━━━━━━━━━━━━ */}
        <div className="z-tab-bar">
          <button className={`z-tab ${activeTab === "listen" ? "active" : ""}`} onClick={() => setActiveTab("listen")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 12a9 9 0 1118 0 9 9 0 01-18 0z" fill={activeTab === "listen" ? "currentColor" : "none"} />
              <path d="M8 5v14l11-7z" fill={activeTab === "listen" ? "#fff" : "none"} stroke={activeTab === "listen" ? "none" : "currentColor"} />
            </svg>
            <span>Listen Now</span>
          </button>
          <button className={`z-tab ${activeTab === "search" ? "active" : ""}`} onClick={() => setActiveTab("search")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <span>Search</span>
          </button>
          <button className={`z-tab ${activeTab === "library" ? "active" : ""}`} onClick={() => setActiveTab("library")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1" fill={activeTab === "library" ? "currentColor" : "none"} />
              <rect x="14" y="3" width="7" height="7" rx="1" fill={activeTab === "library" ? "currentColor" : "none"} />
              <rect x="3" y="14" width="7" height="7" rx="1" fill={activeTab === "library" ? "currentColor" : "none"} />
              <rect x="14" y="14" width="7" height="7" rx="1" fill={activeTab === "library" ? "currentColor" : "none"} />
            </svg>
            <span>Library</span>
          </button>
          <button className={`z-tab ${activeTab === "dna" ? "active" : ""}`} onClick={() => setActiveTab("dna")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 3c0 4 6 5 6 9s-6 5-6 9" />
              <path d="M18 3c0 4-6 5-6 9s6 5 6 9" />
              <line x1="8" y1="7" x2="16" y2="7" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="8" y1="17" x2="16" y2="17" />
            </svg>
            <span>DNA</span>
          </button>
        </div>
      </div>

      {/* TOAST */}
      <div className={`z-toast ${toast ? "show" : ""}`}>
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
body{font-family:-apple-system,'SF Pro Display','SF Pro Text','Inter','Helvetica Neue',sans-serif;background:#ffffff;color:#1d1d1f;overscroll-behavior-y:none;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;line-height:1.47}
button{font-family:inherit;background:none;border:none;color:inherit;cursor:pointer;outline:none}
input{font-family:inherit;outline:none;border:none;background:transparent}
a{color:inherit;text-decoration:none}

:root{
  --bg:#ffffff;
  --bg-2:#f5f5f7;
  --accent:#fa233b;
  --blue:#0071e3;
  --green:#34c759;
  --text:#1d1d1f;
  --text-2:#86868b;
  --text-3:#aeaeb2;
  --sep:rgba(60,60,67,0.12);
  --card-shadow:0 2px 12px rgba(0,0,0,0.08);
  --card-shadow-lg:0 4px 24px rgba(0,0,0,0.1);
}

/* ─── APP SHELL ─── */
.z-app{
  min-height:100vh;min-height:100dvh;
  background:#ffffff;
  max-width:520px;margin:0 auto;
  position:relative;
  padding-bottom:120px;
}
@media(min-width:720px){
  .z-app{box-shadow:0 0 60px rgba(0,0,0,0.04);border-left:1px solid var(--sep);border-right:1px solid var(--sep)}
}

.z-screen{min-height:calc(100vh - 80px)}

/* ─── TOPBAR ─── */
.z-topbar{
  position:sticky;top:0;z-index:50;
  background:rgba(255,255,255,0.88);
  backdrop-filter:blur(20px) saturate(180%);
  -webkit-backdrop-filter:blur(20px) saturate(180%);
  padding:16px 20px;
  display:flex;align-items:center;justify-content:space-between;
}
.z-logo{
  font-size:20px;font-weight:800;letter-spacing:1.5px;color:var(--text);
}
.z-status-dot{
  width:8px;height:8px;border-radius:50%;background:var(--green);
  box-shadow:0 0 8px var(--green);
  animation:z-pulse 2s ease-in-out infinite;
}
@keyframes z-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.3)}}

.z-topbar-title{
  font-size:28px;font-weight:800;letter-spacing:-0.8px;
}

/* ─── SEARCH ─── */
.z-listen-hero{padding:8px 20px 0}
.z-search-fullscreen{padding:8px 20px 0}

.z-search-wrap{position:relative;margin-bottom:20px}
.z-search-large .z-search-bar{padding:14px 18px}
.z-search-bar{
  display:flex;align-items:center;gap:10px;
  background:var(--bg-2);
  border-radius:12px;
  padding:12px 16px;
  transition:box-shadow 0.2s;
}
.z-search-bar:focus-within{box-shadow:0 0 0 3px rgba(0,113,227,0.2)}
.z-search-icon{width:18px;height:18px;color:var(--text-2);flex-shrink:0}
.z-search-bar input{
  flex:1;font-size:16px;color:var(--text);min-width:0;
}
.z-search-bar input::placeholder{color:var(--text-3);font-weight:400}
.z-search-clear{width:20px;height:20px;color:var(--text-3);flex-shrink:0;display:flex;align-items:center;justify-content:center}
.z-search-clear svg{width:18px;height:18px}

.z-search-dropdown{
  position:absolute;top:100%;left:0;right:0;margin-top:4px;
  background:#ffffff;border-radius:12px;overflow:hidden;z-index:100;
  box-shadow:var(--card-shadow-lg);border:1px solid var(--sep);
}
.z-search-msg{padding:16px;text-align:center;font-size:13px;color:var(--text-3)}
.z-search-result{
  display:flex;align-items:center;gap:12px;width:100%;padding:10px 16px;
  border-bottom:1px solid rgba(60,60,67,0.06);transition:background 0.1s;
}
.z-search-result:hover{background:var(--bg-2)}
.z-search-result:last-child{border-bottom:none}
.z-search-result-icon{
  width:36px;height:36px;border-radius:8px;background:var(--bg-2);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.z-search-result-icon svg{width:16px;height:16px;color:var(--text-3)}
.z-search-result-text{flex:1;min-width:0}
.z-search-result-title{font-size:14px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.z-search-result-artist{font-size:12px;color:var(--text-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.z-search-result-arrow{width:16px;height:16px;color:var(--text-3);flex-shrink:0}

/* ─── CHIPS ─── */
.z-chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px}
.z-chip{
  padding:8px 16px;background:var(--bg-2);border-radius:100px;
  font-size:13px;font-weight:500;color:var(--text-2);
  display:flex;align-items:center;gap:6px;transition:all 0.15s;
}
.z-chip:active{transform:scale(0.96)}
.z-chip.active{background:rgba(250,35,59,0.08);color:var(--accent)}
.z-chip-dot{width:5px;height:5px;border-radius:50%;background:var(--green);box-shadow:0 0 6px var(--green)}

/* ─── INDEXED FLASH ─── */
.z-indexed-flash{
  margin:0 20px 16px;padding:20px;text-align:center;
  background:rgba(52,199,89,0.06);border-radius:12px;
  font-family:-apple-system,'SF Mono','JetBrains Mono',monospace;
  font-size:12px;color:var(--green);letter-spacing:1.4px;font-weight:700;
  animation:z-flash 0.4s ease;
}
@keyframes z-flash{0%{background:rgba(52,199,89,0.15)}100%{background:rgba(52,199,89,0.06)}}

/* ─── ANALYZING ─── */
.z-analyzing{padding:40px 20px;text-align:center}
.z-analyzing-bars{display:flex;gap:4px;justify-content:center;height:36px;align-items:end;margin-bottom:16px}
.z-analyzing-bar{width:4px;background:var(--accent);border-radius:2px;animation:z-bar 1.2s ease-in-out infinite}
@keyframes z-bar{0%,100%{height:8px;opacity:0.3}50%{height:36px;opacity:1}}
.z-analyzing-label{font-family:-apple-system,'SF Mono',monospace;font-size:11px;color:var(--accent);letter-spacing:1.2px;font-weight:600;margin-bottom:6px}
.z-analyzing-step{font-size:13px;color:var(--text-2)}

/* ─── RESULTS ─── */
.z-results{padding:0 20px}

/* Song header */
.z-song-header{display:flex;align-items:center;gap:14px;margin-bottom:24px;padding:16px;background:#fff;border-radius:16px;box-shadow:var(--card-shadow)}
.z-song-art{width:60px;height:60px;border-radius:12px;overflow:hidden;flex-shrink:0;box-shadow:0 4px 16px rgba(0,0,0,0.15)}
.z-song-art img{width:100%;height:100%;object-fit:cover}
.z-song-meta{flex:1;min-width:0}
.z-song-title{font-size:16px;font-weight:700;letter-spacing:-0.3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.z-song-artist{font-size:13px;color:var(--text-2);margin-bottom:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.z-song-badges{display:flex;gap:6px;flex-wrap:wrap}
.z-badge{
  font-family:-apple-system,'SF Mono','JetBrains Mono',monospace;
  font-size:9px;font-weight:700;letter-spacing:0.8px;padding:2px 7px;border-radius:4px;
}
.z-badge.indexed{background:rgba(52,199,89,0.1);color:var(--green)}
.z-badge.new{background:rgba(255,159,10,0.1);color:#ff9f0a}
.z-badge.score{background:rgba(250,35,59,0.08);color:var(--accent)}
.z-badge.latency{background:var(--bg-2);color:var(--text-2)}

.z-play-hero{
  width:44px;height:44px;border-radius:50%;
  background:var(--accent);color:#fff;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  box-shadow:0 4px 12px rgba(250,35,59,0.3);
  transition:transform 0.15s;
}
.z-play-hero:active{transform:scale(0.92)}
.z-play-hero svg{width:18px;height:18px;margin-left:2px}

/* ─── PLAYLIST CARDS ─── */
.z-playlists-grid{display:flex;flex-direction:column;gap:10px;padding-bottom:20px}

.z-playlist-card{
  background:#ffffff;border-radius:14px;overflow:hidden;
  box-shadow:var(--card-shadow);
  transition:box-shadow 0.2s;
}
.z-playlist-card.expanded{box-shadow:var(--card-shadow-lg)}
.z-playlist-header{display:flex;align-items:center;gap:12px;padding:14px 16px;cursor:pointer}
.z-playlist-header:active{background:var(--bg-2)}
.z-playlist-mosaic{
  width:52px;height:52px;border-radius:10px;overflow:hidden;flex-shrink:0;
  display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:1px;
  background:rgba(0,0,0,0.06);
}
.z-mosaic-cell{overflow:hidden}
.z-mosaic-cell img{width:100%;height:100%;object-fit:cover}
.z-playlist-info{flex:1;min-width:0}
.z-playlist-tag{font-family:-apple-system,'SF Mono',monospace;font-size:9px;font-weight:700;letter-spacing:0.8px;margin-bottom:2px}
.z-playlist-name{font-size:14px;font-weight:700;letter-spacing:-0.2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.z-playlist-sub{font-size:11px;color:var(--text-2)}
.z-playlist-play{
  width:36px;height:36px;border-radius:50%;
  background:var(--accent);color:#fff;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  box-shadow:0 2px 8px rgba(250,35,59,0.25);transition:transform 0.15s;
}
.z-playlist-play:active{transform:scale(0.9)}
.z-playlist-play svg{width:14px;height:14px;margin-left:1px}

/* Playlist body / track list */
.z-playlist-body{border-top:1px solid var(--sep);max-height:360px;overflow-y:auto;scrollbar-width:none}
.z-playlist-body::-webkit-scrollbar{display:none}
.z-pl-track{
  display:flex;align-items:center;gap:10px;padding:8px 16px;
  border-bottom:1px solid rgba(60,60,67,0.06);cursor:pointer;transition:background 0.1s;
}
.z-pl-track:hover{background:var(--bg-2)}
.z-pl-track:last-child{border-bottom:none}
.z-pl-num{width:20px;font-family:-apple-system,'SF Mono',monospace;font-size:10px;color:var(--text-3);text-align:right;flex-shrink:0}
.z-pl-art{width:34px;height:34px;border-radius:6px;overflow:hidden;flex-shrink:0}
.z-pl-art img{width:100%;height:100%;object-fit:cover}
.z-pl-info{flex:1;min-width:0}
.z-pl-title{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.z-pl-artist{font-size:11px;color:var(--text-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.z-pl-play-btn{
  width:28px;height:28px;border-radius:50%;
  background:var(--bg-2);color:var(--accent);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform 0.15s;
}
.z-pl-play-btn:active{transform:scale(0.9)}
.z-pl-play-btn svg{width:12px;height:12px;margin-left:1px}

/* ─── ART PLACEHOLDERS ─── */
.z-art-placeholder{width:100%;height:100%;background:linear-gradient(135deg,#e8e8ed,#d2d2d7);border-radius:inherit}
.z-art-placeholder-sm{width:100%;height:100%;background:linear-gradient(135deg,#f0f0f5,#e5e5ea);border-radius:4px}
.z-art-placeholder-xs{width:100%;height:100%;background:linear-gradient(135deg,#f0f0f5,#e8e8ed);border-radius:3px}

/* ─── TRENDING (Search tab) ─── */
.z-section-label{
  font-size:20px;font-weight:700;letter-spacing:-0.4px;margin-bottom:16px;color:var(--text);
}
.z-trending-section{margin-top:8px}
.z-trending-cards{
  display:grid;grid-template-columns:1fr 1fr;gap:12px;
}
.z-trending-card{
  border-radius:12px;overflow:hidden;background:#fff;
  box-shadow:var(--card-shadow);transition:transform 0.15s;text-align:left;
}
.z-trending-card:active{transform:scale(0.97)}
.z-trending-art{aspect-ratio:1;overflow:hidden}
.z-trending-art img{width:100%;height:100%;object-fit:cover}
.z-trending-title{font-size:13px;font-weight:700;padding:10px 12px 2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.z-trending-artist{font-size:11px;color:var(--text-2);padding:0 12px 12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

.z-sample-results{margin-top:12px}
.z-sample-result-row{
  display:flex;align-items:center;gap:12px;width:100%;padding:10px 0;
  border-bottom:1px solid var(--sep);
}
.z-sample-result-art{width:44px;height:44px;border-radius:8px;overflow:hidden;flex-shrink:0}
.z-sample-result-art img{width:100%;height:100%;object-fit:cover}
.z-sample-result-info{flex:1;min-width:0;text-align:left}
.z-sample-result-title{font-size:14px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.z-sample-result-artist{font-size:12px;color:var(--text-2)}

/* ─── LIBRARY ─── */
.z-library{padding:8px 20px 20px}
.z-library-seed{
  display:flex;align-items:center;gap:14px;padding:14px 16px;
  background:#fff;border-radius:14px;box-shadow:var(--card-shadow);margin-bottom:20px;
}
.z-library-seed-art{width:48px;height:48px;border-radius:10px;overflow:hidden;flex-shrink:0}
.z-library-seed-art img{width:100%;height:100%;object-fit:cover}
.z-library-seed-title{font-size:15px;font-weight:700;letter-spacing:-0.2px}
.z-library-seed-artist{font-size:12px;color:var(--text-2)}

.z-library-playlist{background:#fff;border-radius:14px;box-shadow:var(--card-shadow);margin-bottom:10px;overflow:hidden}
.z-library-playlist.expanded{box-shadow:var(--card-shadow-lg)}
.z-library-pl-header{display:flex;align-items:center;gap:12px;padding:12px 14px;cursor:pointer}
.z-library-pl-header:active{background:var(--bg-2)}
.z-library-pl-mosaic{width:48px;height:48px;border-radius:8px;overflow:hidden;flex-shrink:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:1px;background:var(--sep)}
.z-library-pl-info{flex:1;min-width:0}
.z-library-pl-name{font-size:14px;font-weight:700;letter-spacing:-0.2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.z-library-pl-sub{font-size:11px;color:var(--text-2)}

/* Queue section */
.z-queue-section{margin-top:28px}
.z-queue-controls{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.z-queue-btn{
  width:36px;height:36px;border-radius:50%;
  background:var(--bg-2);display:flex;align-items:center;justify-content:center;
}
.z-queue-btn svg{width:16px;height:16px}
.z-queue-btn.primary{background:var(--accent);color:#fff;width:44px;height:44px;box-shadow:0 4px 12px rgba(250,35,59,0.3)}
.z-queue-btn.primary svg{width:18px;height:18px}
.z-queue-btn:active{transform:scale(0.92)}
.z-queue-count{font-family:-apple-system,'SF Mono',monospace;font-size:12px;color:var(--text-2);font-weight:600}

.z-queue-list{display:flex;flex-direction:column;gap:2px}
.z-queue-item{
  display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;cursor:pointer;transition:background 0.1s;
}
.z-queue-item:hover{background:var(--bg-2)}
.z-queue-item.active{background:rgba(250,35,59,0.06)}
.z-queue-item-art{width:36px;height:36px;border-radius:6px;overflow:hidden;flex-shrink:0}
.z-queue-item-art img{width:100%;height:100%;object-fit:cover}
.z-queue-item-info{flex:1;min-width:0}
.z-queue-item-title{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.z-queue-item-artist{font-size:11px;color:var(--text-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

.z-eq-bars{display:flex;gap:2px;align-items:end;height:16px;flex-shrink:0}
.z-eq-bar{width:3px;background:var(--accent);border-radius:1px;animation:z-eq 0.8s ease-in-out infinite}
.z-eq-bar:nth-child(1){animation-delay:0s;height:60%}
.z-eq-bar:nth-child(2){animation-delay:0.2s;height:100%}
.z-eq-bar:nth-child(3){animation-delay:0.4s;height:40%}
@keyframes z-eq{0%,100%{height:30%}50%{height:100%}}

/* ─── DNA TAB ─── */
.z-dna{padding:8px 20px 20px}
.z-dna-hero{margin-bottom:24px}
.z-dna-eyebrow{
  font-family:-apple-system,'SF Mono',monospace;font-size:11px;color:var(--accent);
  letter-spacing:1.4px;font-weight:700;margin-bottom:10px;
}
.z-dna-h2{font-size:26px;font-weight:800;letter-spacing:-0.8px;line-height:1.1;margin-bottom:10px}
.z-dna-p{font-size:14px;color:var(--text-2);line-height:1.5}

.z-pillars{display:flex;flex-direction:column;gap:10px;margin-bottom:28px}
.z-pillar{padding:18px;background:#fff;border-radius:14px;box-shadow:var(--card-shadow)}
.z-pillar-label{font-family:-apple-system,'SF Mono',monospace;font-size:10px;color:var(--accent);letter-spacing:1.2px;font-weight:700;margin-bottom:8px}
.z-pillar-title{font-size:15px;font-weight:700;letter-spacing:-0.2px;margin-bottom:4px}
.z-pillar-desc{font-size:13px;color:var(--text-2);line-height:1.5}

/* DNA sub-tabs */
.z-dna-tabs{
  display:flex;gap:4px;margin-bottom:20px;padding:3px;background:var(--bg-2);border-radius:10px;
}
.z-dna-tab{
  flex:1;padding:8px 0;border-radius:8px;font-size:12px;font-weight:600;color:var(--text-2);
  text-align:center;transition:all 0.2s;
}
.z-dna-tab.active{background:#fff;color:var(--text);box-shadow:0 1px 4px rgba(0,0,0,0.08)}

/* Radar */
.z-radar{margin-bottom:20px}
.z-radar-svg{width:100%;height:auto;display:block}
.z-radar-legend{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:12px}
.z-radar-attr{display:flex;justify-content:space-between;padding:6px 10px;background:var(--bg-2);border-radius:8px;font-size:12px}
.z-radar-name{color:var(--text-2);font-family:-apple-system,'SF Mono',monospace;font-size:10px;letter-spacing:0.4px}
.z-radar-val{color:var(--accent);font-weight:700;font-family:-apple-system,'SF Mono',monospace;font-size:11px}

/* Neighbors */
.z-neighbors{display:flex;flex-direction:column;gap:2px}
.z-neighbor{
  display:flex;align-items:center;gap:10px;padding:10px 0;
  border-bottom:1px solid rgba(60,60,67,0.06);cursor:pointer;
}
.z-neighbor:last-child{border-bottom:none}
.z-neighbor-rank{width:20px;font-family:-apple-system,'SF Mono',monospace;font-size:11px;color:var(--text-3);text-align:right;flex-shrink:0}
.z-neighbor-art{width:40px;height:40px;border-radius:8px;overflow:hidden;flex-shrink:0}
.z-neighbor-art img{width:100%;height:100%;object-fit:cover}
.z-neighbor-info{flex:1;min-width:0}
.z-neighbor-title{font-size:14px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.z-neighbor-artist{font-size:12px;color:var(--text-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.z-neighbor-score{font-family:-apple-system,'SF Mono',monospace;font-size:12px;font-weight:700;color:var(--accent);flex-shrink:0}

/* Genres */
.z-genres{display:flex;flex-direction:column;gap:12px}
.z-genre-row{display:grid;grid-template-columns:100px 1fr 44px;gap:10px;align-items:center}
.z-genre-name{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.z-genre-track{height:6px;background:var(--bg-2);border-radius:3px;overflow:hidden}
.z-genre-fill{height:100%;border-radius:3px}
.z-genre-pct{font-family:-apple-system,'SF Mono',monospace;font-size:12px;font-weight:700;text-align:right}

/* Market */
.z-market{display:flex;flex-direction:column;gap:0}
.z-market-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}
.z-market-stat{background:#fff;border-radius:12px;padding:14px;box-shadow:var(--card-shadow)}
.z-market-label{font-family:-apple-system,'SF Mono',monospace;font-size:10px;color:var(--text-2);letter-spacing:0.6px;margin-bottom:4px}
.z-market-val{font-size:20px;font-weight:800;letter-spacing:-0.5px}
.z-market-cities-label{font-family:-apple-system,'SF Mono',monospace;font-size:11px;color:var(--text-2);letter-spacing:1px;font-weight:700;margin-bottom:10px}
.z-market-city{display:grid;grid-template-columns:20px 1fr 50px;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid rgba(60,60,67,0.06);font-size:13px}
.z-market-city:last-child{border-bottom:none}
.z-market-city-rank{font-family:-apple-system,'SF Mono',monospace;font-size:10px;color:var(--text-3)}
.z-market-city-name{font-weight:500}
.z-market-city-val{font-family:-apple-system,'SF Mono',monospace;font-size:12px;color:var(--accent);text-align:right;font-weight:700}

/* DSP Grid */
.z-dsp-grid{display:flex;flex-direction:column;gap:8px;margin-bottom:20px}
.z-dsp-card{display:flex;align-items:center;gap:12px;padding:14px 16px;background:#fff;border-radius:12px;box-shadow:var(--card-shadow)}
.z-dsp-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.z-dsp-dot.live{background:var(--green);box-shadow:0 0 8px var(--green);animation:z-pulse 2s ease-in-out infinite}
.z-dsp-dot.pilot{background:#ff9f0a;box-shadow:0 0 6px rgba(255,159,10,0.5)}
.z-dsp-dot.queue{background:var(--text-3)}
.z-dsp-info{flex:1;min-width:0}
.z-dsp-name{font-size:14px;font-weight:700;letter-spacing:-0.2px}
.z-dsp-meta{font-size:11px;color:var(--text-2);margin-top:1px}
.z-dsp-tag{font-family:-apple-system,'SF Mono',monospace;font-size:9px;font-weight:700;letter-spacing:0.6px;padding:4px 8px;border-radius:6px;flex-shrink:0}
.z-dsp-tag.live{background:rgba(52,199,89,0.1);color:var(--green)}
.z-dsp-tag.pilot{background:rgba(255,159,10,0.1);color:#cc7700}
.z-dsp-tag.queue{background:var(--bg-2);color:var(--text-3)}

/* Pricing */
.z-pricing{display:flex;flex-direction:column;gap:10px;margin-bottom:24px}
.z-price-card{padding:18px;background:#fff;border-radius:14px;box-shadow:var(--card-shadow)}
.z-price-card.featured{box-shadow:0 2px 16px rgba(250,35,59,0.12);border:1px solid rgba(250,35,59,0.15)}
.z-price-tier{font-family:-apple-system,'SF Mono',monospace;font-size:9px;letter-spacing:1px;color:var(--text-3);margin-bottom:4px}
.z-price-name{font-size:18px;font-weight:800;letter-spacing:-0.3px;margin-bottom:4px}
.z-price-amount{font-size:28px;font-weight:800;letter-spacing:-1px;margin-bottom:4px}
.z-price-amount span{font-size:13px;font-weight:500;color:var(--text-2)}
.z-price-detail{font-size:12px;color:var(--text-2);margin-bottom:12px}
.z-price-btn{
  width:100%;padding:10px;border-radius:100px;font-size:13px;font-weight:600;
  background:var(--bg-2);color:var(--text);transition:transform 0.15s;
}
.z-price-btn:active{transform:scale(0.97)}
.z-price-btn.primary{background:var(--accent);color:#fff;box-shadow:0 4px 12px rgba(250,35,59,0.25)}

/* Exit quote */
.z-exit-quote{
  font-size:18px;font-weight:600;letter-spacing:-0.3px;line-height:1.4;
  text-align:center;color:var(--text-2);margin:24px 0 8px;
}
.z-exit-meta{
  font-family:-apple-system,'SF Mono',monospace;font-size:10px;color:var(--text-3);
  letter-spacing:1px;text-align:center;margin-bottom:20px;
}

/* JSON */
.z-json{padding:0}
.z-json pre{
  background:var(--bg-2);border-radius:12px;padding:16px;
  font-family:-apple-system,'SF Mono','JetBrains Mono',monospace;font-size:11px;
  color:var(--text);line-height:1.6;overflow-x:auto;white-space:pre-wrap;word-break:break-all;
  margin-bottom:12px;
}
.z-copy-btn{
  display:flex;align-items:center;justify-content:center;gap:8px;
  width:100%;padding:10px;border-radius:10px;
  background:var(--bg-2);font-size:13px;font-weight:600;color:var(--text-2);transition:transform 0.15s;
}
.z-copy-btn:active{transform:scale(0.97)}
.z-copy-btn svg{width:14px;height:14px}

/* ─── MINI PLAYER ─── */
.z-mini-player{
  position:fixed;bottom:60px;left:0;right:0;z-index:100;
  background:rgba(255,255,255,0.97);
  backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);
  box-shadow:0 -1px 0 rgba(0,0,0,0.04);
  padding:8px 16px;display:flex;align-items:center;gap:10px;
  max-width:520px;margin:0 auto;
}
.z-mini-progress{position:absolute;top:0;left:0;right:0;height:2px;background:rgba(0,0,0,0.06)}
.z-mini-progress-fill{height:100%;background:var(--accent);transition:width 0.3s linear}
.z-mini-art{width:42px;height:42px;border-radius:8px;overflow:hidden;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
.z-mini-art img{width:100%;height:100%;object-fit:cover}
.z-mini-info{flex:1;min-width:0}
.z-mini-track{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.z-mini-artist{font-size:11px;color:var(--text-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.z-mini-btn{
  width:34px;height:34px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  transition:transform 0.15s;
}
.z-mini-btn:first-of-type{background:var(--accent);color:#fff;box-shadow:0 2px 8px rgba(250,35,59,0.25)}
.z-mini-btn:last-of-type{background:var(--bg-2);color:var(--text-2)}
.z-mini-btn:active{transform:scale(0.9)}
.z-mini-btn svg{width:14px;height:14px}

/* ─── TAB BAR ─── */
.z-tab-bar{
  position:fixed;bottom:0;left:0;right:0;z-index:90;
  display:flex;justify-content:space-around;align-items:flex-start;
  padding:6px 4px 8px;
  background:rgba(255,255,255,0.95);
  backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);
  box-shadow:0 -1px 0 rgba(0,0,0,0.04);
  max-width:520px;margin:0 auto;
}
@supports(padding-bottom: env(safe-area-inset-bottom)){
  .z-tab-bar{padding-bottom:calc(8px + env(safe-area-inset-bottom))}
}
.z-tab{
  display:flex;flex-direction:column;align-items:center;gap:2px;
  padding:2px 0;color:var(--text-3);font-size:10px;font-weight:500;
  letter-spacing:0.2px;transition:color 0.2s;min-width:0;
}
.z-tab svg{width:24px;height:24px;transition:transform 0.15s}
.z-tab.active{color:var(--accent)}
.z-tab.active svg{transform:scale(1.05)}

/* ─── TOAST ─── */
.z-toast{
  position:fixed;top:60px;left:50%;transform:translateX(-50%) translateY(-100px);
  background:var(--accent);color:#fff;padding:10px 20px;border-radius:100px;
  font-size:13px;font-weight:600;z-index:9999;
  box-shadow:0 8px 24px rgba(250,35,59,0.3);
  transition:transform 0.3s cubic-bezier(0.32,0.72,0,1);
  display:flex;align-items:center;gap:8px;white-space:nowrap;max-width:calc(100vw - 36px);
}
.z-toast.show{transform:translateX(-50%) translateY(0)}
.z-toast svg{width:14px;height:14px;flex-shrink:0}

*::-webkit-scrollbar{display:none}
`;
