import IPhoneFrame from "@/components/IPhoneFrame";
import { PlayerProvider } from "@/lib/player-context";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlayerProvider>
      <IPhoneFrame>{children}</IPhoneFrame>
    </PlayerProvider>
  );
}
