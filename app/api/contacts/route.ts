import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: contacts });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const created = await prisma.contact.create({
      data: {
        id: body.id ? String(body.id) : undefined,
        name: body.name || '',
        email: body.email || '',
        phone: body.phone || '',
        company: body.company || '',
        role: body.role || 'Contact',
        message: body.message || '',
        type: body.type || 'general',
        status: body.status || 'new',
        priority: body.priority || 'medium',
        notes: Array.isArray(body.notes) ? body.notes : [],
      },
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}
