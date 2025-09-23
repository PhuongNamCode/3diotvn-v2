import { prisma } from "@/app/lib/prisma";

export async function POST(request: Request) {
  const data = await request.json().catch(() => null);
  if (!data || !data.fullName || !data.email || !data.message || !data.organization) {
    return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
  }
  try {
    await prisma.contact.create({ data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || null,
      organization: data.organization,
      message: data.message,
    }});
  } catch {}
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
}


