"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type {
  PlatformId,
  StreamingPlatform,
  PlatformTrack,
} from "./platforms/types";
import { getPlatform, getAvailablePlatforms } from "./platforms";

interface StreamingContextValue {
  activePlatform: PlatformId | null;
  setActivePlatform: (id: PlatformId) => void;
  platform: StreamingPlatform | null;
  availablePlatforms: StreamingPlatform[];
  isAuthorized: boolean;
  authorize: () => Promise<void>;
  play: (title: string, artist: string) => Promise<void>;
  addToDiscovered: (title: string, artist: string) => Promise<void>;
  findTrack: (title: string, artist: string) => Promise<PlatformTrack | null>;
}

const StreamingContext = createContext<StreamingContextValue | null>(null);

export function useStreaming() {
  const ctx = useContext(StreamingContext);
  if (!ctx) throw new Error("useStreaming must be inside StreamingProvider");
  return ctx;
}

export function StreamingProvider({ children }: { children: ReactNode }) {
  const [activePlatformId, setActivePlatformId] =
    useState<PlatformId | null>(null);

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem("zeeky_platform") as PlatformId | null;
    if (saved) setActivePlatformId(saved);
  }, []);

  const setActivePlatform = useCallback((id: PlatformId) => {
    setActivePlatformId(id);
    localStorage.setItem("zeeky_platform", id);
  }, []);

  const platform = activePlatformId
    ? (getPlatform(activePlatformId) ?? null)
    : null;

  const authorize = useCallback(async () => {
    if (platform) await platform.authorize();
  }, [platform]);

  const play = useCallback(
    async (title: string, artist: string) => {
      if (!platform) return;
      const track = await platform.findTrack(title, artist);
      if (track) await platform.play(track.trackId);
    },
    [platform]
  );

  const addToDiscovered = useCallback(
    async (title: string, artist: string) => {
      if (!platform) return;
      const track = await platform.findTrack(title, artist);
      if (!track) return;
      const playlistId = await platform.getOrCreateDiscoveredPlaylist();
      await platform.addToPlaylist(playlistId, track.trackId);
    },
    [platform]
  );

  const findTrack = useCallback(
    async (title: string, artist: string) => {
      if (!platform) return null;
      return platform.findTrack(title, artist);
    },
    [platform]
  );

  return (
    <StreamingContext.Provider
      value={{
        activePlatform: activePlatformId,
        setActivePlatform,
        platform,
        availablePlatforms: getAvailablePlatforms(),
        isAuthorized: platform?.isAuthorized() ?? false,
        authorize,
        play,
        addToDiscovered,
        findTrack,
      }}
    >
      {children}
    </StreamingContext.Provider>
  );
}
