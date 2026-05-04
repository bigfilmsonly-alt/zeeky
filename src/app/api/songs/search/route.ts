import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");

  if (!q || q.length < 1) {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }

  try {
    // 1. Search local Supabase database
    const pattern = `%${q}%`;
    const { data: localData } = await supabase
      .from("songs")
      .select(
        "id, title, artist, audio_url, song_dna(hit_score)"
      )
      .or(`title.ilike.${pattern},artist.ilike.${pattern}`)
      .limit(limit);

    const localResults = (localData || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      artist: s.artist || "Unknown",
      hit_score: s.song_dna?.[0]?.hit_score ?? s.song_dna?.hit_score ?? 0,
      audio_url: s.audio_url,
      source: "zeeky" as const,
    }));

    // 2. Search iTunes / Apple Music catalog (free, no auth, millions of songs)
    let itunesResults: typeof localResults = [];
    try {
      const itunesRes = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=${limit}&country=US`,
        { next: { revalidate: 300 } }
      );
      if (itunesRes.ok) {
        const itunesData = await itunesRes.json();
        itunesResults = (itunesData.results || []).map((r: any) => ({
          id: `itunes-${r.trackId}`,
          title: r.trackName || "Unknown",
          artist: r.artistName || "Unknown",
          hit_score: 0,
          audio_url: r.previewUrl || null,
          artwork: r.artworkUrl100?.replace("100x100", "300x300") || null,
          source: "apple_music" as const,
          apple_track_id: String(r.trackId),
          album: r.collectionName || "",
          genre: r.primaryGenreName || "",
          duration_ms: r.trackTimeMillis || 0,
        }));
      }
    } catch {
      // iTunes API unavailable — continue with local results only
    }

    // 3. Search Deezer catalog (free, no auth, CORS-friendly)
    let deezerResults: typeof localResults = [];
    try {
      const dzRes = await fetch(
        `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=${Math.min(limit, 25)}`,
        { next: { revalidate: 300 } }
      );
      if (dzRes.ok) {
        const dzData = await dzRes.json();
        deezerResults = (dzData.data || []).map((r: any) => ({
          id: `deezer-${r.id}`,
          title: r.title || "Unknown",
          artist: r.artist?.name || "Unknown",
          hit_score: 0,
          audio_url: r.preview || null,
          artwork: r.album?.cover_medium || null,
          source: "deezer" as const,
          deezer_track_id: String(r.id),
          album: r.album?.title || "",
          duration_ms: (r.duration || 0) * 1000,
        }));
      }
    } catch {
      // Deezer API unavailable — continue
    }

    // 4. Merge & deduplicate (local DB first, then iTunes, then Deezer)
    const seen = new Set<string>();
    const merged: any[] = [];

    for (const r of localResults) {
      const key = `${r.title.toLowerCase()}|${r.artist.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(r);
      }
    }
    for (const r of itunesResults) {
      const key = `${r.title.toLowerCase()}|${r.artist.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(r);
      }
    }
    for (const r of deezerResults) {
      const key = `${r.title.toLowerCase()}|${r.artist.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(r);
      }
    }

    return NextResponse.json({ results: merged.slice(0, limit) });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Search failed" },
      { status: 500 }
    );
  }
}
