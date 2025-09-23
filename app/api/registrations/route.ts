import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  const data = await request.json().catch(() => null);
  if (!data || !data.eventId || !data.fullName || !data.email) {
    return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
  }
  try {
    const rec = await prisma.registration.create({ data: {
      eventId: Number(data.eventId),
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || null,
      organization: data.organization || null,
      experience: data.experience || null,
      expectation: data.expectation || null,
    }});
    return new Response(JSON.stringify({ ok: true, id: rec.id }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
}


