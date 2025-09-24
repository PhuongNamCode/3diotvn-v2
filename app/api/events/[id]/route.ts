import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        registrations: { where: { status: { not: 'cancelled' } }, select: { id: true } },
      },
    });
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }
    const mapped = {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      capacity: event.capacity,
      price: event.price,
      speakers: (event.speakers as any) || [],
      requirements: event.requirements || '',
      agenda: event.agenda || '',
      image: event.image || '',
      category: event.category,
      status: event.status,
      registrations: event.registrations.length,
      actualParticipants: event.actualParticipants ?? undefined,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event' },
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
    const event = await prisma.event.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        date: body.date ? new Date(body.date) : undefined,
        time: body.time,
        location: body.location,
        capacity: typeof body.capacity === 'number' ? body.capacity : undefined,
        price: typeof body.price === 'number' ? body.price : undefined,
        speakers: Array.isArray(body.speakers) ? body.speakers : undefined,
        requirements: body.requirements,
        agenda: body.agenda,
        image: body.image,
        category: body.category,
        status: body.status,
        actualParticipants: typeof body.actualParticipants === 'number' ? body.actualParticipants : undefined,
      },
    });
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update event' },
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
    await prisma.event.delete({ where: { id } });
    const success = true;
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}