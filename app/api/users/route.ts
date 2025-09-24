import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Upsert by unique email: if exists, return existing; else create minimal record
    const existing = await prisma.user.findUnique({ where: { email: String(body.email || '') } });
    if (existing) {
      return NextResponse.json({ success: true, data: existing }, { status: 200 });
    }
    const created = await prisma.user.create({
      data: {
        id: body.id ? String(body.id) : undefined,
        name: body.name || '',
        email: String(body.email || ''),
        phone: body.phone || '',
        company: body.company || '',
        role: body.role || 'Member',
        status: body.status || 'active',
        joinDate: body.joinDate ? new Date(body.joinDate) : new Date(),
        lastActive: body.lastActive || 'vừa xong',
      }
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
