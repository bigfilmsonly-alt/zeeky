import { NextRequest, NextResponse } from "next/server";
import { findSimilarSongs } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");

  try {
    const results = await findSimilarSongs(id, limit);
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: "Similarity search failed" },
      { status: 500 }
    );
  }
}
