import { NextResponse } from "next/server";
import { browseAnime } from "@/services/anilistService";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ items: [] });
  try {
    const r = await browseAnime({ q, page: 1, perPage: 6 });
    return NextResponse.json({
      items: r.items.map((a) => ({
        slug: a.slug,
        title: a.title,
        cover: a.cover,
        rating: a.rating,
        year: a.year,
        episodeCount: a.episodeCount,
      })),
    });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
