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
    // Use ILIKE for partial matching - works with any query
    const pattern = `%${q}%`;
    const { data, error } = await supabase
      .from("songs")
      .select("id, title, artist, audio_url, status, created_at, song_dna(hit_score, tempo, energy, danceability)")
      .or(`title.ilike.${pattern},artist.ilike.${pattern}`)
      .limit(limit);

    if (error) throw error;

    const results = (data || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      artist: s.artist || "Unknown",
      hit_score: s.song_dna?.[0]?.hit_score ?? s.song_dna?.hit_score ?? 0,
      audio_url: s.audio_url,
    }));

    return NextResponse.json({ results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Search failed" }, { status: 500 });
  }
}
