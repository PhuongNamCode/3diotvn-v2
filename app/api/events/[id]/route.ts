import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id: eventId } = await params;

    // Sanitize numeric fields
    const capacityVal = Number.isFinite(Number(body.capacity)) ? Number(body.capacity) : undefined;
    const priceVal = Number.isFinite(Number(body.price)) ? Number(body.price) : undefined;
    const actualParticipantsVal =
      body.actualParticipants !== undefined && Number.isFinite(Number(body.actualParticipants))
        ? Number(body.actualParticipants)
        : undefined;

    // Sanitize arrays
    const speakersVal = Array.isArray(body.speakers)
      ? (body.speakers as any[]).map((s) => String(s)).filter((s) => s.trim().length > 0)
      : typeof body.speakers === 'string'
        ? String(body.speakers).split(',').map((s) => s.trim()).filter((s) => s.length > 0)
        : undefined;

    // Build update data object, only including defined fields
    const updateData: any = {};
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.date !== undefined && !isNaN(new Date(body.date).getTime())) {
      updateData.date = new Date(body.date);
    }
    if (body.time !== undefined) updateData.time = body.time;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.onlineLink !== undefined) updateData.onlineLink = body.onlineLink || null;
    if (capacityVal !== undefined) updateData.capacity = capacityVal;
    if (priceVal !== undefined) updateData.price = priceVal;
    if (speakersVal !== undefined) updateData.speakers = speakersVal;
    if (body.requirements !== undefined) updateData.requirements = body.requirements || null;
    if (body.agenda !== undefined) updateData.agenda = body.agenda || null;
    if (body.image !== undefined) updateData.image = body.image || null;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.status !== undefined) updateData.status = body.status;
    if (actualParticipantsVal !== undefined) updateData.actualParticipants = actualParticipantsVal;

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
    });

    const mapped = {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      date: updated.date,
      time: updated.time,
      location: updated.location,
      onlineLink: updated.onlineLink || null,
      capacity: updated.capacity,
      price: updated.price,
      speakers: (updated.speakers as any) || [],
      requirements: updated.requirements || '',
      agenda: updated.agenda || '',
      image: updated.image || '',
      category: updated.category,
      status: updated.status,
      registrations: 0, // Will be populated by frontend if needed
      actualParticipants: updated.actualParticipants ?? undefined,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };

    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Error updating event:', error);
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
  try {
    const { id: eventId } = await params;

    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}