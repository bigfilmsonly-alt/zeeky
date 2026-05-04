import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("songs")
      .select("id, title, artist, audio_url, song_dna(hit_score)")
      .order("created_at", { ascending: false })
      .limit(100);

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
    return NextResponse.json({ error: err.message || "Failed to load songs" }, { status: 500 });
  }
}
