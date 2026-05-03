# Zeeky Entertainment Inc. — Full Project Context

## The Company

**Zeeky Entertainment Inc.** is a music and technology company focused on hit creation and next-gen music discovery.

- Operates a **private label** distributing releases via TuneCore under Zeeky Entertainment
- Holds **exclusive 75-year global rights** to HitLab's patented technology for music recommendation, playlisting, and song proximity
- Rights include ability to **use, license, sell, and market** the engine globally
- **US Patent 7,877,634** (HitLab — DHS, Issued 2011-01-18)
- License document: [Google Drive](https://drive.google.com/file/d/1sELAfxevlAjJRcNRE0NwsiaqQJfKCvRr/view?usp=drive_link)
- **HitLab Inc.** — [hitlab.com](https://hitlab.com) — develops analytics technology across music, imagery, health, and natural resources

## The Founder

**Xavier Gauthier** (aka Zeeky / @zeeky)
- Contact: xavzeeky@gmail.com | +1 (514) 546-5913

## The Technology — Digital Nuance Analysis (DNA)

> A patented system that measures **what a song is** — not just what it's tagged as.

### How it works:
1. **Extract** — Signal processing isolates 84 audio attributes from any digital audio file
2. **Transform** — Attributes become quantifiable mathematical equations (song signature/fingerprint)
3. **Compare** — Data mining finds songs with similar signatures via proximity in Hilbert space

### 84 Audio Attributes include:
- **MFCC** — Mean & std dev of first 20 coefficients (spectral surface abstraction)
- **Chroma** — 12 pitch classes (C, C#, D, ... B), values 0-1
- **Others** — Tempo, chord progression, range, pitch, musical notes, bass presence, bass variation, instrument variation, melody variation, percussion variation, spectral variation, spectrum variation, rolloff, key & mode

### Feature Pipeline:
- Generates **66,000 features** describing the sound
- Selects **20 features** for clustering known music
- Outperforms all existing feature sets on several music data sets

### Software Core:
```
(weightA x attributeX) + (weightB x attributeY) = recommendation
(100 x genre) + (50 x tempo) = recommendation
```
- No human input required for attribute extraction
- Calibrates weights automatically via user behavior, feedback, social data
- Proximity measured as angle separating two songs on a unit sphere in Hilbert space

## The Problem

Current recommendation engines depend on metadata, tags, and user behavior:
- Tagging is subjective, inconsistent, and expensive at scale
- New uploads have exploded, pushing classification past its limits
- More mismatches → more skipping → lower trust → platform switching
- Artists struggle to reach the right audience

| Platform | Approach |
|----------|----------|
| Pandora | Musicologists and surveys |
| Spotify | The Echo Nest (moods, tags) |
| Apple Music | Editors and algorithms |
| Amazon | Purchase and browsing behavior |

## The Solution

Zeeky restores discovery by matching music on the audio itself:
- **Independent recommendation layer** that can complement any DSP
- Deconstructs the track into measurable audio attributes
- Computes similarity through deterministic mathematical method
- Reduces dependency on inconsistent metadata

## Existing Assets

### Music Library (from extracted archive)
- **13,468 music files** (m4a, mp3, wav)
- **3,695 artists** in the collection
- **Zeeky's own tracks:**
  - Fashion Week, Ricks and Shit, Hometown, Sex as a Weapon (feat. Blvck Jvgg), Zeeky Bizness
  - Wine, Money Aint A Thang (as Xav Zeeky)
  - No Pressure (feat. Flawless)

### Existing Projects
- **dna.hitlab.com** — React app, DNA analysis interface (with AWS Amplify deployment)
- **aiplaylists.com** — React app, AI playlist platform
- **can-u-sing.com** — React app
- **apple-player** — Apple Music-style player

### API Documentation
- **DNA API** — Overview PDF at `/Downloads/zeeky-extracted/zeeky/Docs/DNA API - Overview.pdf`
- **CUS API** — Overview PDF at `/Downloads/zeeky-extracted/zeeky/Docs/CUS API - Overview.pdf`
- **Postman collections** — DNA, CUS, CHARTS, DASHBOARD endpoints

### Databases
- **Billboard Hot 100** dataset (September 2023 snapshot, zipped)
- **Dashboard data** (October 2023 snapshot)
- **DNA Service staging** database dump

### Infrastructure
- AWS keypairs for: hitlab, dna, dna-rnd, cus servers
- KeePass vault files for server credentials

### Previous Website
- Full Next.js project at `/Downloads/zeeky-music-website/zeeky/`
- Apple Music-inspired streaming UI + corporate/investor presentation
- Features: library, hero album, music player, mobile navigation
- Featured release: "Fire Your Manager" album

## Market Data
- Global AI in marketing market: **$145.42B by 2032** (up from $14.7B in 2022)
- SahBabii's "Pull Up Wit Ah Stick" music video: **77M+ views** (produced by Zeeky label)
- SahBabii streams on TuneCore: **10M+** (subsequently signed with Warner Music Group)
- TuneCore history: **10+ years**

## Current App (This Repo)
- Mobile-first web app in iPhone 17 Pro Max frame
- 5 tabs: Home, Discover, Studio, Live, Profile
- Core features: Hit prediction scores, song DNA analysis, similar artist radar, target market demographics, AI playlists, trend forecasting
- Built with: Next.js 16, Tailwind CSS, TypeScript
