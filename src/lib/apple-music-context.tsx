"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  initMusicKit,
  authorize,
  playSong,
  addToDiscoveredPlaylist,
  searchAppleMusic,
} from "./apple-music";

interface AppleMusicState {
  isReady: boolean;
  isAuthorized: boolean;
  isPlaying: boolean;
  currentSongId: string | null;
  error: string | null;
}

interface AppleMusicContextValue extends AppleMusicState {
  login: () => Promise<void>;
  play: (appleMusicId: string) => Promise<void>;
  pause: () => void;
  addToDiscovered: (appleMusicId: string) => Promise<{ created: boolean }>;
  search: (term: string) => Promise<any[]>;
}

const AppleMusicContext = createContext<AppleMusicContextValue | null>(null);

export function useAppleMusic() {
  const ctx = useContext(AppleMusicContext);
  if (!ctx) throw new Error("useAppleMusic must be inside AppleMusicProvider");
  return ctx;
}

export function AppleMusicProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppleMusicState>({
    isReady: false,
    isAuthorized: false,
    isPlaying: false,
    currentSongId: null,
    error: null,
  });

  useEffect(() => {
    initMusicKit()
      .then((music) => {
        setState((s) => ({
          ...s,
          isReady: true,
          isAuthorized: !!music.musicUserToken,
        }));

        // Listen to playback state changes
        music.addEventListener(
          "playbackStateDidChange",
          (event: any) => {
            const playing =
              event.state === window.MusicKit.PlaybackStates.playing;
            setState((s) => ({ ...s, isPlaying: playing }));
          }
        );

        music.addEventListener(
          "nowPlayingItemDidChange",
          (event: any) => {
            const id = event.item?.id || null;
            setState((s) => ({ ...s, currentSongId: id }));
          }
        );
      })
      .catch((err) => {
        // MusicKit not available (no token configured) - graceful degradation
        console.warn("MusicKit not available:", err.message);
        setState((s) => ({ ...s, error: err.message }));
      });
  }, []);

  const login = useCallback(async () => {
    try {
      await authorize();
      setState((s) => ({ ...s, isAuthorized: true }));
    } catch (err: any) {
      setState((s) => ({ ...s, error: err.message }));
    }
  }, []);

  const play = useCallback(async (appleMusicId: string) => {
    try {
      await playSong(appleMusicId);
    } catch (err: any) {
      setState((s) => ({ ...s, error: err.message }));
    }
  }, []);

  const pause = useCallback(() => {
    const music = (window as any).MusicKit?.getInstance?.();
    if (music) music.pause();
  }, []);

  const addToDiscovered = useCallback(async (appleMusicId: string) => {
    const result = await addToDiscoveredPlaylist(appleMusicId);
    return result;
  }, []);

  const search = useCallback(async (term: string) => {
    return searchAppleMusic(term);
  }, []);

  return (
    <AppleMusicContext.Provider
      value={{ ...state, login, play, pause, addToDiscovered, search }}
    >
      {children}
    </AppleMusicContext.Provider>
  );
}
