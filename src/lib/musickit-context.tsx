"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface MusicKitContextValue {
  isConfigured: boolean;
  isAuthorized: boolean;
  authorize: () => Promise<void>;
  playByAppleId: (appleId: number) => Promise<boolean>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  isPlaying: boolean;
  progress: number;
  duration: number;
}

const MusicKitContext = createContext<MusicKitContextValue | null>(null);

export function useMusicKit() {
  return useContext(MusicKitContext);
}

export function MusicKitProvider({ children }: { children: ReactNode }) {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [musicInstance, setMusicInstance] = useState<any>(null);

  // Initialize MusicKit
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/musickit/token");
        const data = await res.json();
        if (!data.configured) return;

        // Load MusicKit JS
        if (!document.getElementById("musickit-script")) {
          const script = document.createElement("script");
          script.id = "musickit-script";
          script.src = "https://js-cdn.music.apple.com/musickit/v3/musickit.js";
          script.setAttribute("data-web-components", "");
          document.head.appendChild(script);

          await new Promise<void>((resolve) => {
            script.onload = () => resolve();
          });
        }

        // Wait for MusicKit to be ready
        await (window as any).MusicKit.configure({
          developerToken: data.token,
          app: {
            name: "Zeeky",
            build: "1.0.0",
          },
        });

        const instance = (window as any).MusicKit.getInstance();
        setMusicInstance(instance);
        setIsConfigured(true);

        // Check if already authorized
        if (instance.musicUserToken) {
          setIsAuthorized(true);
        }

        // Listen for playback events
        instance.addEventListener("playbackStateDidChange", () => {
          setIsPlaying(instance.isPlaying);
        });

        instance.addEventListener("playbackProgressDidChange", (event: any) => {
          setProgress(event.progress * instance.currentPlaybackDuration);
          setDuration(instance.currentPlaybackDuration);
        });
      } catch {
        // MusicKit not available
      }
    }
    init();
  }, []);

  const authorize = useCallback(async () => {
    if (!musicInstance) return;
    try {
      await musicInstance.authorize();
      setIsAuthorized(true);
    } catch {
      // User declined
    }
  }, [musicInstance]);

  const playByAppleId = useCallback(async (appleId: number): Promise<boolean> => {
    if (!musicInstance || !isAuthorized) return false;
    try {
      await musicInstance.setQueue({ songs: [String(appleId)] });
      await musicInstance.play();
      return true;
    } catch {
      return false;
    }
  }, [musicInstance, isAuthorized]);

  const pause = useCallback(() => {
    musicInstance?.pause();
  }, [musicInstance]);

  const resume = useCallback(() => {
    musicInstance?.play();
  }, [musicInstance]);

  const stop = useCallback(() => {
    musicInstance?.stop();
  }, [musicInstance]);

  return (
    <MusicKitContext.Provider value={{
      isConfigured,
      isAuthorized,
      authorize,
      playByAppleId,
      pause,
      resume,
      stop,
      isPlaying,
      progress,
      duration,
    }}>
      {children}
    </MusicKitContext.Provider>
  );
}
