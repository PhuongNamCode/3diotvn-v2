import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = String(params.id);
    const body = await request.json();
    const updated = await (prisma as any).courseEnrollment.update({
      where: { id },
      data: {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        status: body.status,
      }
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating course enrollment:', error);
    return NextResponse.json({ success: false, error: 'Failed to update enrollment' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = String(params.id);
    const deleted = await (prisma as any).courseEnrollment.delete({ where: { id } });
    // recompute enrolledCount
    const count = await (prisma as any).courseEnrollment.count({ where: { courseId: deleted.courseId, NOT: { status: 'cancelled' } } });
    await (prisma as any).course.update({ where: { id: deleted.courseId }, data: { enrolledCount: count } });
    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (error) {
    console.error('Error deleting course enrollment:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete enrollment' }, { status: 500 });
  }
}


