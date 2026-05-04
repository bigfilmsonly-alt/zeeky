import { type NextRequest } from "next/server";
import { getGenres, getByGenre } from "@/lib/dna-catalog";

export async function GET(request: NextRequest) {
  const genre = request.nextUrl.searchParams.get("genre");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "50", 10);

  if (genre) {
    const songs = getByGenre(genre, Math.min(limit, 100));
    return Response.json(songs);
  }

  const genres = getGenres();
  return Response.json(genres);
}
