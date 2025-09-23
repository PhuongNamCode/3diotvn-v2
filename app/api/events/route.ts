import { eventsData } from "@/data/events";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.event.findMany({ orderBy: { date: 'asc' } });
    if (rows.length > 0) return Response.json({ items: rows });
  } catch {}
  return Response.json({ items: eventsData });
}


