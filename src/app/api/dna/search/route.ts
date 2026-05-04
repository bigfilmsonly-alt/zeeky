import { type NextRequest } from "next/server";
import { searchSongs } from "@/lib/dna-catalog";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "20", 10);
  const results = searchSongs(q, Math.min(limit, 50));
  return Response.json(results);
}
