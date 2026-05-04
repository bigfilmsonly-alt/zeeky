import { type NextRequest } from "next/server";
import { getSimilars, searchSongs } from "@/lib/dna-catalog";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const idStr = request.nextUrl.searchParams.get("id");
  const q = request.nextUrl.searchParams.get("q");

  if (idStr) {
    if (isNaN(Number(idStr))) {
      return Response.json(
        { error: "Invalid id parameter" },
        { status: 400 }
      );
    }

    const id = parseInt(idStr, 10);
    const result = getSimilars(id);
    if (!result) {
      return Response.json({ error: "Song not found" }, { status: 404 });
    }

    return Response.json({ song: result.song });
  }

  if (q) {
    const limit = parseInt(
      request.nextUrl.searchParams.get("limit") ?? "20",
      10
    );
    const results = searchSongs(q, Math.min(limit, 50));
    return Response.json(results);
  }

  return Response.json(
    { error: "Missing id or q parameter" },
    { status: 400 }
  );
}
