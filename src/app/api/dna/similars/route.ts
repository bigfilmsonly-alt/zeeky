import { type NextRequest } from "next/server";
import { getSimilars } from "@/lib/dna-catalog";

export async function GET(request: NextRequest) {
  const idStr = request.nextUrl.searchParams.get("id");
  if (!idStr) {
    return Response.json({ error: "Missing id parameter" }, { status: 400 });
  }
  const id = parseInt(idStr, 10);
  const result = getSimilars(id);
  if (!result) {
    return Response.json({ error: "Song not found" }, { status: 404 });
  }
  return Response.json(result);
}
