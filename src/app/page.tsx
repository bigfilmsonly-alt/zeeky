"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA ───
const SAMPLES: Record<string, Sample> = {
  scarface: {
    track:"Scarface", artist:"Zeeky", album:"C'est la vie",
    art:"art-scarface", score:87, isrc:"USAT22408391",
    radarPcts:{TEMPO:78,CHROMA:84,BASS:92,ROLLOFF:71,MELODY:65,"PERC.":82,MFCC:88},
    neighbors:[
      {t:"Harlem Shake",a:"Future ft Young Thug",p:87.0,art:"art-harlem"},
      {t:"Having Our Way",a:"Migos ft Drake",p:86.1,art:"art-having"},
      {t:"Golden Child",a:"Lil Durk",p:85.9,art:"art-golden"},
      {t:"Said Sum",a:"Moneybagg Yo",p:85.0,art:"art-said"},
      {t:"What Happened To Virgil",a:"Lil Durk ft Gunna",p:85.9,art:"art-virgil"},
      {t:"mop",a:"Gunna, Young Thug",p:84.8,art:"art-mop"},
      {t:"Sup Mate",a:"Young Thug ft Future",p:84.8,art:"art-sup"},
      {t:"poochie gown",a:"Gunna",p:84.7,art:"art-poochie"},
      {t:"I'm The Plug",a:"Drake ft Future",p:84.3,art:"art-plug"},
      {t:"NC-17",a:"Travis Scott",p:84.1,art:"art-nc17"},
    ],
    genres:[{n:"Trap Rap",p:39.4,c:"#f5c542"},{n:"Southern Hip-Hop",p:27.5,c:"#ff6b6b"},{n:"Outliers",p:16.2,c:"#9b9b9b"},{n:"Pop Rap",p:9.2,c:"#7ed957"},{n:"Drill",p:7.7,c:"#4a90e2"}],
    market:{hit:89,conf:"\u00B14%",demo:"M 18-34",reach:"2.4M",cities:[{n:"Atlanta",v:"32K"},{n:"Houston",v:"28K"},{n:"Los Angeles",v:"25K"},{n:"New York",v:"22K"},{n:"Chicago",v:"19K"}]}
  },
  gold: {
    track:"Gold", artist:"Zeeky", album:"C'est la vie",
    art:"art-gold", score:79, isrc:"USAT22408392",
    radarPcts:{TEMPO:65,CHROMA:72,BASS:55,ROLLOFF:58,MELODY:81,"PERC.":62,MFCC:75},
    neighbors:[
      {t:"Cinema",a:"Harry Styles",p:79.8,art:"art-trap"},{t:"All Good Girls Go to Hell",a:"Billie Eilish",p:79.6,art:"art-night"},
      {t:"Haciendo que me amas",a:"Bad Bunny",p:79.1,art:"art-violet"},{t:"Soul Sista",a:"Bilal",p:77.1,art:"art-waves"},
      {t:"I Didn't Change My Number",a:"Billie Eilish",p:75.9,art:"art-azure"},{t:"Getting Older",a:"Billie Eilish",p:75.6,art:"art-midnight"},
      {t:"Matilda",a:"Harry Styles",p:73.5,art:"art-neon"},{t:"ilomilo",a:"Billie Eilish",p:70.6,art:"art-inferno"},
      {t:"Give In To Me",a:"Garrett Hedlund",p:70.3,art:"art-trap"},{t:"I don't wanna know",a:"Mario Winans",p:70.0,art:"art-night"},
    ],
    genres:[{n:"Pop",p:34.2,c:"#ee0979"},{n:"R&B / Soul",p:28.6,c:"#9b51e0"},{n:"Indie Pop",p:18.4,c:"#4a90e2"},{n:"Alt Rock",p:11.5,c:"#7ed957"},{n:"Latin Pop",p:7.3,c:"#f5c542"}],
    market:{hit:81,conf:"\u00B15%",demo:"F 18-29",reach:"1.8M",cities:[{n:"Los Angeles",v:"24K"},{n:"New York",v:"22K"},{n:"London",v:"19K"},{n:"Toronto",v:"14K"},{n:"Miami",v:"12K"}]}
  },
};

interface Neighbor { t:string; a:string; p:number; art:string }
interface Genre { n:string; p:number; c:string }
interface Sample {
  track:string; artist:string; album:string; art:string; score:number; isrc:string;
  radarPcts:Record<string,number>; neighbors:Neighbor[]; genres:Genre[];
  market:{hit:number;conf:string;demo:string;reach:string;cities:{n:string;v:string}[]};
}

// iTunes artwork cache
const artCache = new Map<string, string>();
async function fetchArtwork(track: string, artist: string): Promise<string> {
  const key = `${track}|${artist}`;
  if (artCache.has(key)) return artCache.get(key)!;
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(track+" "+artist)}&entity=song&limit=1`);
    const data = await res.json();
    const url = data.results?.[0]?.artworkUrl100?.replace("100x100", "300x300") || "";
    if (url) artCache.set(key, url);
    return url;
  } catch { return ""; }
}

// iTunes preview URL cache
const previewCache = new Map<string, string>();
async function fetchPreview(track: string, artist: string): Promise<string> {
  const key = `${track}|${artist}`;
  if (previewCache.has(key)) return previewCache.get(key)!;
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(track+" "+artist)}&entity=song&limit=1`);
    const data = await res.json();
    const url = data.results?.[0]?.previewUrl || "";
    const art = data.results?.[0]?.artworkUrl100?.replace("100x100", "300x300") || "";
    if (url) previewCache.set(key, url);
    if (art) artCache.set(key, art);
    return url;
  } catch { return ""; }
}

const PLAY_ICON = <path d="M8 5v14l11-7z"/>;

export default function ZeekyPage() {
  const [mode, setMode] = useState<"b2b"|"b2c">("b2b");
  const [sample, setSample] = useState<Sample>(SAMPLES.scarface);
  const [sampleKey, setSampleKey] = useState("scarface");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [resultsTab, setResultsTab] = useState("neighbors");
  const [latency, setLatency] = useState(117);
  const [analyzeStep, setAnalyzeStep] = useState("");
  const [toast, setToast] = useState<string|null>(null);
  const [b2cPlaying, setB2cPlaying] = useState(false);
  const [b2cProgress, setB2cProgress] = useState(0);
  const [genreAnimated, setGenreAnimated] = useState(true);
  const [displayScore, setDisplayScore] = useState(87);
  const [artworks, setArtworks] = useState<Record<string,string>>({});
  const [nowPlaying, setNowPlaying] = useState<{track:string;artist:string}|null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>|null>(null);
  const audioRef = useRef<HTMLAudioElement|null>(null);

  // Init audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.addEventListener("ended", () => { setB2cPlaying(false); setB2cProgress(0); });
    audioRef.current.addEventListener("timeupdate", () => {
      const a = audioRef.current!;
      if (a.duration) setB2cProgress((a.currentTime / a.duration) * 100);
    });
    return () => { audioRef.current?.pause(); };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") { e.preventDefault(); toggleAudio(); }
      if (e.code === "ArrowRight") { e.preventDefault(); const keys = Object.keys(SAMPLES); const cur = keys.indexOf(sampleKey); const next = keys[(cur+1)%keys.length]; loadSample(next); }
      if (e.code === "ArrowLeft") { e.preventDefault(); const keys = Object.keys(SAMPLES); const cur = keys.indexOf(sampleKey); const prev = keys[(cur-1+keys.length)%keys.length]; loadSample(prev); }
      if (e.code === "Tab") { e.preventDefault(); const tabs = ["neighbors","radar","genres","market","json"]; const cur = tabs.indexOf(resultsTab); setResultsTab(tabs[(cur+1)%tabs.length]); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  // Fetch artworks for current sample neighbors
  useEffect(() => {
    sample.neighbors.forEach(n => {
      fetchArtwork(n.t, n.a).then(url => {
        if (url) setArtworks(prev => ({ ...prev, [`${n.t}|${n.a}`]: url }));
      });
    });
    fetchArtwork(sample.track, sample.artist).then(url => {
      if (url) setArtworks(prev => ({ ...prev, [`${sample.track}|${sample.artist}`]: url }));
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
    showToast(`Loading "${track}"\u2026`);
    const url = await fetchPreview(track, artist);
    if (url) {
      audio.src = url;
      audio.play().catch(() => {});
      setB2cPlaying(true);
      setB2cProgress(0);
      showToast(`Now playing: ${track}`);
    } else {
      showToast(`Preview not available for "${track}"`);
    }
  }, [showToast]);

  const toggleAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) { audio.play().catch(() => {}); setB2cPlaying(true); }
    else { audio.pause(); setB2cPlaying(false); }
  }, []);

  const openApple = useCallback((track: string, artist: string) => {
    playTrack(track, artist);
  }, [playTrack]);

  const runAnalysis = useCallback((s: Sample) => {
    if (isAnalyzing) return;
    setIsAnalyzing(true); setShowResults(false); setGenreAnimated(false);
    const steps = ["Computing chroma vectors\u2026","Extracting MFCC coefficients\u2026","Mapping to Hilbert space\u2026","Querying 100M-song index\u2026","Ranking by proximity\u2026"];
    let i = 0; setAnalyzeStep(steps[0]);
    const iv = setInterval(() => { i++; if (i < steps.length) setAnalyzeStep(steps[i]); }, 240);
    setTimeout(() => {
      clearInterval(iv); setIsAnalyzing(false); setShowResults(true); setSample(s);
      setLatency(90 + Math.floor(Math.random() * 50));
      setTimeout(() => setGenreAnimated(true), 50);
      // Animated score counter
      let frame = 0; const target = s.score; const dur = 40;
      const counter = setInterval(() => {
        frame++;
        const progress = Math.min(frame / dur, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayScore(Math.round(eased * target));
        if (frame >= dur) clearInterval(counter);
      }, 20);
    }, 1400);
  }, [isAnalyzing]);

  const loadSample = useCallback((key: string) => {
    setSampleKey(key); runAnalysis(SAMPLES[key] || SAMPLES.scarface);
  }, [runAnalysis]);

  const curTime = Math.floor((b2cProgress / 100) * 30);
  const remTime = 30 - curTime;

  const getArt = (track: string, artist: string) => artworks[`${track}|${artist}`] || "";
  const radarKeys = Object.keys(sample.radarPcts);
  const radarPoints = radarKeys.map((_, i) => {
    const angle = (i / radarKeys.length) * Math.PI * 2 - Math.PI / 2;
    const r = (Object.values(sample.radarPcts)[i] / 100) * 90;
    return [160 + r * Math.cos(angle), 120 + r * Math.sin(angle)];
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />

      <div className="app">
        {/* TOPBAR */}
        <div className="topbar">
          <div className="brand"><div className="brand-mark"><span>Z</span></div><span>ZEEKY</span></div>
          <div className="status-pill"><span className="dot"/><span>API · LIVE · 100M</span></div>
          <button className="menu-btn" onClick={()=>document.getElementById("pricing")?.scrollIntoView({behavior:"smooth"})}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
        </div>

        {/* HERO */}
        <section className="hero">
          <div className="hero-eyebrow"><span className="dot"/><span>PATENTED · 84 ATTRIBUTES · 100M SONGS</span></div>
          <h1>The recommendation engine, <em>running live</em> in your browser.</h1>
          <p className="hero-sub">Drop a song. Get the 25 nearest neighbors in 84-dimensional DNA space. The same engine we license to DSPs.</p>
          <div className="audience-toggle">
            <button className={`audience-btn ${mode==="b2b"?"active":""}`} onClick={()=>setMode("b2b")}><span className="micro">&#x25B8; FOR DSPs</span><span>License the Engine</span></button>
            <button className={`audience-btn b2c ${mode==="b2c"?"active":""}`} onClick={()=>setMode("b2c")}><span className="micro">&#x25B8; FOR LISTENERS</span><span>Try the Player</span></button>
          </div>
        </section>

        {/* B2B DEMO */}
        {mode==="b2b" && <div className="demo-card">
          <div className="demo-header"><div className="demo-tag"><span className="dot"/><span>LIVE ENGINE · DNA-V3.2</span></div><div className="demo-meta">&#9201; {latency}ms</div></div>
          <div className="input-zone">
            <div className="input-label">&#x25B8; ANALYZE A SEED TRACK</div>
            <div className="input-row"><input type="text" placeholder="Paste Spotify URL, ISRC, or song name\u2026"/><button className="analyze-btn" onClick={()=>runAnalysis(sample)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>Analyze</button></div>
            <div className="samples">{(["scarface","gold"] as const).map(k=><button key={k} className={`sample-chip ${sampleKey===k?"active":""}`} onClick={()=>loadSample(k)}><div className={`sample-chip-art ${SAMPLES[k].art}`}/>{SAMPLES[k].track} &mdash; {SAMPLES[k].artist}</button>)}</div>
          </div>
          {isAnalyzing && <div className="analyzing"><div className="analyzing-bars">{Array.from({length:7},(_,i)=><div key={i} className="analyzing-bar" style={{animationDelay:`${i*0.1}s`}}/>)}</div><div className="analyzing-text">&#x25B8; EXTRACTING 84 ATTRIBUTES</div><div className="analyzing-step">{analyzeStep}</div></div>}
          {showResults && !isAnalyzing && <div className="results">
            <div className="results-header"><div className="results-art">{getArt(sample.track,sample.artist)?<img src={getArt(sample.track,sample.artist)} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:8}}/>:<div className={`art ${sample.art}`}/>}</div><div className="results-meta"><div className="results-track">{sample.track}</div><div className="results-artist">{sample.artist} · {sample.album}</div></div><div className="results-score"><div className="results-score-num">{displayScore}</div><div className="results-score-label">DNA Match</div></div></div>
            <div className="results-tabs">{["neighbors","radar","genres","market","json"].map(t=><button key={t} className={`results-tab ${resultsTab===t?"active":""}`} onClick={()=>{setResultsTab(t);if(t==="genres")setTimeout(()=>setGenreAnimated(true),50);}}>{t==="json"?"API Response":t.charAt(0).toUpperCase()+t.slice(1)}</button>)}</div>
            {resultsTab==="neighbors"&&<div className="neighbors">{sample.neighbors.map((n,i)=><div key={i} className="neighbor" onClick={()=>playTrack(n.t,n.a)} style={{cursor:"pointer"}}><div className="neighbor-rank">{nowPlaying?.track===n.t?<span style={{color:"var(--blue-2)"}}>&#9654;</span>:String(i+1).padStart(2,"0")}</div><div className="neighbor-art">{getArt(n.t,n.a)?<img src={getArt(n.t,n.a)} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div className={`art ${n.art}`}/>}</div><div className="neighbor-info"><div className="neighbor-title" style={nowPlaying?.track===n.t?{color:"var(--blue-2)"}:undefined}>{n.t}</div><div className="neighbor-artist">{n.a}</div></div><div className="neighbor-bar"><div className="neighbor-bar-fill" style={{width:`${n.p}%`}}/></div><div className="neighbor-pct">{n.p.toFixed(1)}%</div><button className="neighbor-apple" onClick={(e)=>{e.stopPropagation();openApple(n.t,n.a);}}><svg viewBox="0 0 24 24" fill="currentColor">{PLAY_ICON}</svg></button></div>)}</div>}
            {resultsTab==="radar"&&<div className="radar-wrap"><svg className="radar-svg" viewBox="0 0 320 240"><defs><radialGradient id="rg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#4a90e2" stopOpacity="0.6"/><stop offset="100%" stopColor="#9b51e0" stopOpacity="0.1"/></radialGradient></defs><g stroke="rgba(255,255,255,0.08)" fill="none">{[100,75,50,25].map(r=><circle key={r} cx="160" cy="120" r={r}/>)}</g><polygon points={radarPoints.map(p=>p.join(",")).join(" ")} fill="url(#rg)" stroke="#4a90e2" strokeWidth="1.5"/>{radarPoints.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3" fill="#4a90e2"/>)}{radarKeys.map((k,i)=>{const a=(i/radarKeys.length)*Math.PI*2-Math.PI/2;return<text key={k} x={160+115*Math.cos(a)} y={120+115*Math.sin(a)} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.65)" fontFamily="JetBrains Mono,monospace" fontSize="9" fontWeight="500">{k}</text>})}</svg><div className="radar-legend">{Object.entries(sample.radarPcts).map(([k,v])=><div key={k} className="radar-attr"><span className="radar-attr-name">{k}</span><span className="radar-attr-val">{v}%</span></div>)}</div></div>}
            {resultsTab==="genres"&&<div className="genres">{sample.genres.map(g=><div key={g.n} className="genre-bar"><div className="genre-label">{g.n}</div><div className="genre-bar-track"><div className="genre-bar-fill" style={{width:genreAnimated?`${g.p}%`:"0",background:g.c,transition:"width 0.8s cubic-bezier(0.2,0.8,0.2,1)"}}/></div><div className="genre-pct">{g.p}%</div></div>)}</div>}
            {resultsTab==="market"&&<div className="market"><div className="market-grid"><div className="market-stat"><div className="market-stat-label">Hit Score</div><div className="market-stat-val">{sample.market.hit}%</div></div><div className="market-stat"><div className="market-stat-label">Confidence</div><div className="market-stat-val">{sample.market.conf}</div></div><div className="market-stat"><div className="market-stat-label">Core Demo</div><div className="market-stat-val">{sample.market.demo}</div></div><div className="market-stat"><div className="market-stat-label">Reach</div><div className="market-stat-val">{sample.market.reach}</div></div></div><div className="input-label" style={{marginTop:14}}>&#x25B8; TOP CITIES</div>{sample.market.cities.map((c,i)=><div key={c.n} className="market-city"><div className="market-city-rank">{i+1}</div><div className="market-city-name">{c.n}</div><div className="market-city-num">{c.v}</div></div>)}</div>}
            {resultsTab==="json"&&<div className="json-pane"><pre style={{background:"rgba(0,0,0,0.4)",border:"1px solid var(--line)",borderRadius:10,padding:14,color:"rgba(255,255,255,0.75)",overflowX:"auto",fontSize:11,lineHeight:1.5}}>{`# POST /v1/dna/recommend · 200 OK · ${latency}ms\n{\n  "seed": "${sample.track} — ${sample.artist}",\n  "isrc": "${sample.isrc}",\n  "dna_score": ${(sample.score/100).toFixed(3)},\n  "results": [\n${sample.neighbors.slice(0,5).map(n=>`    { "track": "${n.t}", "artist": "${n.a}", "score": ${(n.p/100).toFixed(3)} }`).join(",\n")},\n    // + ${sample.neighbors.length-5} more\n  ],\n  "latency_ms": ${latency},\n  "engine": "dna-v3.2"\n}`}</pre></div>}
            <div className="results-footer"><button className="footer-btn apple" onClick={()=>openApple(sample.track,sample.artist)}><svg viewBox="0 0 24 24" fill="currentColor">{PLAY_ICON}</svg>Play Preview</button><button className="footer-btn api" onClick={()=>{navigator.clipboard?.writeText(`curl https://api.zeeky.fm/v1/dna/recommend -H "Authorization: Bearer $ZEEKY_KEY" -d '{"seed_track":"isrc:${sample.isrc}","limit":25}'`).then(()=>showToast("API call copied"));}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copy API Call</button></div>
          </div>}
        </div>}

        {/* B2C PLAYER */}
        {mode==="b2c"&&<div className="b2c-player">
          <div className={`b2c-art ${b2cPlaying?"playing":""}`} onClick={()=>playTrack(sample.track,sample.artist)} style={{cursor:"pointer"}}>{getArt(sample.track,sample.artist)?<img src={getArt(sample.track,sample.artist)} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div className={`art ${sample.art}`}/>}<div className="b2c-art-overlay"><div className="b2c-art-eyebrow"><span className="dot"/><span>NOW PLAYING · DNA SCORE {sample.score}%</span></div><div className="b2c-art-title">{sample.track}</div><div className="b2c-art-artist">{sample.artist} · {sample.album}</div></div></div>
          <div className="b2c-controls">
            <div className="b2c-progress" onClick={e=>{const r=e.currentTarget.getBoundingClientRect();setB2cProgress(((e.clientX-r.left)/r.width)*100);}}><div className="b2c-progress-fill" style={{width:`${b2cProgress}%`}}/></div>
            <div className="b2c-times"><span>0:{String(curTime).padStart(2,"0")}</span><span>&minus;0:{String(remTime).padStart(2,"0")}</span></div>
            <div className="b2c-preview-tag">&#x25B8; FREE 30-SECOND PREVIEW</div>
            <div className="b2c-transport">
              <button className="b2c-transport-btn" onClick={()=>setB2cProgress(p=>Math.max(0,p-25))}><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
              <button className="b2c-play" onClick={()=>{if(!nowPlaying)playTrack(sample.track,sample.artist);else toggleAudio();}}><svg viewBox="0 0 24 24" fill="currentColor">{b2cPlaying?<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>:<path d="M8 5v14l11-7z"/>}</svg></button>
              <button className="b2c-transport-btn" onClick={()=>{const keys=Object.keys(SAMPLES);const cur=keys.indexOf(sampleKey);const next=keys[(cur+1)%keys.length];setSampleKey(next);setSample(SAMPLES[next]);setB2cProgress(0);}}><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></button>
            </div>
            <button className="b2c-apple" onClick={()=>openApple(sample.track,sample.artist)}><div className="b2c-apple-icon"><svg viewBox="0 0 24 24" fill="currentColor">{PLAY_ICON}</svg></div><div className="b2c-apple-meta"><div className="b2c-apple-eyebrow">30-SECOND PREVIEW</div><div className="b2c-apple-title">Play on Zeeky</div></div><div className="b2c-apple-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div></button>
          </div>
          <div className="b2c-queue"><div className="b2c-queue-h">UP NEXT · DNA QUEUE</div>{sample.neighbors.slice(0,5).map((n,i)=><div key={i} className="queue-track"><div className="queue-track-main" onClick={()=>{setSample({...sample,track:n.t,artist:n.a,art:n.art,score:Math.round(n.p),album:"Apple Music"});playTrack(n.t,n.a);}}><div className="queue-art">{getArt(n.t,n.a)?<img src={getArt(n.t,n.a)} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:5}}/>:<div className={`art ${n.art}`}/>}</div><div className="queue-info"><div className="queue-title">{n.t}</div><div className="queue-artist">{n.a}</div></div><div className="queue-pct">{n.p.toFixed(0)}%</div></div><button className="queue-apple" onClick={()=>openApple(n.t,n.a)}><svg viewBox="0 0 24 24" fill="currentColor">{PLAY_ICON}</svg></button></div>)}</div>
        </div>}

        {/* ENGINE */}
        <section className="section" id="engine">
          <div className="section-eyebrow">&#x25B8; THE ENGINE</div>
          <h2 className="section-title">Tags are <em>subjective</em>.<br/>DNA is <em>math</em>.</h2>
          <p className="section-sub">DSPs rely on human-tagged metadata to decide what plays next. We extract 84 mathematical attributes from the audio file itself and project every song onto a unit sphere in Hilbert space. Recommendation becomes geometry.</p>
          <div className="pillars">
            <div className="pillar"><div className="pillar-label">&#x25B8; INDEX</div><div className="pillar-h">100M songs, fingerprinted.</div><div className="pillar-p">Continuously expanding. Every song ranked by genre, tempo, mood, and Billboard correlation across 84 attributes.</div></div>
            <div className="pillar"><div className="pillar-label">&#x25B8; MATCH</div><div className="pillar-h">Proximity in 84-D space.</div><div className="pillar-p">Find the 25 nearest neighbors to any track in &lt;120ms. Distance is the angle between two vectors in Hilbert space.</div></div>
            <div className="pillar"><div className="pillar-label">&#x25B8; LEARN</div><div className="pillar-h">Self-weighting models.</div><div className="pillar-p">DNA recalibrates per-user from skips, completes, and saves. Every listener becomes a personal recommendation equation.</div></div>
          </div>
          <div className="equation"><div className="equation-label">&#x25B8; THE RECOMMENDATION EQUATION</div><div className="equation-math">rec <span className="op">=</span> <span className="greek">&Sigma;</span> ( w<span className="var">&#x1D62;</span> <span className="op">&times;</span> attr<span className="var">&#x1D62;</span> )</div><div className="equation-foot"><span className="var" style={{color:"#d19a66"}}>i</span> = 1 to 84 · weights from user feedback · attributes from audio · output &#x2208; [0, 1]</div></div>
          <div className="ticker"><div className="ticker-stat"><div className="ticker-num">100M+</div><div className="ticker-desc">Indexed Songs</div></div><div className="ticker-stat"><div className="ticker-num">84</div><div className="ticker-desc">DNA Attrs</div></div><div className="ticker-stat"><div className="ticker-num">&lt;120ms</div><div className="ticker-desc">P95 Latency</div></div><div className="ticker-stat"><div className="ticker-num">99.97%</div><div className="ticker-desc">Uptime</div></div></div>
        </section>

        {/* DSP */}
        <section className="section">
          <div className="section-eyebrow">&#x25B8; DEPLOYMENTS</div>
          <h2 className="section-title">Built for the platforms<br/>that <em>shape listening</em>.</h2>
          <p className="section-sub">Non-exclusive licensing today. Exclusive acquisition tomorrow.</p>
          <div className="dsp-grid">{[{name:"Apple Music",meta:"B2C affiliate · revenue active",status:"live"},{name:"Tier-1 DSP",meta:"A/B pilot · 2.4M cohort · +18% session",status:"pilot"},{name:"Streaming Major",meta:"Technical eval scheduled Q2",status:"queue"},{name:"Tidal · YT Music · Amazon",meta:"Outbound in motion",status:"queue"}].map(d=><div key={d.name} className="dsp-card"><div className={`dsp-status ${d.status}`}/><div className="dsp-info"><div className="dsp-name">{d.name}</div><div className="dsp-meta">{d.meta}</div></div><div className={`dsp-tag ${d.status}`}>{d.status.toUpperCase()}</div></div>)}</div>
        </section>

        {/* PRICING */}
        <section className="section" id="pricing">
          <div className="section-eyebrow">&#x25B8; LICENSING</div>
          <h2 className="section-title">Three ways to<br/><em>plug us in</em>.</h2>
          <p className="section-sub">Start non-exclusive. Scale to category-exclusive. End at acquisition.</p>
          <div className="pricing-grid">
            <div className="price-card"><div className="price-tier">&#x25B8; TIER 01</div><div className="price-name">Pilot</div><div className="price-tagline">Test the engine. Prove the lift. Decide.</div><div className="price-amount"><div className="price-num">$25K<span>/mo</span></div><div className="price-per">90-day pilot · 2M API calls</div></div><ul className="price-features"><li>1 environment</li><li>A/B dashboard</li><li>Slack support · 24h SLA</li></ul><button className="price-cta" onClick={()=>window.location.href="mailto:partnerships@zeeky.fm?subject=Pilot%20Inquiry"}>Start a Pilot &rarr;</button></div>
            <div className="price-card featured"><div className="price-tier">&#x25B8; TIER 02</div><div className="price-name">Production</div><div className="price-tagline">Full deployment. Non-exclusive.</div><div className="price-amount"><div className="price-num">$200K<span>/yr+</span></div><div className="price-per">Base + usage above 50M queries</div></div><ul className="price-features"><li>Unlimited environments</li><li>SOC 2 Type II</li><li>Dedicated infra · &lt;120ms P95</li><li>Co-marketing rights</li><li>Quarterly model retraining</li></ul><button className="price-cta" onClick={()=>window.location.href="mailto:partnerships@zeeky.fm?subject=Production%20License"}>Talk to Sales &rarr;</button></div>
            <div className="price-card"><div className="price-tier">&#x25B8; TIER 03</div><div className="price-name">Exclusive</div><div className="price-tagline">Category lock. The final license before acquisition.</div><div className="price-amount"><div className="price-num" style={{fontSize:24}}>Custom</div><div className="price-per">8-figure floor · multi-year</div></div><ul className="price-features"><li>Category exclusivity</li><li>Patent licensing rights</li><li>Source code escrow</li><li>First right to acquire</li></ul><button className="price-cta" onClick={()=>window.location.href="mailto:partnerships@zeeky.fm?subject=Exclusive%20Inquiry"}>Inquire Privately &rarr;</button></div>
          </div>
        </section>

        {/* EXIT */}
        <section className="section"><div className="exit-quote">Non-exclusive licensing builds the customer base.<br/><em>Exclusive licensing</em> builds the moat.<br/>Acquisition is the <em>endgame</em>.</div><div className="exit-meta">&#x25B8; ZEEKY ENTERTAINMENT INC. · BUILT FOR ACQUISITION</div></section>

        {/* FOOTER */}
        <footer><div className="footer-meta">&copy; 2026 ZEEKY ENTERTAINMENT INC.<br/>PATENTED HITLAB AI · LICENSED GLOBALLY<br/><span style={{color:"var(--acid)"}}>&#x25CF;</span> API STATUS: OPERATIONAL</div></footer>
      </div>

      {/* STICKY MINI PLAYER */}
      {nowPlaying && (
        <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:"rgba(5,5,7,0.92)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderTop:"1px solid var(--line)",padding:"8px 14px",display:"flex",alignItems:"center",gap:10,maxWidth:480,margin:"0 auto"}}>
          <div style={{width:40,height:40,borderRadius:6,overflow:"hidden",flexShrink:0}}>{getArt(nowPlaying.track,nowPlaying.artist)?<img src={getArt(nowPlaying.track,nowPlaying.artist)} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div className="art art-scarface" style={{width:40,height:40}}/>}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{nowPlaying.track}</div>
            <div style={{fontSize:10,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{nowPlaying.artist}</div>
          </div>
          <button onClick={toggleAudio} style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg viewBox="0 0 24 24" fill="currentColor" style={{width:16,height:16}}>{b2cPlaying?<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>:<path d="M8 5v14l11-7z"/>}</svg>
          </button>
          <button onClick={()=>openApple(nowPlaying.track,nowPlaying.artist)} style={{width:32,height:32,borderRadius:7,background:"linear-gradient(135deg,#4a90e2,#9b51e0)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 2px 6px rgba(74,144,226,0.3)"}}>
            <svg viewBox="0 0 24 24" fill="currentColor" style={{width:14,height:14}}>{PLAY_ICON}</svg>
          </button>
        </div>
      )}

      {/* TOAST */}
      <div className={`toast ${toast?"show":""}`}><svg viewBox="0 0 24 24" fill="currentColor">{PLAY_ICON}</svg><span>{toast}</span></div>
    </>
  );
}

const CSS = `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}body{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Inter",system-ui,sans-serif;background:#000;color:#fff;overscroll-behavior-y:none;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;line-height:1.5}button{font-family:inherit;background:none;border:none;color:inherit;cursor:pointer;outline:none}input,select,textarea{font-family:inherit;outline:none}a{color:inherit;text-decoration:none}:root{--bg:#050507;--bg-2:#0a0a14;--blue:#4a90e2;--blue-2:#6aa9ff;--blue-glow:rgba(74,144,226,0.4);--violet:#9b51e0;--apple:#fa233b;--apple-2:#ff5e3a;--acid:#00ff88;--line:rgba(255,255,255,0.08);--line-2:rgba(255,255,255,0.14);--muted:rgba(255,255,255,0.55)}.app{min-height:100vh;min-height:100dvh;background:radial-gradient(ellipse 80% 40% at 20% 0%,rgba(74,144,226,0.12),transparent 60%),radial-gradient(ellipse 70% 50% at 80% 100%,rgba(155,81,224,0.08),transparent 70%),#050507;overflow-x:hidden}.topbar{position:sticky;top:0;z-index:50;background:rgba(5,5,7,0.7);backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid var(--line);padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px}.brand{display:flex;align-items:center;gap:8px;font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:1px}.brand-mark{width:22px;height:22px;display:flex;align-items:center;justify-content:center;background:#fff;border-radius:5px}.brand-mark span{font-family:'Bebas Neue',sans-serif;color:#000;font-size:18px;line-height:1;transform:skewX(-10deg);margin-top:-1px}.status-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;background:rgba(0,255,136,0.08);border:1px solid rgba(0,255,136,0.25);border-radius:100px;font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--acid);letter-spacing:0.8px;font-weight:600;text-transform:uppercase;white-space:nowrap}.status-pill .dot{width:5px;height:5px;border-radius:50%;background:var(--acid);box-shadow:0 0 8px var(--acid);animation:pulse 1.6s ease-in-out infinite}@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.4)}}.menu-btn{width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center}.menu-btn:active{transform:scale(0.94)}.menu-btn svg{width:14px;height:14px}.hero{padding:36px 18px 28px;position:relative}.hero-eyebrow{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;background:rgba(74,144,226,0.1);border:1px solid rgba(74,144,226,0.25);border-radius:100px;font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--blue-2);letter-spacing:1px;font-weight:600;margin-bottom:22px}.hero-eyebrow .dot{width:5px;height:5px;border-radius:50%;background:var(--blue-2);box-shadow:0 0 6px var(--blue-2);animation:pulse 1.6s ease-in-out infinite}.hero h1{font-size:38px;font-weight:800;letter-spacing:-1.5px;line-height:1;margin-bottom:18px}.hero h1 em{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;color:var(--blue-2);letter-spacing:-0.5px}.hero-sub{font-size:15px;color:rgba(255,255,255,0.7);line-height:1.5;margin-bottom:24px}.audience-toggle{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:4px;background:rgba(255,255,255,0.04);border:1px solid var(--line);border-radius:14px;margin-bottom:20px}.audience-btn{padding:11px 8px;border-radius:10px;font-size:13px;font-weight:600;color:var(--muted);transition:all 0.2s ease;display:flex;flex-direction:column;align-items:center;gap:2px}.audience-btn .micro{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.8px;opacity:0.7}.audience-btn.active{background:rgba(74,144,226,0.15);color:#fff;box-shadow:0 1px 0 rgba(255,255,255,0.05) inset}.audience-btn.active.b2c{background:rgba(250,35,59,0.12)}.demo-card{margin:0 18px 32px;border:1px solid rgba(74,144,226,0.25);border-radius:18px;overflow:hidden;background:radial-gradient(ellipse at top right,rgba(74,144,226,0.18),transparent 60%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01));backdrop-filter:blur(10px)}.demo-header{padding:14px 18px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:10px;background:rgba(0,0,0,0.2)}.demo-tag{display:inline-flex;align-items:center;gap:6px;font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--blue-2);letter-spacing:1.2px;font-weight:600;text-transform:uppercase}.demo-tag .dot{width:5px;height:5px;border-radius:50%;background:var(--acid);box-shadow:0 0 8px var(--acid);animation:pulse 1.6s ease-in-out infinite}.demo-meta{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:0.8px}.input-zone{padding:18px}.input-label{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);letter-spacing:1.2px;font-weight:600;text-transform:uppercase;margin-bottom:8px}.input-row{display:flex;gap:8px;background:rgba(0,0,0,0.4);border:1px solid var(--line-2);border-radius:12px;padding:4px 4px 4px 12px;transition:border-color 0.2s ease}.input-row:focus-within{border-color:var(--blue)}.input-row input{flex:1;background:transparent;border:none;color:#fff;font-size:14px;padding:10px 0;min-width:0}.input-row input::placeholder{color:rgba(255,255,255,0.35)}.analyze-btn{padding:0 16px;background:linear-gradient(135deg,var(--blue),var(--violet));border-radius:9px;font-size:13px;font-weight:700;letter-spacing:-0.1px;color:#fff;display:flex;align-items:center;gap:6px;flex-shrink:0;transition:transform 0.15s ease}.analyze-btn:active{transform:scale(0.96)}.analyze-btn svg{width:12px;height:12px}.samples{margin-top:14px;display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none}.samples::-webkit-scrollbar{display:none}.sample-chip{flex-shrink:0;padding:6px 12px;background:rgba(255,255,255,0.05);border:1px solid var(--line);border-radius:100px;font-size:11px;font-weight:500;color:rgba(255,255,255,0.75);display:flex;align-items:center;gap:6px;transition:all 0.15s ease;white-space:nowrap}.sample-chip:active{transform:scale(0.96)}.sample-chip.active{background:rgba(74,144,226,0.15);border-color:rgba(74,144,226,0.4);color:#fff}.sample-chip-art{width:14px;height:14px;border-radius:3px;flex-shrink:0}.analyzing{padding:28px 20px;text-align:center;border-top:1px solid var(--line)}.analyzing-bars{display:flex;gap:3px;justify-content:center;height:32px;align-items:end;margin-bottom:14px}.analyzing-bar{width:4px;background:linear-gradient(180deg,var(--blue),var(--violet));border-radius:2px;animation:barPulse 1.2s ease-in-out infinite}@keyframes barPulse{0%,100%{height:8px;opacity:0.4}50%{height:32px;opacity:1}}.analyzing-text{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--blue-2);letter-spacing:1px;margin-bottom:4px}.analyzing-step{font-size:11px;color:var(--muted)}.results{border-top:1px solid var(--line)}.results-header{padding:18px 18px 14px;display:flex;align-items:center;gap:12px}.results-art{width:56px;height:56px;border-radius:8px;overflow:hidden;flex-shrink:0;box-shadow:0 4px 14px rgba(0,0,0,0.4)}.results-art .art{width:100%;height:100%}.results-meta{flex:1;min-width:0}.results-track{font-size:16px;font-weight:700;letter-spacing:-0.3px;margin-bottom:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.results-artist{font-size:13px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.results-score{text-align:right;flex-shrink:0}.results-score-num{font-size:24px;font-weight:800;letter-spacing:-1px;color:var(--blue-2);font-variant-numeric:tabular-nums;line-height:1}.results-score-label{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--muted);letter-spacing:0.8px;text-transform:uppercase;margin-top:2px}.results-tabs{display:flex;padding:0 18px;gap:18px;border-bottom:1px solid var(--line);overflow-x:auto;scrollbar-width:none}.results-tabs::-webkit-scrollbar{display:none}.results-tab{padding:10px 0 12px;font-size:12px;font-weight:600;color:var(--muted);border-bottom:2px solid transparent;transition:all 0.2s ease;flex-shrink:0;position:relative;top:1px}.results-tab.active{color:#fff;border-bottom-color:var(--blue)}.neighbors{padding:6px 0 14px}.neighbor{display:flex;align-items:center;gap:10px;padding:10px 18px;border-bottom:0.5px solid rgba(84,84,88,0.3)}.neighbor:last-child{border-bottom:none}.neighbor-rank{width:18px;font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);text-align:right;flex-shrink:0;font-weight:500}.neighbor-art{width:38px;height:38px;border-radius:5px;overflow:hidden;flex-shrink:0}.neighbor-info{flex:1;min-width:0}.neighbor-title{font-size:13px;font-weight:600;letter-spacing:-0.1px;margin-bottom:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.neighbor-artist{font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.neighbor-bar{width:32px;height:3px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;flex-shrink:0}.neighbor-bar-fill{height:100%;background:linear-gradient(90deg,var(--blue),var(--violet))}.neighbor-pct{font-family:'JetBrains Mono',monospace;font-size:11px;color:#fff;font-weight:600;width:38px;text-align:right;flex-shrink:0;font-variant-numeric:tabular-nums}.neighbor-apple{width:30px;height:30px;background:linear-gradient(135deg,var(--blue),var(--violet));border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;box-shadow:0 2px 6px rgba(74,144,226,0.25);transition:transform 0.15s ease}.neighbor-apple:active{transform:scale(0.92)}.neighbor-apple svg{width:13px;height:13px}.genres{padding:14px 18px}.genre-bar{display:grid;grid-template-columns:90px 1fr 44px;gap:10px;align-items:center;margin-bottom:10px}.genre-bar:last-child{margin-bottom:0}.genre-label{font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.genre-bar-track{height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden}.genre-bar-fill{height:100%;border-radius:3px}.genre-pct{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;color:#fff;text-align:right;font-variant-numeric:tabular-nums}.market{padding:14px 18px}.market-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}.market-stat{background:rgba(255,255,255,0.03);border:0.5px solid var(--line);border-radius:10px;padding:10px 12px}.market-stat-label{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:0.8px;margin-bottom:4px;text-transform:uppercase}.market-stat-val{font-size:18px;font-weight:700;letter-spacing:-0.4px;font-variant-numeric:tabular-nums}.market-city{display:grid;grid-template-columns:14px 1fr 50px;gap:8px;align-items:center;padding:7px 0;border-bottom:0.5px solid rgba(84,84,88,0.2);font-size:12px}.market-city:last-child{border-bottom:none}.market-city-rank{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted)}.market-city-name{font-weight:500}.market-city-num{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--blue-2);text-align:right;font-weight:600}.json-pane{padding:14px 18px;font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.5;overflow-x:auto}.results-footer{padding:14px 18px;border-top:1px solid var(--line);display:flex;gap:8px;background:rgba(0,0,0,0.2)}.footer-btn{flex:1;padding:11px;border-radius:10px;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;transition:transform 0.15s ease}.footer-btn:active{transform:scale(0.97)}.footer-btn.apple{background:linear-gradient(135deg,var(--blue),var(--violet));color:#fff;box-shadow:0 4px 12px rgba(74,144,226,0.25)}.footer-btn.api{background:rgba(74,144,226,0.12);border:1px solid rgba(74,144,226,0.3);color:var(--blue-2)}.footer-btn svg{width:13px;height:13px;flex-shrink:0}.art{width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}.art-scarface{background:radial-gradient(circle at 30% 20%,#ff3b30,transparent 50%),radial-gradient(circle at 70% 80%,#1a1a1a,transparent 50%),linear-gradient(135deg,#0a0a0a,#2a0a0a)}.art-gold{background:radial-gradient(circle at 50% 50%,#f5c542,#b8860b 60%,#2a1810)}.art-cestlavie{background:radial-gradient(ellipse at top,#4a90e2 0%,transparent 50%),radial-gradient(ellipse at bottom right,#9b51e0 0%,transparent 60%),linear-gradient(180deg,#1a1a2e,#0a0a14)}.art-trap{background:linear-gradient(135deg,#ff6b6b,#c44569)}.art-night{background:linear-gradient(135deg,#2c3e50,#4a90e2)}.art-waves{background:linear-gradient(135deg,#11998e,#38ef7d)}.art-inferno{background:linear-gradient(135deg,#f12711,#f5af19)}.art-midnight{background:linear-gradient(135deg,#232526,#414345)}.art-violet{background:linear-gradient(135deg,#614385,#516395)}.art-neon{background:linear-gradient(135deg,#ee0979,#ff6a00)}.art-azure{background:linear-gradient(135deg,#00c6ff,#0072ff)}.art-virgil{background:linear-gradient(135deg,#1a1a1a,#444)}.art-said{background:linear-gradient(135deg,#3d4e6f,#1a2238)}.art-mop{background:linear-gradient(135deg,#1f4e3d,#0d2818)}.art-sup{background:linear-gradient(135deg,#5d2e8c,#2d1659)}.art-poochie{background:linear-gradient(135deg,#8b1538,#4a0a1c)}.art-plug{background:linear-gradient(135deg,#0a4d68,#062336)}.art-nc17{background:linear-gradient(135deg,#3d0d0d,#1a0303)}.art-harlem{background:linear-gradient(135deg,#5e0a2e,#1a0212)}.art-having{background:linear-gradient(135deg,#dba514,#7a5a0a)}.art-golden{background:linear-gradient(135deg,#1f6f43,#0a2d1a)}.section{padding:48px 18px;border-top:1px solid var(--line)}.section-eyebrow{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--blue-2);letter-spacing:1.4px;font-weight:600;text-transform:uppercase;margin-bottom:14px;display:flex;align-items:center;gap:8px}.section-eyebrow::before{content:'';width:14px;height:1px;background:var(--blue-2)}.section-title{font-size:30px;font-weight:800;letter-spacing:-1.2px;line-height:1.05;margin-bottom:14px}.section-title em{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;color:var(--blue-2)}.section-sub{font-size:14px;color:rgba(255,255,255,0.6);line-height:1.5;margin-bottom:24px}.pillars{display:grid;gap:10px}.pillar{padding:18px;background:rgba(255,255,255,0.03);border:1px solid var(--line);border-radius:14px}.pillar-label{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--blue-2);letter-spacing:1.2px;font-weight:600;margin-bottom:10px}.pillar-h{font-size:16px;font-weight:700;letter-spacing:-0.2px;margin-bottom:6px}.pillar-p{font-size:13px;color:rgba(255,255,255,0.6);line-height:1.5}.equation{margin-top:20px;padding:18px;border-radius:14px;background:linear-gradient(135deg,rgba(74,144,226,0.08),rgba(155,81,224,0.04));border:1px solid var(--line);overflow-x:auto}.equation-label{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--blue-2);letter-spacing:1.4px;margin-bottom:10px;font-weight:600}.equation-math{font-family:'JetBrains Mono',monospace;font-size:14px;line-height:1.5;letter-spacing:-0.3px;white-space:nowrap}.equation-math .op{color:var(--blue-2)}.equation-math .var{color:#d19a66}.equation-math .greek{color:rgba(255,255,255,0.5)}.equation-foot{margin-top:8px;font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);line-height:1.5}.dsp-grid{display:grid;gap:8px}.dsp-card{padding:14px 16px;background:rgba(255,255,255,0.02);border:1px solid var(--line);border-radius:12px;display:flex;align-items:center;gap:12px}.dsp-status{width:8px;height:8px;border-radius:50%;flex-shrink:0}.dsp-status.live{background:var(--acid);box-shadow:0 0 8px var(--acid);animation:pulse 1.6s ease-in-out infinite}.dsp-status.pilot{background:#ffaa3a;box-shadow:0 0 8px rgba(255,170,58,0.6)}.dsp-status.queue{background:rgba(255,255,255,0.3)}.dsp-info{flex:1;min-width:0}.dsp-name{font-size:14px;font-weight:700;letter-spacing:-0.2px}.dsp-meta{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);letter-spacing:0.5px;margin-top:2px}.dsp-tag{font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;letter-spacing:0.8px;flex-shrink:0;padding:4px 8px;border-radius:4px}.dsp-tag.live{background:rgba(0,255,136,0.12);color:var(--acid)}.dsp-tag.pilot{background:rgba(255,170,58,0.12);color:#ffaa3a}.dsp-tag.queue{background:rgba(255,255,255,0.06);color:var(--muted)}.pricing-grid{display:grid;gap:12px}.price-card{padding:20px;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,0.02);position:relative}.price-card.featured{border-color:rgba(74,144,226,0.4);background:radial-gradient(ellipse at top,rgba(74,144,226,0.12),transparent 70%),rgba(255,255,255,0.04)}.price-card.featured::before{content:'MOST DEPLOYED';position:absolute;top:14px;right:14px;font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:1px;color:var(--blue-2);background:rgba(74,144,226,0.15);padding:3px 7px;border-radius:4px;font-weight:700}.price-tier{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.2px;color:var(--muted);text-transform:uppercase;margin-bottom:8px;font-weight:600}.price-name{font-size:22px;font-weight:800;letter-spacing:-0.5px;margin-bottom:4px}.price-tagline{font-size:12px;color:rgba(255,255,255,0.55);margin-bottom:16px;line-height:1.4}.price-amount{margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid var(--line)}.price-num{font-size:32px;font-weight:800;letter-spacing:-1.5px;line-height:1}.price-num span{font-size:13px;font-weight:500;color:var(--muted);letter-spacing:0}.price-per{font-size:11px;color:var(--muted);margin-top:4px}.price-features{list-style:none;margin-bottom:18px;display:flex;flex-direction:column;gap:8px}.price-features li{font-size:12px;color:rgba(255,255,255,0.75);display:flex;align-items:flex-start;gap:8px;line-height:1.4}.price-features li::before{content:'';width:13px;height:13px;background:rgba(74,144,226,0.15);border-radius:50%;flex-shrink:0;margin-top:2px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234a90e2'%3E%3Cpath d='M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z'/%3E%3C/svg%3E");background-size:9px;background-position:center;background-repeat:no-repeat}.price-cta{width:100%;padding:11px;border-radius:100px;background:rgba(255,255,255,0.06);border:1px solid var(--line-2);color:#fff;font-size:12px;font-weight:600;transition:all 0.2s}.price-cta:active{transform:scale(0.97)}.price-card.featured .price-cta{background:var(--blue);border-color:var(--blue)}.exit-quote{font-family:'Instrument Serif',serif;font-size:24px;line-height:1.3;letter-spacing:-0.5px;margin-bottom:18px;font-weight:400;text-align:center}.exit-quote em{font-style:italic;color:var(--blue-2)}.exit-meta{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);letter-spacing:1.2px;text-transform:uppercase;text-align:center}.b2c-player{margin:0 18px 32px;border-radius:18px;overflow:hidden;background:radial-gradient(ellipse at top right,rgba(74,144,226,0.18),transparent 60%),radial-gradient(ellipse at bottom left,rgba(155,81,224,0.12),transparent 60%),#0a0a14;border:1px solid rgba(74,144,226,0.2)}.b2c-art{aspect-ratio:1;position:relative;overflow:hidden}.b2c-art .art{width:100%;height:100%;transition:transform 4s ease}.b2c-art.playing .art{transform:scale(1.05)}.b2c-art-overlay{position:absolute;bottom:0;left:0;right:0;padding:18px;background:linear-gradient(180deg,transparent,rgba(0,0,0,0.85))}.b2c-art-eyebrow{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--blue-2);letter-spacing:1.2px;margin-bottom:6px;font-weight:600;text-transform:uppercase;display:flex;align-items:center;gap:6px}.b2c-art-eyebrow .dot{width:5px;height:5px;border-radius:50%;background:var(--acid);animation:pulse 1.6s ease-in-out infinite;box-shadow:0 0 6px var(--acid)}.b2c-art-title{font-size:24px;font-weight:800;letter-spacing:-0.5px;margin-bottom:2px;line-height:1.1}.b2c-art-artist{font-size:14px;color:rgba(255,255,255,0.7)}.b2c-controls{padding:18px}.b2c-progress{height:4px;background:rgba(255,255,255,0.12);border-radius:2px;margin-bottom:6px;overflow:hidden;cursor:pointer}.b2c-progress-fill{height:100%;background:#fff;border-radius:2px;transition:width 0.2s linear}.b2c-times{display:flex;justify-content:space-between;font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);margin-bottom:14px;font-variant-numeric:tabular-nums}.b2c-preview-tag{text-align:center;font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(255,255,255,0.4);letter-spacing:1.2px;margin-bottom:14px;text-transform:uppercase}.b2c-transport{display:flex;align-items:center;justify-content:center;gap:32px;margin-bottom:18px}.b2c-transport-btn{color:#fff;transition:transform 0.15s ease}.b2c-transport-btn:active{transform:scale(0.85)}.b2c-transport-btn svg{width:32px;height:32px}.b2c-play{width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center}.b2c-play svg{width:26px;height:26px}.b2c-apple{width:100%;background:linear-gradient(135deg,var(--blue),var(--violet));border-radius:12px;padding:13px 14px;display:flex;align-items:center;gap:10px;box-shadow:0 6px 20px rgba(74,144,226,0.3);transition:transform 0.15s ease}.b2c-apple:active{transform:scale(0.98)}.b2c-apple-icon{width:34px;height:34px;background:rgba(255,255,255,0.18);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}.b2c-apple-icon svg{width:18px;height:18px}.b2c-apple-meta{flex:1;text-align:left}.b2c-apple-eyebrow{font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;letter-spacing:1px;color:rgba(255,255,255,0.85);margin-bottom:1px;text-transform:uppercase}.b2c-apple-title{font-size:13px;font-weight:700;letter-spacing:-0.1px}.b2c-apple-arrow svg{width:14px;height:14px}.b2c-queue{border-top:1px solid var(--line);padding:14px 18px}.b2c-queue-h{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--blue-2);letter-spacing:1.4px;margin-bottom:12px;font-weight:600;text-transform:uppercase;display:flex;align-items:center;gap:8px}.b2c-queue-h::before{content:'';width:14px;height:1px;background:var(--blue-2)}.queue-track{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:0.5px solid rgba(84,84,88,0.2)}.queue-track:last-child{border-bottom:none}.queue-track-main{display:flex;align-items:center;gap:10px;flex:1;min-width:0;cursor:pointer}.queue-art{width:34px;height:34px;border-radius:5px;overflow:hidden;flex-shrink:0}.queue-info{flex:1;min-width:0}.queue-title{font-size:13px;font-weight:600;letter-spacing:-0.1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.queue-artist{font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.queue-pct{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--blue-2);font-weight:600;flex-shrink:0}.queue-apple{width:28px;height:28px;background:linear-gradient(135deg,var(--blue),var(--violet));border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;transition:transform 0.15s ease;box-shadow:0 2px 5px rgba(74,144,226,0.25)}.queue-apple:active{transform:scale(0.92)}.queue-apple svg{width:12px;height:12px}.ticker{margin-top:20px;display:grid;grid-template-columns:repeat(2,1fr);gap:6px}.ticker-stat{padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid var(--line);border-radius:10px}.ticker-num{font-size:18px;font-weight:800;letter-spacing:-0.5px;font-variant-numeric:tabular-nums;line-height:1.1}.ticker-desc{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--muted);letter-spacing:0.8px;text-transform:uppercase;margin-top:3px}.radar-wrap{padding:14px}.radar-svg{width:100%;height:auto;display:block}.radar-legend{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:0 6px 8px;margin-top:6px}.radar-attr{display:flex;justify-content:space-between;align-items:center;font-family:'JetBrains Mono',monospace;font-size:10px;padding:5px 8px;background:rgba(255,255,255,0.03);border-radius:6px}.radar-attr-name{color:var(--muted);letter-spacing:0.5px}.radar-attr-val{color:var(--blue-2);font-weight:600}.toast{position:fixed;top:62px;left:50%;transform:translateX(-50%) translateY(-100px);background:linear-gradient(135deg,var(--blue),var(--violet));color:#fff;padding:10px 18px;border-radius:100px;font-size:12px;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(250,35,59,0.4);transition:transform 0.3s cubic-bezier(0.32,0.72,0,1);display:flex;align-items:center;gap:8px;white-space:nowrap;max-width:calc(100vw - 36px)}.toast.show{transform:translateX(-50%) translateY(0)}.toast svg{width:14px;height:14px;flex-shrink:0}footer{padding:32px 18px;border-top:1px solid var(--line);background:#000}.footer-meta{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:0.8px;text-align:center;line-height:1.7}@media(min-width:720px){.app{max-width:480px;margin:0 auto;box-shadow:0 0 100px rgba(74,144,226,0.1);border-left:1px solid var(--line);border-right:1px solid var(--line)}.ticker{grid-template-columns:repeat(4,1fr)}.market-grid{grid-template-columns:repeat(4,1fr)}}*::-webkit-scrollbar{display:none}`;
