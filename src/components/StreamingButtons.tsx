"use client";

interface Props {
  track: string;
  artist: string;
  size?: "sm" | "md";
}

// Generate search URLs for each platform
function platformLinks(track: string, artist: string) {
  const q = encodeURIComponent(`${track} ${artist}`);
  return [
    {
      id: "spotify",
      name: "Spotify",
      url: `https://open.spotify.com/search/${q}`,
      color: "#1DB954",
      icon: "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z",
    },
    {
      id: "apple",
      name: "Apple Music",
      url: `https://music.apple.com/search?term=${q}`,
      color: "#FA233B",
      icon: "M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.802.42.127.856.187 1.297.228.473.044.95.07 1.426.07 4.355.002 8.71.002 13.066 0 .39 0 .78-.015 1.17-.056.488-.05.964-.138 1.42-.328 1.454-.607 2.462-1.67 2.96-3.14.163-.48.253-.974.304-1.478.048-.48.07-.96.074-1.44V6.124z",
    },
    {
      id: "youtube",
      name: "YouTube Music",
      url: `https://music.youtube.com/search?q=${q}`,
      color: "#FF0000",
      icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
    },
    {
      id: "deezer",
      name: "Deezer",
      url: `https://www.deezer.com/search/${q}`,
      color: "#A238FF",
      icon: "M18.81 4.16v3.03H24V4.16h-5.19zM6.27 8.38v3.027h5.189V8.38H6.27zm12.54 0v3.027H24V8.38h-5.19zM0 12.594v3.027h5.19v-3.027H0zm6.27 0v3.027h5.189v-3.027H6.27zm6.27 0v3.027h5.19v-3.027h-5.19zm6.27 0v3.027H24v-3.027h-5.19zM0 16.81v3.029h5.19v-3.03H0zm6.27 0v3.029h5.189v-3.03H6.27zm6.27 0v3.029h5.19v-3.03h-5.19zm6.27 0v3.029H24v-3.03h-5.19z",
    },
    {
      id: "tidal",
      name: "Tidal",
      url: `https://tidal.com/search?q=${q}`,
      color: "#000000",
      icon: "M12.012 3.992L8.008 7.996 4.004 3.992 0 7.996l4.004 4.004L8.008 8l4.004 4 4.004-4-4.004-4.004zM12.012 12l-4.004 4.004L12.012 20l4.004-4.004L12.012 12zm3.996-4.004l4.004-4.004L24.016 7.996 20.012 12l-4.004-4.004z",
    },
  ];
}

export default function StreamingButtons({ track, artist, size = "sm" }: Props) {
  const links = platformLinks(track, artist);

  if (size === "md") {
    // Larger horizontal row with labels
    return (
      <div className="flex gap-2 flex-wrap">
        {links.map((p) => (
          <a
            key={p.id}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold text-white transition-transform active:scale-95"
            style={{ background: p.color }}
          >
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor">
              <path d={p.icon} />
            </svg>
            {p.name}
          </a>
        ))}
      </div>
    );
  }

  // Small row of icon-only buttons
  return (
    <div className="flex gap-1">
      {links.map((p) => (
        <a
          key={p.id}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-transform active:scale-90"
          style={{ background: p.color }}
          title={`Open on ${p.name}`}
        >
          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="white">
            <path d={p.icon} />
          </svg>
        </a>
      ))}
    </div>
  );
}
