import { type NextRequest } from "next/server";
import { getTrending } from "@/lib/dna-catalog";

export async function GET(request: NextRequest) {
  const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "10", 10);
  const trending = getTrending(Math.min(limit, 50));
  return Response.json({ trending });
}
