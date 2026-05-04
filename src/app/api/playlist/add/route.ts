import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getOrCreateDiscoveredPlaylist, addToPlaylist } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { songId } = await request.json();

  // Get user from auth header
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const playlist = await getOrCreateDiscoveredPlaylist(user.id);
    const track = await addToPlaylist(playlist.id, songId);
    return NextResponse.json({ playlist, track });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add to playlist" },
      { status: 500 }
    );
  }
}
