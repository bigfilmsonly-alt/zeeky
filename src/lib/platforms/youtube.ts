import type { StreamingPlatform, PlatformTrack } from "./types";

// ---------------------------------------------------------------------------
// Helpers: PKCE
// ---------------------------------------------------------------------------

function generateRandomString(length: number): string {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (v) => possible[v % possible.length]).join("");
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  return crypto.subtle.digest("SHA-256", encoder.encode(plain));
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// ---------------------------------------------------------------------------
// Token / state storage keys
// ---------------------------------------------------------------------------

const TOKEN_KEY = "zeeky_youtube_token";
const REFRESH_KEY = "zeeky_youtube_refresh";
const VERIFIER_KEY = "zeeky_youtube_verifier";
const DISCOVERED_PLAYLIST_KEY = "zeeky_youtube_discovered_playlist";

// ---------------------------------------------------------------------------
// Env
// ---------------------------------------------------------------------------

const API_KEY = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_YOUTUBE_API_KEY ?? "")
  : "";

const CLIENT_ID = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "")
  : "";

const REDIRECT_URI = typeof window !== "undefined"
  ? `${window.location.origin}/callback/google`
  : "";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const YT_API = "https://www.googleapis.com/youtube/v3";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setTokens(access: string, refresh?: string) {
  localStorage.setItem(TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

/**
 * Make an authenticated request to YouTube Data API.
 * Uses OAuth token when available; falls back to API key for read-only ops.
 */
async function ytFetch(
  path: string,
  init?: RequestInit,
  requireAuth = false
): Promise<Response> {
  const token = getAccessToken();
  const url = new URL(`${YT_API}${path}`);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (!requireAuth) {
    // Append API key for unauthenticated catalog requests
    url.searchParams.set("key", API_KEY);
  } else {
    throw new Error("Not authorized with YouTube");
  }

  return fetch(url.toString(), {
    ...init,
    headers: { ...headers, ...(init?.headers as Record<string, string>) },
  });
}

// ---------------------------------------------------------------------------
// YouTube IFrame Player helpers
// ---------------------------------------------------------------------------

let playerReady = false;
let ytPlayer: YT.Player | null = null;

interface YT {
  Player: new (
    elementId: string,
    config: {
      height: string;
      width: string;
      videoId: string;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: () => void;
        onError?: (e: { data: number }) => void;
      };
    }
  ) => YT.Player;
}

declare namespace YT {
  interface Player {
    playVideo(): void;
    pauseVideo(): void;
    loadVideoById(videoId: string): void;
    destroy(): void;
  }
}

declare global {
  interface Window {
    YT?: YT;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function ensurePlayerContainer(): HTMLDivElement {
  let container = document.getElementById(
    "zeeky-yt-player"
  ) as HTMLDivElement | null;
  if (!container) {
    container = document.createElement("div");
    container.id = "zeeky-yt-player";
    container.style.position = "fixed";
    container.style.width = "1px";
    container.style.height = "1px";
    container.style.overflow = "hidden";
    container.style.opacity = "0";
    container.style.pointerEvents = "none";
    document.body.appendChild(container);
  }
  return container;
}

function loadIframeAPI(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (window.YT) {
      resolve();
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    window.onYouTubeIframeAPIReady = () => {
      resolve();
    };
    document.head.appendChild(tag);
  });
}

async function getOrCreatePlayer(videoId: string): Promise<YT.Player> {
  await loadIframeAPI();
  ensurePlayerContainer();

  if (ytPlayer) {
    ytPlayer.loadVideoById(videoId);
    return ytPlayer;
  }

  return new Promise<YT.Player>((resolve) => {
    const player = new window.YT!.Player("zeeky-yt-player", {
      height: "1",
      width: "1",
      videoId,
      playerVars: { autoplay: 1, controls: 0 },
      events: {
        onReady: () => {
          playerReady = true;
          ytPlayer = player;
          resolve(player);
        },
      },
    });
  });
}

// ---------------------------------------------------------------------------
// Platform implementation
// ---------------------------------------------------------------------------

export const youtube: StreamingPlatform = {
  id: "youtube",
  name: "YouTube Music",
  color: "#FF0000",
  icon: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.016 3.016 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.016 3.016 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  isAvailable: Boolean(API_KEY) || Boolean(CLIENT_ID),

  // -------------------------------------------------------------------------
  // Auth
  // -------------------------------------------------------------------------

  async authorize(): Promise<void> {
    if (!CLIENT_ID) {
      throw new Error("Google OAuth client ID is not configured");
    }

    const verifier = generateRandomString(64);
    const challenge = base64UrlEncode(await sha256(verifier));

    localStorage.setItem(VERIFIER_KEY, verifier);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: "https://www.googleapis.com/auth/youtube",
      code_challenge_method: "S256",
      code_challenge: challenge,
      access_type: "offline",
      prompt: "consent",
    });

    window.location.href = `${AUTH_URL}?${params.toString()}`;
  },

  isAuthorized(): boolean {
    return Boolean(getAccessToken());
  },

  // -------------------------------------------------------------------------
  // Search
  // -------------------------------------------------------------------------

  async search(query: string, limit = 10): Promise<PlatformTrack[]> {
    const params = new URLSearchParams({
      part: "snippet",
      type: "video",
      videoCategoryId: "10", // Music category
      maxResults: String(limit),
      q: query,
    });

    const res = await ytFetch(`/search?${params.toString()}`);

    if (!res.ok) return [];

    const data = await res.json();

    const items: Array<{
      id: { videoId: string };
      snippet: {
        title: string;
        channelTitle: string;
        thumbnails?: {
          high?: { url: string };
          medium?: { url: string };
          default?: { url: string };
        };
      };
    }> = data?.items ?? [];

    return items.map((item) => ({
      platformId: "youtube" as const,
      trackId: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      artworkUrl:
        item.snippet.thumbnails?.high?.url ??
        item.snippet.thumbnails?.medium?.url ??
        item.snippet.thumbnails?.default?.url,
      externalUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
  },

  // -------------------------------------------------------------------------
  // Playback via IFrame Player API
  // -------------------------------------------------------------------------

  async play(trackId: string): Promise<void> {
    const player = await getOrCreatePlayer(trackId);
    player.playVideo();
  },

  pause(): void {
    ytPlayer?.pauseVideo();
  },

  // -------------------------------------------------------------------------
  // Playlists (requires OAuth)
  // -------------------------------------------------------------------------

  async createPlaylist(
    name: string,
    description: string,
    trackIds: string[]
  ): Promise<string> {
    const res = await ytFetch(
      "/playlists?part=snippet,status",
      {
        method: "POST",
        body: JSON.stringify({
          snippet: { title: name, description },
          status: { privacyStatus: "private" },
        }),
      },
      true
    );

    if (!res.ok) {
      throw new Error(`Failed to create YouTube playlist: ${res.status}`);
    }

    const data = await res.json();
    const playlistId: string = data.id;

    for (const trackId of trackIds) {
      await this.addToPlaylist(playlistId, trackId);
    }

    return playlistId;
  },

  async addToPlaylist(playlistId: string, trackId: string): Promise<void> {
    const res = await ytFetch(
      "/playlistItems?part=snippet",
      {
        method: "POST",
        body: JSON.stringify({
          snippet: {
            playlistId,
            resourceId: {
              kind: "youtube#video",
              videoId: trackId,
            },
          },
        }),
      },
      true
    );

    if (!res.ok) {
      throw new Error(
        `Failed to add video to YouTube playlist: ${res.status}`
      );
    }
  },

  async getOrCreateDiscoveredPlaylist(): Promise<string> {
    const cached = localStorage.getItem(DISCOVERED_PLAYLIST_KEY);
    if (cached) return cached;

    const id = await this.createPlaylist(
      "Discovered by Zeeky",
      "Tracks recommended by Zeeky's audio-DNA engine",
      []
    );
    localStorage.setItem(DISCOVERED_PLAYLIST_KEY, id);
    return id;
  },

  // -------------------------------------------------------------------------
  // Track matching
  // -------------------------------------------------------------------------

  async findTrack(
    title: string,
    artist: string
  ): Promise<PlatformTrack | null> {
    const results = await this.search(
      `${title} ${artist} official audio`,
      1
    );
    return results[0] ?? null;
  },
};

// ---------------------------------------------------------------------------
// Token exchange - called from the callback page
// ---------------------------------------------------------------------------

export async function exchangeGoogleCode(code: string): Promise<void> {
  const verifier = localStorage.getItem(VERIFIER_KEY);
  if (!verifier) throw new Error("Missing PKCE verifier for Google");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: verifier,
    }),
  });

  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${res.status}`);
  }

  const data = await res.json();
  setTokens(data.access_token, data.refresh_token);
  localStorage.removeItem(VERIFIER_KEY);
}
