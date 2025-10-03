import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = String(params.id);
    const c = await (prisma as any).course.findUnique({ where: { id } });
    if (!c) return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: c });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch course' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = String(params.id);
    const body = await request.json();

    const priceVal = body.price !== undefined ? Number(body.price) : undefined;
    const lessonsCountVal = body.lessonsCount !== undefined ? Number(body.lessonsCount) : undefined;
    const durationMinutesVal = body.durationMinutes !== undefined ? Number(body.durationMinutes) : undefined;
    const tagsVal = body.tags !== undefined
      ? (Array.isArray(body.tags)
          ? (body.tags as any[]).map((s) => String(s)).filter((s) => s.trim().length > 0)
          : typeof body.tags === 'string'
            ? String(body.tags).split(',').map((s) => s.trim()).filter((s) => s.length > 0)
            : [])
      : undefined;

    const updated = await (prisma as any).course.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        image: body.image,
        level: body.level,
        price: priceVal,
        status: body.status,
        category: body.category,
        tags: tagsVal as any,
        lessonsCount: lessonsCountVal,
        durationMinutes: durationMinutesVal,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
      }
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ success: false, error: 'Failed to update course' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = String(params.id);
    await (prisma as any).course.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete course' }, { status: 500 });
  }
}


