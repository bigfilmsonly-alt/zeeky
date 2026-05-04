import { type NextRequest } from "next/server";
import { searchAll } from "@/lib/dna-catalog";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "30", 10);
  const mode = request.nextUrl.searchParams.get("mode"); // "full" for grouped results

  if (mode === "full") {
    const results = searchAll(q, Math.min(limit, 50));
    return Response.json(results);
  }

  // Backward compat: flat song list
  const results = searchAll(q, Math.min(limit, 50));
  return Response.json(results.songs);
}
