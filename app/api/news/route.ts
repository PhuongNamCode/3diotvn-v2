import { newsData } from "@/data/news";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.news.findMany({ orderBy: { date: 'desc' } });
    if (rows.length > 0) return Response.json({ items: rows });
  } catch {}
  return Response.json({ items: newsData });
}


