"use client";

import { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode } from "react";

export interface Track {
  id: string;
  title: string;
  artist: string;
  artwork?: string;
  previewUrl?: string;
  appleId?: number;
  match?: string;
}

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
}

interface PlayerContextValue extends PlayerState {
  play: (track: Track) => void;
  togglePlayPause: () => void;
  stop: () => void;
  onTrackEnd: (callback: () => void) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onEndCallbackRef = useRef<(() => void) | null>(null);
  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
  });

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setState((s) => ({ ...s, progress: audio.currentTime, duration: audio.duration || 0 }));
    };
    const onEnded = () => {
      setState((s) => ({ ...s, isPlaying: false, progress: 0 }));
      onEndCallbackRef.current?.();
    };
    const onPlay = () => setState((s) => ({ ...s, isPlaying: true }));
    const onPause = () => setState((s) => ({ ...s, isPlaying: false }));

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.pause();
    };
  }, []);

  const play = useCallback(async (track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;

    setState((s) => ({ ...s, currentTrack: track, isPlaying: false, progress: 0, duration: 0 }));

    let url = track.previewUrl;

    // If no preview URL but has appleId, fetch from iTunes
    if (!url && track.appleId) {
      try {
        const res = await fetch(`/api/dna/preview?appleId=${track.appleId}`);
        if (res.ok) {
          const data = await res.json();
          url = data.previewUrl;
          // Update track with artwork if available
          if (data.artworkUrl) {
            track = { ...track, artwork: data.artworkUrl, previewUrl: url || undefined };
            setState((s) => ({ ...s, currentTrack: track }));
          }
        }
      } catch {
        // Silently fail - no preview available
      }
    }

    if (url) {
      audio.src = url;
      audio.play().catch(() => {});
      setState((s) => ({ ...s, isPlaying: true }));
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setState((s) => ({ ...s, isPlaying: false, progress: 0, currentTrack: null }));
  }, []);

  const onTrackEnd = useCallback((callback: () => void) => {
    onEndCallbackRef.current = callback;
  }, []);

  return (
    <PlayerContext.Provider value={{ ...state, play, togglePlayPause, stop, onTrackEnd }}>
      {children}
    </PlayerContext.Provider>
  );
}
