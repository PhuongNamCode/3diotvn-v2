import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const c = await (prisma as any).course.findUnique({ where: { id } });
    if (!c) return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    
    // Normalize potential stringified JSON fields
    let normalizedCurriculum: any[] = [];
    let normalizedWhatYouWillLearn: any[] = [];
    try {
      if (Array.isArray((c as any).curriculum)) {
        normalizedCurriculum = (c as any).curriculum as any[];
      } else if (typeof (c as any).curriculum === 'string' && (c as any).curriculum.trim().length > 0) {
        normalizedCurriculum = JSON.parse((c as any).curriculum as unknown as string);
        if (!Array.isArray(normalizedCurriculum)) normalizedCurriculum = [];
      }
    } catch {
      normalizedCurriculum = [];
    }
    try {
      if (Array.isArray((c as any).whatYouWillLearn)) {
        normalizedWhatYouWillLearn = (c as any).whatYouWillLearn as any[];
      } else if (typeof (c as any).whatYouWillLearn === 'string' && (c as any).whatYouWillLearn.trim().length > 0) {
        normalizedWhatYouWillLearn = JSON.parse((c as any).whatYouWillLearn as unknown as string);
        if (!Array.isArray(normalizedWhatYouWillLearn)) normalizedWhatYouWillLearn = [];
      }
    } catch {
      normalizedWhatYouWillLearn = [];
    }

    const data = {
      id: c.id,
      title: c.title,
      description: c.description,
      image: c.image || '',
      level: c.level,
      price: c.price,
      status: c.status,
      category: c.category,
      tags: (c.tags as any) || [],
      lessonsCount: c.lessonsCount,
      durationMinutes: c.durationMinutes,
      enrolledCount: c.enrolledCount,
      // Enhanced fields
      overview: c.overview || '',
      curriculum: normalizedCurriculum,
      instructorName: c.instructorName || '',
      instructorBio: c.instructorBio || '',
      instructorImage: c.instructorImage || '',
      instructorEmail: c.instructorEmail || '',
      requirements: c.requirements || '',
      whatYouWillLearn: normalizedWhatYouWillLearn,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch course' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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
        // Enhanced fields
        overview: body.overview,
        curriculum: body.curriculum as any,
        instructorName: body.instructorName,
        instructorBio: body.instructorBio,
        instructorImage: body.instructorImage,
        instructorEmail: body.instructorEmail,
        requirements: body.requirements,
        whatYouWillLearn: body.whatYouWillLearn as any,
      }
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ success: false, error: 'Failed to update course' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await (prisma as any).course.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete course' }, { status: 500 });
  }
}


