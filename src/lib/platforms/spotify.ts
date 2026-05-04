// Spotify Web API + Web Playback SDK integration for Zeeky
// Docs: https://developer.spotify.com/documentation/web-api
//       https://developer.spotify.com/documentation/web-playback-sdk

import type { StreamingPlatform, PlatformTrack } from "./types";

// ─── TYPES ───────────────────────────────────────────────────────────

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: (() => void) | undefined;
  }
}

interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number; // epoch ms
}

// ─── CONSTANTS ───────────────────────────────────────────────────────

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "";
const SCOPES = [
  "streaming",
  "user-read-email",
  "user-modify-playback-state",
  "playlist-modify-public",
  "playlist-modify-private",
  "playlist-read-private",
].join(" ");
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const API_BASE = "https://api.spotify.com/v1";
const STORAGE_KEY_TOKENS = "zeeky_spotify_tokens";
const STORAGE_KEY_VERIFIER = "zeeky_spotify_code_verifier";
const DISCOVERED_PLAYLIST_NAME = "Discovered by Zeeky";
const DISCOVERED_PLAYLIST_DESC =
  "Songs discovered through Zeeky AI — powered by DNA audio fingerprinting";

// ─── PKCE HELPERS ────────────────────────────────────────────────────

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
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const digest = await sha256(verifier);
  return base64UrlEncode(digest);
}

// ─── TOKEN MANAGEMENT ────────────────────────────────────────────────

function getStoredTokens(): SpotifyTokens | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TOKENS);
    if (!raw) return null;
    return JSON.parse(raw) as SpotifyTokens;
  } catch {
    return null;
  }
}

function storeTokens(tokens: SpotifyTokens): void {
  localStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(tokens));
}

function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEY_TOKENS);
  localStorage.removeItem(STORAGE_KEY_VERIFIER);
}

function isTokenExpired(tokens: SpotifyTokens): boolean {
  // Treat as expired 5 minutes before actual expiry to avoid edge cases
  return Date.now() > tokens.expires_at - 5 * 60 * 1000;
}

async function refreshAccessToken(): Promise<SpotifyTokens | null> {
  const tokens = getStoredTokens();
  if (!tokens?.refresh_token) return null;

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: tokens.refresh_token,
        client_id: CLIENT_ID,
      }),
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const data = await response.json();
    const refreshed: SpotifyTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token ?? tokens.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
    };

    storeTokens(refreshed);
    return refreshed;
  } catch {
    clearTokens();
    return null;
  }
}

/** Returns a valid access token, refreshing if needed. Throws if unavailable. */
async function getAccessToken(): Promise<string> {
  let tokens = getStoredTokens();
  if (!tokens) throw new Error("Not authorized with Spotify");

  if (isTokenExpired(tokens)) {
    tokens = await refreshAccessToken();
    if (!tokens) throw new Error("Spotify token refresh failed");
  }

  return tokens.access_token;
}

/** Convenience wrapper for authenticated Spotify API calls. */
async function spotifyFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAccessToken();
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  // If we get a 401, try one token refresh
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) throw new Error("Spotify session expired");

    return fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${refreshed.access_token}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  }

  return response;
}

// ─── TOKEN EXCHANGE (used by callback page) ──────────────────────────

export async function exchangeCodeForTokens(code: string): Promise<void> {
  const verifier = localStorage.getItem(STORAGE_KEY_VERIFIER);
  if (!verifier) throw new Error("Missing PKCE code_verifier");

  const redirectUri = `${window.location.origin}/callback/spotify`;

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: CLIENT_ID,
      code_verifier: verifier,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  const tokens: SpotifyTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  storeTokens(tokens);
  localStorage.removeItem(STORAGE_KEY_VERIFIER);
}

// ─── WEB PLAYBACK SDK ────────────────────────────────────────────────

let player: any = null;
let deviceId: string | null = null;
let sdkLoadPromise: Promise<void> | null = null;

function loadPlaybackSDK(): Promise<void> {
  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise<void>((resolve, reject) => {
    // Already loaded
    if (window.Spotify) {
      resolve();
      return;
    }

    window.onSpotifyWebPlaybackSDKReady = () => resolve();

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    script.onerror = () => {
      sdkLoadPromise = null;
      reject(new Error("Failed to load Spotify Web Playback SDK"));
    };
    document.head.appendChild(script);
  });

  return sdkLoadPromise;
}

async function initPlayer(): Promise<void> {
  if (player) return;

  await loadPlaybackSDK();
  const token = await getAccessToken();

  player = new window.Spotify.Player({
    name: "Zeeky",
    getOAuthToken: async (cb: (token: string) => void) => {
      try {
        const t = await getAccessToken();
        cb(t);
      } catch {
        cb("");
      }
    },
    volume: 0.5,
  });

  // Error handling
  player.addListener("initialization_error", ({ message }: any) => {
    console.error("[Spotify SDK] Init error:", message);
  });
  player.addListener("authentication_error", ({ message }: any) => {
    console.error("[Spotify SDK] Auth error:", message);
  });
  player.addListener("account_error", ({ message }: any) => {
    // Premium required
    console.warn("[Spotify SDK] Account error (Premium required):", message);
    player = null;
    deviceId = null;
  });

  player.addListener("ready", ({ device_id }: any) => {
    deviceId = device_id;
  });

  player.addListener("not_ready", ({ device_id }: any) => {
    if (deviceId === device_id) deviceId = null;
  });

  const connected = await player.connect();
  if (!connected) {
    player = null;
    throw new Error("Failed to connect Spotify player");
  }

  // Wait briefly for device_id to arrive
  if (!deviceId) {
    await new Promise<void>((resolve) => {
      const handler = ({ device_id }: any) => {
        deviceId = device_id;
        player.removeListener("ready", handler);
        resolve();
      };
      player.addListener("ready", handler);
      // Timeout after 5 seconds
      setTimeout(() => resolve(), 5000);
    });
  }
}

// ─── RESPONSE MAPPERS ────────────────────────────────────────────────

function mapTrack(item: any): PlatformTrack {
  return {
    platformId: "spotify",
    trackId: item.id,
    title: item.name,
    artist: (item.artists || []).map((a: any) => a.name).join(", "),
    album: item.album?.name,
    artworkUrl:
      item.album?.images?.[0]?.url || item.album?.images?.[1]?.url || undefined,
    previewUrl: item.preview_url || undefined,
    durationMs: item.duration_ms,
    externalUrl: item.external_urls?.spotify || `https://open.spotify.com/track/${item.id}`,
  };
}

// ─── STREAMING PLATFORM IMPLEMENTATION ───────────────────────────────

export const spotify: StreamingPlatform = {
  id: "spotify",
  name: "Spotify",
  color: "#1DB954",
  icon: "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z",
  isAvailable: !!CLIENT_ID,

  // ── Auth ───────────────────────────────────────────────────────────

  async authorize(): Promise<void> {
    const verifier = generateRandomString(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem(STORAGE_KEY_VERIFIER, verifier);

    const redirectUri = `${window.location.origin}/callback/spotify`;
    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      scope: SCOPES,
      redirect_uri: redirectUri,
      code_challenge_method: "S256",
      code_challenge: challenge,
    });

    window.location.href = `${AUTH_ENDPOINT}?${params.toString()}`;
  },

  isAuthorized(): boolean {
    const tokens = getStoredTokens();
    if (!tokens) return false;
    // Even if expired, we have a refresh_token so we can refresh.
    // Only return false if there are no tokens at all.
    return !!tokens.access_token;
  },

  // ── Search ─────────────────────────────────────────────────────────

  async search(query: string, limit = 20): Promise<PlatformTrack[]> {
    const params = new URLSearchParams({
      q: query,
      type: "track",
      limit: String(limit),
    });

    const response = await spotifyFetch(`/search?${params.toString()}`);
    if (!response.ok) {
      console.error("[Spotify] Search failed:", response.status);
      return [];
    }

    const data = await response.json();
    const items = data.tracks?.items || [];
    return items.map(mapTrack);
  },

  // ── Playback ───────────────────────────────────────────────────────

  async play(trackId: string): Promise<void> {
    // Try the Web Playback SDK first (requires Premium)
    try {
      await initPlayer();

      if (deviceId) {
        const response = await spotifyFetch(
          `/me/player/play?device_id=${deviceId}`,
          {
            method: "PUT",
            body: JSON.stringify({
              uris: [`spotify:track:${trackId}`],
            }),
          }
        );

        if (response.ok || response.status === 204) return;
      }
    } catch (err) {
      console.warn("[Spotify] SDK playback unavailable, trying preview:", err);
    }

    // Fallback: open in Spotify
    window.open(`https://open.spotify.com/track/${trackId}`, "_blank");
  },

  pause(): void {
    if (player) {
      player.pause();
    }
  },

  // ── Playlists ──────────────────────────────────────────────────────

  async createPlaylist(
    name: string,
    description: string,
    trackIds: string[]
  ): Promise<string> {
    // Get current user ID
    const meResponse = await spotifyFetch("/me");
    if (!meResponse.ok) throw new Error("Failed to get Spotify user profile");
    const me = await meResponse.json();

    // Create the playlist
    const createResponse = await spotifyFetch(`/users/${me.id}/playlists`, {
      method: "POST",
      body: JSON.stringify({
        name,
        description,
        public: false,
      }),
    });

    if (!createResponse.ok)
      throw new Error("Failed to create Spotify playlist");

    const playlist = await createResponse.json();

    // Add tracks if provided
    if (trackIds.length > 0) {
      const uris = trackIds.map((id) => `spotify:track:${id}`);

      // Spotify allows max 100 tracks per request
      for (let i = 0; i < uris.length; i += 100) {
        const chunk = uris.slice(i, i + 100);
        await spotifyFetch(`/playlists/${playlist.id}/tracks`, {
          method: "POST",
          body: JSON.stringify({ uris: chunk }),
        });
      }
    }

    return playlist.id;
  },

  async addToPlaylist(playlistId: string, trackId: string): Promise<void> {
    const response = await spotifyFetch(`/playlists/${playlistId}/tracks`, {
      method: "POST",
      body: JSON.stringify({
        uris: [`spotify:track:${trackId}`],
      }),
    });

    if (!response.ok) throw new Error("Failed to add track to Spotify playlist");
  },

  async getOrCreateDiscoveredPlaylist(): Promise<string> {
    // Page through user playlists to find "Discovered by Zeeky"
    let url: string | null = "/me/playlists?limit=50";

    while (url) {
      const response = await spotifyFetch(url);
      if (!response.ok) break;

      const data = await response.json();
      const match = data.items?.find(
        (p: any) => p.name === DISCOVERED_PLAYLIST_NAME
      );

      if (match) return match.id;

      url = data.next
        ? data.next.replace(API_BASE, "")
        : null;
    }

    // Not found — create it
    return this.createPlaylist(
      DISCOVERED_PLAYLIST_NAME,
      DISCOVERED_PLAYLIST_DESC,
      []
    );
  },

  // ── Track matching ─────────────────────────────────────────────────

  async findTrack(
    title: string,
    artist: string
  ): Promise<PlatformTrack | null> {
    const query = `track:${title} artist:${artist}`;
    const results = await this.search(query, 1);
    return results[0] ?? null;
  },
};
