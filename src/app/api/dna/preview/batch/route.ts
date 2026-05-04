import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { appleIds } = await request.json();
  if (!Array.isArray(appleIds) || appleIds.length === 0) {
    return Response.json({ error: "appleIds array required" }, { status: 400 });
  }

  // iTunes supports comma-separated IDs (up to ~200)
  const ids = appleIds.slice(0, 50).join(",");
  try {
    const res = await fetch(
      `https://itunes.apple.com/lookup?id=${ids}&entity=song`
    );
    if (!res.ok) {
      return Response.json({ error: "iTunes lookup failed" }, { status: 502 });
    }
    const data = await res.json();
    const previews: Record<
      string,
      { previewUrl: string; artworkUrl: string; trackViewUrl: string }
    > = {};

    for (const track of data.results || []) {
      if (track.trackId && track.previewUrl) {
        previews[String(track.trackId)] = {
          previewUrl: track.previewUrl,
          artworkUrl:
            track.artworkUrl100?.replace("100x100", "300x300") || "",
          trackViewUrl: track.trackViewUrl || "",
        };
      }
    }

    return Response.json({ previews });
  } catch {
    return Response.json({ error: "Batch lookup failed" }, { status: 500 });
  }
}
