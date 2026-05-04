import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");

  try {
    let songId = id;

    // If id is not a UUID, try to find the song by title
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      const { data: found } = await supabase
        .from("songs")
        .select("id")
        .ilike("title", `%${decodeURIComponent(id)}%`)
        .limit(1)
        .single();

      if (!found) {
        return NextResponse.json({ results: [], message: "Song not found" });
      }
      songId = found.id;
    }

    // Get the target song's DNA vector
    const { data: targetDna } = await supabase
      .from("song_dna")
      .select("dna_vector")
      .eq("song_id", songId)
      .single();

    if (!targetDna?.dna_vector) {
      return NextResponse.json({ results: [], message: "No DNA data for this song" });
    }

    // Use the RPC function for similarity search
    const { data, error } = await supabase.rpc("find_similar_songs", {
      target_song_id: songId,
      match_count: limit,
    });

    if (error) throw error;

    const results = (data || []).map((s: any) => ({
      id: s.song_id,
      title: s.title,
      artist: s.artist || "Unknown",
      similarity: s.similarity ? (s.similarity * 100).toFixed(1) : "0.0",
      hit_score: s.hit_score || 0,
    }));

    return NextResponse.json({ results, songId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Similarity search failed" }, { status: 500 });
  }
}
