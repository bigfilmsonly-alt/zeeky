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
// Token storage keys
// ---------------------------------------------------------------------------

const TOKEN_KEY = "zeeky_tidal_token";
const REFRESH_KEY = "zeeky_tidal_refresh";
const VERIFIER_KEY = "zeeky_tidal_verifier";
const DISCOVERED_PLAYLIST_KEY = "zeeky_tidal_discovered_playlist";

// ---------------------------------------------------------------------------
// Audio singleton for preview playback
// ---------------------------------------------------------------------------

let audio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio();
  }
  return audio;
}

// ---------------------------------------------------------------------------
// Env
// ---------------------------------------------------------------------------

const CLIENT_ID = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_TIDAL_CLIENT_ID ?? "")
  : "";

const REDIRECT_URI = typeof window !== "undefined"
  ? `${window.location.origin}/callback/tidal`
  : "";

const AUTH_URL = "https://login.tidal.com/authorize";
const TOKEN_URL = "https://auth.tidal.com/v1/oauth2/token";
const CATALOG_BASE = "https://openapi.tidal.com/v2";
const USER_BASE = "https://openapi.tidal.com/v1";

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

async function catalogFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(`${CATALOG_BASE}${path}`, { ...init, headers: { ...headers, ...(init?.headers as Record<string, string>) } });
}

async function userFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const token = getAccessToken();
  if (!token) throw new Error("Not authorized with Tidal");
  return fetch(`${USER_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers as Record<string, string>),
    },
  });
}

// ---------------------------------------------------------------------------
// Platform implementation
// ---------------------------------------------------------------------------

export const tidal: StreamingPlatform = {
  id: "tidal",
  name: "Tidal",
  color: "#000000",
  icon: "M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z",
  isAvailable: Boolean(CLIENT_ID),

  // -------------------------------------------------------------------------
  // Auth
  // -------------------------------------------------------------------------

  async authorize(): Promise<void> {
    const verifier = generateRandomString(64);
    const challenge = base64UrlEncode(await sha256(verifier));

    localStorage.setItem(VERIFIER_KEY, verifier);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: "playlists.write playlists.read",
      code_challenge_method: "S256",
      code_challenge: challenge,
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
    const encoded = encodeURIComponent(query);
    const res = await catalogFetch(
      `/searchresults/${encoded}?countryCode=US&type=TRACKS&limit=${limit}`
    );

    if (!res.ok) return [];

    const data = await res.json();

    // The v2 catalog response nests tracks under `data` or `tracks`
    const tracks: Array<{
      id: string;
      attributes?: {
        title?: string;
        artistName?: string;
        albumName?: string;
        imageUrl?: string;
        mediaTags?: { previewUrl?: string };
        duration?: number;
        externalLinks?: Array<{ href: string }>;
      };
      resource?: {
        id: string;
        title?: string;
        artists?: Array<{ name?: string }>;
        album?: { title?: string; imageCover?: Array<{ url?: string }> };
        tidalUrl?: string;
        duration?: number;
      };
    }> = data?.tracks ?? data?.data ?? [];

    return tracks.map((t) => {
      // Handle both possible response shapes
      const resource = t.resource ?? t.attributes;
      const id = t.resource?.id ?? t.id;
      const title =
        t.resource?.title ?? t.attributes?.title ?? "Unknown";
      const artist =
        t.resource?.artists?.[0]?.name ??
        t.attributes?.artistName ??
        "Unknown";
      const album =
        t.resource?.album?.title ?? t.attributes?.albumName;
      const artworkUrl =
        t.resource?.album?.imageCover?.[0]?.url ??
        t.attributes?.imageUrl;
      const externalUrl =
        t.resource?.tidalUrl ??
        t.attributes?.externalLinks?.[0]?.href ??
        `https://tidal.com/browse/track/${id}`;
      const durationMs =
        (t.resource?.duration ?? t.attributes?.duration ?? 0) * 1000 || undefined;

      return {
        platformId: "tidal" as const,
        trackId: String(id),
        title,
        artist,
        album,
        artworkUrl,
        durationMs,
        externalUrl,
      };
    });
  },

  // -------------------------------------------------------------------------
  // Playback (preview only for third-party apps)
  // -------------------------------------------------------------------------

  async play(trackId: string): Promise<void> {
    // Attempt to get a preview URL via search or direct endpoint
    const res = await catalogFetch(
      `/tracks/${trackId}?countryCode=US`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch track details from Tidal");
    }

    const data = await res.json();
    const previewUrl: string | undefined =
      data?.resource?.previewUrl ??
      data?.attributes?.mediaTags?.previewUrl ??
      data?.previewUrl;

    if (!previewUrl) {
      // Open in browser as fallback when no preview is available
      window.open(
        `https://tidal.com/browse/track/${trackId}`,
        "_blank"
      );
      return;
    }

    const player = getAudio();
    player.src = previewUrl;
    await player.play();
  },

  pause(): void {
    const player = getAudio();
    player.pause();
  },

  // -------------------------------------------------------------------------
  // Playlists
  // -------------------------------------------------------------------------

  async createPlaylist(
    name: string,
    description: string,
    trackIds: string[]
  ): Promise<string> {
    const res = await userFetch("/playlists", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });

    if (!res.ok) {
      throw new Error(`Failed to create Tidal playlist: ${res.status}`);
    }

    const data = await res.json();
    const playlistId: string = data?.data?.id ?? data?.id ?? data?.uuid;

    // Add tracks
    for (const trackId of trackIds) {
      await this.addToPlaylist(playlistId, trackId);
    }

    return playlistId;
  },

  async addToPlaylist(playlistId: string, trackId: string): Promise<void> {
    const res = await userFetch(`/playlists/${playlistId}/items`, {
      method: "POST",
      body: JSON.stringify({
        trackIds: [trackId],
      }),
    });

    if (!res.ok) {
      throw new Error(
        `Failed to add track to Tidal playlist: ${res.status}`
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
    const results = await this.search(`${title} ${artist}`, 1);
    return results[0] ?? null;
  },
};

// ---------------------------------------------------------------------------
// Token exchange - called from the callback page
// ---------------------------------------------------------------------------

export async function exchangeTidalCode(code: string): Promise<void> {
  const verifier = localStorage.getItem(VERIFIER_KEY);
  if (!verifier) throw new Error("Missing PKCE verifier for Tidal");

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
    throw new Error(`Tidal token exchange failed: ${res.status}`);
  }

  const data = await res.json();
  setTokens(data.access_token, data.refresh_token);
  localStorage.removeItem(VERIFIER_KEY);
}
