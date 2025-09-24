import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const registrations = await prisma.registration.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: registrations });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate event exists
    const eventId = String(body.eventId);
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 400 });
    }

    const created = await prisma.registration.create({
      data: {
        id: body.id ? String(body.id) : undefined,
        eventId,
        fullName: body.fullName || '',
        email: body.email || '',
        phone: body.phone || null,
        organization: body.organization || null,
        experience: body.experience || null,
        expectation: body.expectation || null,
        status: body.status || 'pending',
      },
    });

    // Update denormalized count for the event
    const count = await prisma.registration.count({ where: { eventId: created.eventId, NOT: { status: 'cancelled' } } });
    await prisma.event.update({ where: { id: created.eventId }, data: { registrationsCount: count } });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating registration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create registration' },
      { status: 500 }
    );
  }
}