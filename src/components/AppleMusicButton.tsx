"use client";

interface AppleMusicButtonProps {
  track: string;
  artist: string;
  size: "chip" | "track" | "hero" | "neighbor";
}

function appleMusicUrl(track: string, artist: string) {
  return `https://music.apple.com/search?term=${encodeURIComponent(track + " " + artist)}&at=1010lZGl`;
}

const AppleMusicIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.802.42.127.856.187 1.297.228.473.044.95.07 1.426.07 4.355.002 8.71.002 13.066 0 .39 0 .78-.015 1.17-.056.488-.05.964-.138 1.42-.328 1.454-.607 2.462-1.67 2.96-3.14.163-.48.253-.974.304-1.478.048-.48.07-.96.074-1.44V6.124zM16.95 14.468c0 1.66-.48 2.88-1.47 3.68-.81.66-1.81.99-2.97.99-.52 0-.99-.07-1.42-.22-.66-.22-1.16-.6-1.5-1.15a3.3 3.3 0 01-.5-1.79c0-.92.28-1.67.86-2.25.58-.58 1.37-.91 2.38-.98.29-.02.63-.03 1.02-.02.2 0 .41.01.62.03V9.56l-4.69 1.47v5.15c0 1.63-.49 2.83-1.46 3.61-.81.65-1.79.97-2.95.97-.52 0-.99-.07-1.43-.22-.65-.22-1.15-.6-1.49-1.14a3.28 3.28 0 01-.5-1.78c0-.94.29-1.7.86-2.28.58-.58 1.38-.91 2.39-.98.28-.02.62-.02 1.01-.02.17 0 .35.01.52.02V8.4c0-.48.09-.88.29-1.21.25-.42.66-.68 1.21-.78l5.74-1.4c.16-.04.33-.06.5-.06.42 0 .76.13 1.01.38.25.26.38.6.38 1.03v8.1z" />
  </svg>
);

export default function AppleMusicButton({ track, artist, size }: AppleMusicButtonProps) {
  const url = appleMusicUrl(track, artist);

  if (size === "hero") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm text-white transition-transform active:scale-[0.97]"
        style={{ background: "linear-gradient(135deg, #fa233b, #ff5e3a)" }}
      >
        <AppleMusicIcon className="w-4 h-4" />
        Open in Apple Music
      </a>
    );
  }

  if (size === "chip") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-semibold text-white transition-transform active:scale-95"
        style={{ background: "linear-gradient(135deg, #fa233b, #ff5e3a)" }}
      >
        <AppleMusicIcon className="w-2.5 h-2.5" />
        Apple Music
      </a>
    );
  }

  if (size === "track") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform active:scale-90"
        style={{ background: "linear-gradient(135deg, #fa233b, #ff5e3a)" }}
      >
        <AppleMusicIcon className="w-4 h-4 text-white" />
      </a>
    );
  }

  /* neighbor — 28x28 for DNA similar lists */
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-transform active:scale-90"
      style={{ background: "linear-gradient(135deg, #fa233b, #ff5e3a)" }}
    >
      <AppleMusicIcon className="w-3.5 h-3.5 text-white" />
    </a>
  );
}
