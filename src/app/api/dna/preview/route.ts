import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const appleId = request.nextUrl.searchParams.get("appleId");
  if (!appleId) {
    return Response.json({ error: "appleId required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://itunes.apple.com/lookup?id=${appleId}&entity=song`,
      { next: { revalidate: 86400 } } // cache for 24h
    );
    if (!res.ok) {
      return Response.json({ error: "iTunes lookup failed" }, { status: 502 });
    }
    const data = await res.json();
    const track = data.results?.[0];
    if (!track) {
      return Response.json({ error: "Track not found" }, { status: 404 });
    }

    return Response.json({
      previewUrl: track.previewUrl || null,
      trackViewUrl: track.trackViewUrl || null,
      artworkUrl: track.artworkUrl100?.replace("100x100", "300x300") || null,
      trackName: track.trackName,
      artistName: track.artistName,
      collectionName: track.collectionName,
    });
  } catch {
    return Response.json({ error: "Lookup failed" }, { status: 500 });
  }
}
