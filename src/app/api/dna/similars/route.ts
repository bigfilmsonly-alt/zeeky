import { type NextRequest } from "next/server";
import { getSimilars } from "@/lib/dna-catalog";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const idStr = request.nextUrl.searchParams.get("id");
  if (!idStr || isNaN(Number(idStr))) {
    return Response.json(
      { error: "Missing or invalid id parameter" },
      { status: 400 }
    );
  }

  const id = parseInt(idStr, 10);
  const limit = parseInt(
    request.nextUrl.searchParams.get("limit") ?? "50",
    10
  );

  const result = getSimilars(id);
  if (!result) {
    return Response.json({ error: "Song not found" }, { status: 404 });
  }

  return Response.json({
    song: result.song,
    similars: result.similars.slice(0, limit),
  });
}
