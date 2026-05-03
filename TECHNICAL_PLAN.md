# Zeeky Technical Plan: Making It Real

## Architecture Overview

```
User uploads audio
    |
    v
[Browser: Essentia.js WebAssembly] -- instant ~40 features
    |
    v
[Supabase Storage] -- store audio file
    |
    v
[Railway.app: FastAPI + Librosa] -- deep 84-feature extraction + hit prediction
    |
    v
[Supabase pgvector] -- cosine similarity vs 50K+ Billboard songs
    |
    v
[Supabase Realtime] -- push results to client live
```

## Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | Next.js 16 + Tailwind (done) | $0-20/mo (Vercel) |
| Client Audio | Essentia.js (WASM) | $0 (open source) |
| Auth + DB | Supabase | $0 (free tier) |
| Vector Search | pgvector on Supabase | $0 (included) |
| Deep Analysis | FastAPI + Librosa on Railway | ~$5/mo |
| Song ID | AudD API | ~$2/mo (1K lookups) |
| **Total MVP** | | **$7-27/mo** |

## Music Analysis APIs

### Essentia.js (Primary - FREE, client-side)
- 199 audio analysis algorithms via WebAssembly
- Extracts: BPM, key, energy, danceability, MFCC, chroma, spectral features, pitch, melody, beats
- Runs in browser = instant results, zero API cost
- npm: `essentia.js`

### Cyanite.ai (Premium tier - 290 EUR/mo)
- GraphQL API, 100+ features including mood (13 labels), genre (15 categories)
- 15-second segment analysis (unique)
- Use for paid Pro tier when accuracy matters

### AudD (Song identification - $2/1K requests)
- Neural-network audio fingerprinting, 80M+ track database
- "What song is this?" feature
- Used by Universal, Warner, Sony

### IMPORTANT: Spotify Audio Features API is DEPRECATED (Nov 2024)
- No longer available for new apps. This is why self-hosted analysis is essential.

## Hit Prediction Model

No turnkey API exists. Build our own:

1. **Data**: Billboard Hot 100 datasets on Kaggle (12K+ charting tracks, 1958-2023)
2. **Features**: Extract 84 DNA attributes from each track via Librosa
3. **Model**: Random forest or gradient boosted trees (scikit-learn) — research achieves 78-82% accuracy
4. **Serve**: FastAPI endpoint or convert to TensorFlow.js for in-browser inference
5. **Score**: 0-100 "Hit Potential" score (the 89% shown in Studio)

## Database Schema (Supabase)

```sql
-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- User profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  role TEXT DEFAULT 'listener', -- listener, artist, streamer
  plan TEXT DEFAULT 'free'      -- free, pro, label
);

-- Uploaded songs
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  artist TEXT,
  audio_url TEXT,
  status TEXT DEFAULT 'uploading', -- uploading, analyzing, complete
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Song DNA (84 attributes + vector)
CREATE TABLE song_dna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID REFERENCES songs(id),
  tempo FLOAT, key TEXT, energy FLOAT, danceability FLOAT,
  -- ... 80 more attributes ...
  dna_vector vector(84),          -- for pgvector similarity
  hit_score INT,                   -- 0-100 prediction
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pre-populated Billboard reference database
CREATE TABLE billboard_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT, artist TEXT, year INT, peak_position INT,
  dna_vector vector(84)
);

-- Similarity search: find 10 closest Billboard hits
SELECT b.title, b.artist, b.peak_position,
       1 - (b.dna_vector <=> target.dna_vector) AS similarity
FROM billboard_songs b,
     (SELECT dna_vector FROM song_dna WHERE song_id = $1) target
ORDER BY b.dna_vector <=> target.dna_vector
LIMIT 10;
```

## Implementation Phases

### Phase 1: Wire Up Real Analysis (2-3 weeks)
1. `npm install essentia.js @supabase/supabase-js`
2. Build `useAudioAnalysis` hook — Essentia.js extracts features via Web Audio API
3. Wire Studio upload to Supabase Storage + instant Essentia analysis
4. Deploy FastAPI + Librosa on Railway for deep 84-attribute extraction
5. Populate billboard_songs table from Kaggle dataset

### Phase 2: Similarity + Prediction (1-2 weeks)
6. Store DNA vectors in pgvector, wire Discover page to real similarity queries
7. Train hit prediction model on Billboard data, deploy via FastAPI
8. Add AudD song identification on Live page

### Phase 3: Auth + Payments (1-2 weeks)
9. Supabase Auth (email + Google/Apple social login)
10. Stripe for Pro tier ($9.99/mo — unlimited analysis + target market data)
11. Gate target market/city data behind Pro

### Phase 4: Viral Loop (1 week)
12. "Share My Score" — generates branded card (score + DNA + similar artists)
13. Deep links back to app from shared cards
14. PWA manifest for Add to Home Screen

## Highest-Converting CTAs (Research-Backed)

| # | CTA | Placement | Why It Converts |
|---|-----|-----------|----------------|
| 1 | **"Score My Song"** | Splash + Home hero | Curiosity gap + ego/validation. SongScore proved this model converts. |
| 2 | **"See Your Sound DNA"** | After score reveal | Identity content (like Spotify Wrapped). 84-attribute fingerprint is unique. |
| 3 | **"Share My Score"** | After analysis | Spotify Wrapped drove 500M shares. Score cards = viral loop. |
| 4 | **"Songs That Actually Sound Like This"** | Discover page | Attacks collaborative filtering frustration. "Actually" = differentiator. |
| 5 | **"Unlock Fan Intelligence"** | Pro upgrade | Target market data = money. Gate demographics/cities behind Pro. |

## Key Insight from Research

> Personalized CTAs convert 202% better than generic ones (HubSpot).
> The #1 predictor of conversion is whether a user reaches the "aha moment" in their first session.

Zeeky's aha moment = **seeing your song's hit score for the first time**.
Everything in the app should funnel toward getting a user to that moment as fast as possible.
