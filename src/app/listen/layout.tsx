import { PlayerProvider } from "@/lib/player-context";
import IPhoneFrame from "@/components/IPhoneFrame";

export const metadata = {
  title: "Listen | Zeeky",
  description: "Discover music powered by Zeeky DNA — the audio fingerprint engine.",
};

export default function ListenLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlayerProvider>
      <IPhoneFrame>{children}</IPhoneFrame>
    </PlayerProvider>
  );
}
