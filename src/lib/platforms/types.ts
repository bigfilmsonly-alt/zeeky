export type PlatformId = "apple" | "spotify" | "deezer" | "tidal" | "youtube";

export interface StreamingPlatform {
  id: PlatformId;
  name: string;
  color: string; // brand color
  icon: string; // SVG path data for the logo
  isAvailable: boolean;

  // Auth
  authorize(): Promise<void>;
  isAuthorized(): boolean;

  // Search
  search(query: string, limit?: number): Promise<PlatformTrack[]>;

  // Playback
  play(trackId: string): Promise<void>;
  pause(): void;

  // Playlists - the core "Discovered by Zeeky" feature
  createPlaylist(
    name: string,
    description: string,
    trackIds: string[]
  ): Promise<string>;
  addToPlaylist(playlistId: string, trackId: string): Promise<void>;
  getOrCreateDiscoveredPlaylist(): Promise<string>; // returns playlist ID

  // Track matching - find this song on this platform
  findTrack(title: string, artist: string): Promise<PlatformTrack | null>;
}

export interface PlatformTrack {
  platformId: PlatformId;
  trackId: string; // platform-specific ID
  title: string;
  artist: string;
  album?: string;
  artworkUrl?: string;
  previewUrl?: string;
  durationMs?: number;
  externalUrl: string; // deep link to open in the platform's app
}
