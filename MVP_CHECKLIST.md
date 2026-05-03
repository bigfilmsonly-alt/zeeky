# Zeeky MVP Checklist

## Current State (Completed)
- [x] iPhone frame shell with Dynamic Island, status bar, tab bar, home indicator
- [x] Splash screen with high-converting CTA
- [x] App home with quick actions for Listeners/Artists/Streamers
- [x] Discover page — search, genre filters, AI playlists, recommendations, Song DNA bars
- [x] Studio page — upload CTA, hit prediction score, similar artist radar, target market, top cities
- [x] Live page — audience stats, playlists/trending/schedule tabs, Go Live CTA
- [x] Profile page — avatar, role badges, stats, Pro upsell, settings menu
- [x] Bottom tab bar with filled/outline icon states on every app page
- [x] Mobile-first sizing (all content fits inside 430px frame)
- [x] Smooth native scroll (no snap, no sticky behavior)
- [x] Responsive overrides to force mobile layout inside frame on desktop

---

## Phase 1: Core Functionality (Make It Work)
- [ ] **Auth flow** — Sign up / Sign in screens (email + social login)
- [ ] **Supabase backend** — Users table, sessions, role selection (Listener/Artist/Streamer)
- [ ] **File upload** — Actual audio upload on Studio page (Supabase Storage or R2)
- [ ] **AI analysis API** — Connect to Hitlab API for real song DNA extraction
- [ ] **Real data** — Replace all hardcoded data with dynamic API calls
- [ ] **Now Playing bar** — Mini player at bottom when a track is selected
- [ ] **Search** — Real search with debounced API calls on Discover page

## Phase 2: Engagement (Make It Sticky)
- [ ] **Push notifications** — Web push for new recommendations, analysis complete
- [ ] **Onboarding flow** — 3-screen walkthrough after signup (pick role, connect Spotify, first analysis)
- [ ] **Favorites/saves** — Heart button on tracks, saved playlists
- [ ] **Share cards** — Shareable hit prediction cards for social media
- [ ] **Activity feed** — Real-time feed of AI analysis events
- [ ] **Loading states** — Skeleton screens on all data-heavy pages
- [ ] **Pull to refresh** — Native-feel refresh gesture on feed pages
- [ ] **Haptic feedback** — Vibration on tab switches and button taps (navigator.vibrate)

## Phase 3: Monetization (Make It Pay)
- [ ] **Subscription tiers** — Free (3 analyses/mo) / Pro ($9.99, unlimited) / Label ($49.99, team)
- [ ] **Stripe integration** — Payment flow for Pro upgrade
- [ ] **Gated features** — Lock advanced DNA analysis, target market, city data behind Pro
- [ ] **Usage tracking** — Track free tier limits, show upgrade prompts

## Phase 4: Growth (Make It Spread)
- [ ] **PWA manifest** — Add to Home Screen support with app icon
- [ ] **Offline support** — Service worker for cached pages
- [ ] **Invite system** — Refer a friend, both get 1 free analysis
- [ ] **Artist profiles** — Public profile pages shareable as links
- [ ] **Playlist embedding** — Embed AI playlists on external sites
- [ ] **SEO landing pages** — /for/artists, /for/listeners, /for/streamers

## Phase 5: Polish (Make It 10/10)
- [ ] **Page transitions** — Smooth slide animations between tab views
- [ ] **Gesture navigation** — Swipe left/right between tabs
- [ ] **Dark/light mode** — Theme toggle in profile settings
- [ ] **Accessibility** — ARIA labels, keyboard nav, screen reader support
- [ ] **Performance** — Lazy load below-fold content, optimize images
- [ ] **Analytics** — Mixpanel/PostHog for user behavior tracking
- [ ] **Error boundaries** — Graceful error states with retry buttons
- [ ] **Empty states** — Illustrated empty states for no results, no playlists, etc.
