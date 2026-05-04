import IPhoneFrame from "@/components/IPhoneFrame";
import { PlayerProvider } from "@/lib/player-context";
import { MusicKitProvider } from "@/lib/musickit-context";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlayerProvider>
      <MusicKitProvider>
        <IPhoneFrame>{children}</IPhoneFrame>
      </MusicKitProvider>
    </PlayerProvider>
  );
}
