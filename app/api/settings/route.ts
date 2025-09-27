import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rows = await (prisma as any).setting.findMany();
    const result: Record<string, any> = {};
    for (const r of rows) {
      result[r.key] = r.json ?? r.value ?? null;
    }
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }
    const entries = Object.entries(body as Record<string, any>);
    for (const [key, value] of entries) {
      if (value !== null && typeof value === 'object') {
        await (prisma as any).setting.upsert({
          where: { key },
          create: { key, json: value },
          update: { json: value, value: null },
        });
      } else {
        await (prisma as any).setting.upsert({
          where: { key },
          create: { key, value: value == null ? null : String(value) },
          update: { value: value == null ? null : String(value), json: null },
        });
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
  }
}


