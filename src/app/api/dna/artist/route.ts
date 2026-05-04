import { type NextRequest } from "next/server";
import { getArtistPlaylist } from "@/lib/dna-catalog";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  const limit = parseInt(
    request.nextUrl.searchParams.get("limit") ?? "50",
    10
  );

  if (!q || q.trim().length < 2) {
    return Response.json(
      { error: "Provide an artist name with ?q=artist" },
      { status: 400 }
    );
  }

  const result = getArtistPlaylist(q, Math.min(limit, 100));
  if (!result) {
    return Response.json({ error: "Artist not found" }, { status: 404 });
  }

  return Response.json(result);
}
