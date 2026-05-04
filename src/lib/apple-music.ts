// Apple MusicKit JS wrapper for Zeeky
// Docs: https://developer.apple.com/documentation/musickitjs

declare global {
  interface Window {
    MusicKit: any;
  }
}

let musicKitInstance: any = null;

export async function initMusicKit(): Promise<any> {
  if (musicKitInstance) return musicKitInstance;

  // Load MusicKit JS if not already loaded
  if (!window.MusicKit) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://js-cdn.music.apple.com/musickit/v3/musickit.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load MusicKit JS"));
      document.head.appendChild(script);
    });

    // Wait for MusicKit to be ready
    await new Promise<void>((resolve) => {
      document.addEventListener("musickitloaded", () => resolve(), {
        once: true,
      });
    });
  }

  musicKitInstance = await window.MusicKit.configure({
    developerToken: process.env.NEXT_PUBLIC_APPLE_MUSIC_TOKEN || "",
    app: {
      name: "Zeeky",
      build: "1.0.0",
    },
  });

  return musicKitInstance;
}

export function getMusicKit(): any {
  return musicKitInstance;
}

export async function authorize(): Promise<string> {
  const music = await initMusicKit();
  const token = await music.authorize();
  return token;
}

export async function searchAppleMusic(term: string, limit = 10) {
  const music = await initMusicKit();
  const result = await music.api.music(`/v1/catalog/us/search`, {
    term,
    types: ["songs"],
    limit,
  });
  return result.data.results?.songs?.data || [];
}

export async function playSong(appleMusicId: string) {
  const music = await initMusicKit();
  await music.setQueue({ song: appleMusicId });
  await music.play();
}

export async function createPlaylist(
  name: string,
  description: string,
  songIds: string[]
) {
  const music = await initMusicKit();
  const userToken = music.musicUserToken;

  if (!userToken) {
    await authorize();
  }

  // Create playlist via Apple Music API
  const response = await music.api.music(
    "/v1/me/library/playlists",
    undefined,
    {
      fetchOptions: {
        method: "POST",
        body: JSON.stringify({
          attributes: {
            name,
            description,
          },
          relationships: {
            tracks: {
              data: songIds.map((id) => ({
                id,
                type: "songs",
              })),
            },
          },
        }),
      },
    }
  );

  return response.data.data[0];
}

// "Discovered by Zeeky" -- the core feature
export async function addToDiscoveredPlaylist(appleMusicSongId: string) {
  const music = await initMusicKit();

  if (!music.musicUserToken) {
    await authorize();
  }

  // Search for existing "Discovered by Zeeky" playlist
  const libraryPlaylists = await music.api.music(
    "/v1/me/library/playlists"
  );
  const playlists = libraryPlaylists.data.data || [];

  let discoveredPlaylist = playlists.find(
    (p: any) => p.attributes.name === "Discovered by Zeeky"
  );

  if (!discoveredPlaylist) {
    // Create the playlist
    discoveredPlaylist = await createPlaylist(
      "Discovered by Zeeky",
      "Songs discovered through Zeeky AI - powered by DNA audio fingerprinting",
      [appleMusicSongId]
    );
    return { created: true, playlist: discoveredPlaylist };
  }

  // Add track to existing playlist
  await music.api.music(
    `/v1/me/library/playlists/${discoveredPlaylist.id}/tracks`,
    undefined,
    {
      fetchOptions: {
        method: "POST",
        body: JSON.stringify({
          data: [{ id: appleMusicSongId, type: "songs" }],
        }),
      },
    }
  );

  return { created: false, playlist: discoveredPlaylist };
}

export function isAuthorized(): boolean {
  return !!musicKitInstance?.musicUserToken;
}
