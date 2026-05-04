// Deezer JS SDK integration for Zeeky
// SDK docs: https://developers.deezer.com/sdk/javascript

import type { StreamingPlatform, PlatformTrack } from "./types";

// ---------------------------------------------------------------------------
// Global type declarations for the Deezer JS SDK
// ---------------------------------------------------------------------------
interface DZLoginResponse {
  authResponse: {
    accessToken: string;
    expire: string;
  };
  status: string;
}

interface DZGetLoginStatusResponse {
  authResponse: {
    accessToken: string;
    expire: string;
  } | null;
  status: "connected" | "notConnected" | "unknown";
}

declare global {
  interface Window {
    DZ: {
      init(opts: { appId: string; channelUrl: string }): void;
      login(
        callback: (response: DZLoginResponse) => void,
        opts: { perms: string }
      ): void;
      getLoginStatus(
        callback: (response: DZGetLoginStatusResponse) => void
      ): void;
      player: {
        playTracks(
          trackIds: number[],
          index?: number,
          callback?: (response: unknown) => void
        ): void;
        pause(): void;
      };
      api(
        path: string,
        method: "GET" | "POST" | "DELETE",
        data: Record<string, string>,
        callback: (response: unknown) => void
      ): void;
      api(
        path: string,
        callback: (response: unknown) => void
      ): void;
    };
    dzAsyncInit?: () => void;
  }
}

// ---------------------------------------------------------------------------
// Deezer SVG icon path (simplified Deezer equalizer logo)
// ---------------------------------------------------------------------------
const DEEZER_ICON_SVG_PATH =
  "M22.5 4.5h-3v3h3v-3zm0 4.5h-3v3h3V9zm0 4.5h-3v3h3v-3zm0 4.5h-3v3h3v-3zm-4.5-9h-3v3h3V9zm0 4.5h-3v3h3v-3zm0 4.5h-3v3h3v-3zM13.5 9h-3v3h3V9zm0 4.5h-3v3h3v-3zm0 4.5h-3v3h3v-3zM9 13.5H6v3h3v-3zM9 18H6v3h3v-3zm-4.5 0h-3v3h3v-3z";

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------
let sdkLoaded = false;
let sdkLoading: Promise<void> | null = null;
let accessToken: string | null = null;
let authorized = false;

// ---------------------------------------------------------------------------
// SDK bootstrap helpers
// ---------------------------------------------------------------------------
function loadDeezerSdk(): Promise<void> {
  if (sdkLoaded && typeof window !== "undefined" && window.DZ) {
    return Promise.resolve();
  }
  if (sdkLoading) return sdkLoading;

  sdkLoading = new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Deezer SDK requires a browser environment"));
      return;
    }

    // If already present on the page, skip loading
    if (window.DZ) {
      sdkLoaded = true;
      resolve();
      return;
    }

    // The Deezer SDK calls window.dzAsyncInit once ready
    window.dzAsyncInit = () => {
      sdkLoaded = true;
      resolve();
    };

    const script = document.createElement("script");
    script.src = "https://e-cdns-files.dzcdn.net/js/min/dz.js";
    script.async = true;
    script.onerror = () => {
      sdkLoading = null;
      reject(new Error("Failed to load Deezer JS SDK"));
    };
    document.head.appendChild(script);
  });

  return sdkLoading;
}

function ensureSdk(): void {
  if (!sdkLoaded || typeof window === "undefined" || !window.DZ) {
    throw new Error(
      "Deezer SDK is not loaded. Call loadDeezerSdk() first or await deezerPlatform.authorize()."
    );
  }
}

async function initSdk(): Promise<void> {
  await loadDeezerSdk();

  const appId = process.env.NEXT_PUBLIC_DEEZER_APP_ID;
  if (!appId) {
    throw new Error(
      "Missing NEXT_PUBLIC_DEEZER_APP_ID environment variable"
    );
  }

  window.DZ.init({
    appId,
    channelUrl: `${window.location.origin}/deezer-channel.html`,
  });
}

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------
function loginWithPermissions(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    ensureSdk();
    window.DZ.login(
      (response) => {
        if (response.authResponse) {
          accessToken = response.authResponse.accessToken;
          authorized = true;
          resolve();
        } else {
          reject(new Error("Deezer login was cancelled or failed"));
        }
      },
      { perms: "manage_library" }
    );
  });
}

function getLoginStatus(): Promise<DZGetLoginStatusResponse> {
  return new Promise<DZGetLoginStatusResponse>((resolve) => {
    ensureSdk();
    window.DZ.getLoginStatus((response) => resolve(response));
  });
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------
interface DeezerSearchResult {
  data: Array<{
    id: number;
    title: string;
    artist: { name: string };
    album: { title: string; cover_big: string };
    preview: string;
    duration: number;
    link: string;
  }>;
}

interface DeezerPlaylistsResult {
  data: Array<{
    id: number;
    title: string;
  }>;
}

interface DeezerCreatePlaylistResult {
  id: number;
}

async function deezerApiFetch<T>(
  path: string,
  options?: { method?: string; params?: Record<string, string> }
): Promise<T> {
  const url = new URL(`https://api.deezer.com${path}`);

  if (options?.params) {
    for (const [key, value] of Object.entries(options.params)) {
      url.searchParams.set(key, value);
    }
  }

  if (accessToken) {
    url.searchParams.set("access_token", accessToken);
  }

  const response = await fetch(url.toString(), {
    method: options?.method ?? "GET",
  });

  if (!response.ok) {
    throw new Error(`Deezer API error: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as T & { error?: { message: string; code: number } };

  if (json.error) {
    throw new Error(`Deezer API error ${json.error.code}: ${json.error.message}`);
  }

  return json;
}

// ---------------------------------------------------------------------------
// Track mapper
// ---------------------------------------------------------------------------
function mapTrack(raw: DeezerSearchResult["data"][number]): PlatformTrack {
  return {
    platformId: "deezer",
    trackId: String(raw.id),
    title: raw.title,
    artist: raw.artist.name,
    album: raw.album.title,
    artworkUrl: raw.album.cover_big,
    previewUrl: raw.preview,
    durationMs: raw.duration * 1000,
    externalUrl: raw.link,
  };
}

// ---------------------------------------------------------------------------
// StreamingPlatform implementation
// ---------------------------------------------------------------------------
export const deezerPlatform: StreamingPlatform = {
  id: "deezer",
  name: "Deezer",
  color: "#A238FF",
  icon: DEEZER_ICON_SVG_PATH,
  isAvailable: typeof window !== "undefined",

  // ---- Auth ---------------------------------------------------------------
  async authorize(): Promise<void> {
    await initSdk();
    await loginWithPermissions();
  },

  isAuthorized(): boolean {
    return authorized && accessToken !== null;
  },

  // ---- Search -------------------------------------------------------------
  async search(query: string, limit = 10): Promise<PlatformTrack[]> {
    // Deezer search is CORS-friendly and needs no auth
    const result = await deezerApiFetch<DeezerSearchResult>("/search", {
      params: { q: query, limit: String(limit) },
    });

    return (result.data ?? []).map(mapTrack);
  },

  // ---- Playback -----------------------------------------------------------
  async play(trackId: string): Promise<void> {
    await initSdk();
    ensureSdk();

    const numericId = Number(trackId);
    if (Number.isNaN(numericId)) {
      throw new Error(`Invalid Deezer track ID: ${trackId}`);
    }

    window.DZ.player.playTracks([numericId]);
  },

  pause(): void {
    if (sdkLoaded && typeof window !== "undefined" && window.DZ) {
      window.DZ.player.pause();
    }
  },

  // ---- Playlists ----------------------------------------------------------
  async createPlaylist(
    name: string,
    description: string,
    trackIds: string[]
  ): Promise<string> {
    if (!accessToken) {
      throw new Error("Not authorized. Call authorize() first.");
    }

    const result = await deezerApiFetch<DeezerCreatePlaylistResult>(
      "/user/me/playlists",
      {
        method: "POST",
        params: { title: name },
      }
    );

    const playlistId = String(result.id);

    // Add initial tracks if provided
    if (trackIds.length > 0) {
      await this.addToPlaylist(playlistId, trackIds.join(","));
    }

    return playlistId;
  },

  async addToPlaylist(playlistId: string, trackId: string): Promise<void> {
    if (!accessToken) {
      throw new Error("Not authorized. Call authorize() first.");
    }

    await deezerApiFetch(`/playlist/${playlistId}/tracks`, {
      method: "POST",
      params: { songs: trackId },
    });
  },

  async getOrCreateDiscoveredPlaylist(): Promise<string> {
    if (!accessToken) {
      throw new Error("Not authorized. Call authorize() first.");
    }

    const result = await deezerApiFetch<DeezerPlaylistsResult>(
      "/user/me/playlists"
    );

    const existing = (result.data ?? []).find(
      (p) => p.title === "Discovered by Zeeky"
    );

    if (existing) {
      return String(existing.id);
    }

    return this.createPlaylist(
      "Discovered by Zeeky",
      "Songs discovered through Zeeky AI - powered by DNA audio fingerprinting",
      []
    );
  },

  // ---- Track matching -----------------------------------------------------
  async findTrack(
    title: string,
    artist: string
  ): Promise<PlatformTrack | null> {
    const query = `track:"${title}" artist:"${artist}"`;
    const results = await this.search(query, 1);
    return results[0] ?? null;
  },
};
