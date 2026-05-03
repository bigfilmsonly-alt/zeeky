import TabBar from "./TabBar";
import MiniPlayer from "./MiniPlayer";

export default function IPhoneFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="iphone-page">
      <div className="iphone-ambient-1" />
      <div className="iphone-ambient-2" />

      <div className="iphone-device">
        <div className="iphone-screen">
          {/* Dynamic Island */}
          <div className="iphone-island" />

          {/* Scrollable content */}
          <div className="iphone-content">{children}</div>

          {/* Mini player — shows when a track is playing */}
          <MiniPlayer />

          {/* Tab bar */}
          <TabBar />

          {/* Home indicator */}
          <div className="iphone-home-area">
            <div className="iphone-home-bar" />
          </div>
        </div>
      </div>
    </div>
  );
}
