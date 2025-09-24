import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const registration = await prisma.registration.findUnique({ where: { id } });
    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Registration not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: registration });
  } catch (error) {
    console.error('Error fetching registration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch registration' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const registration = await prisma.registration.update({
      where: { id },
      data: {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        organization: body.organization,
        experience: body.experience,
        expectation: body.expectation,
        status: body.status,
      },
    });
    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Update event count if status changed
    if (registration.eventId) {
      const count = await prisma.registration.count({ where: { eventId: registration.eventId, NOT: { status: 'cancelled' } } });
      await prisma.event.update({ where: { id: registration.eventId }, data: { registrationsCount: count } });
    }

    return NextResponse.json({ success: true, data: registration });
  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update registration' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const existing = await prisma.registration.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Registration not found' },
        { status: 404 }
      );
    }
    await prisma.registration.delete({ where: { id } });
    const count = await prisma.registration.count({ where: { eventId: existing.eventId, NOT: { status: 'cancelled' } } });
    await prisma.event.update({ where: { id: existing.eventId }, data: { registrationsCount: count } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting registration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete registration' },
      { status: 500 }
    );
  }
}
