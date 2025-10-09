import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Math.min(Number(searchParams.get('limit') || '50'), 100);
    const category = searchParams.get('category') || undefined;
    const level = searchParams.get('level') || undefined;
    const search = searchParams.get('search') || undefined;
    
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (level) where.level = level;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.course.count({ where })
    ]);

    const data = items.map((c) => ({
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
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    const response = { success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body?.title) {
      return NextResponse.json({ success: false, error: 'Thiếu trường bắt buộc (title)' }, { status: 400 });
    }

    const priceVal = Number.isFinite(Number(body.price)) ? Number(body.price) : 0;
    const lessonsCountVal = Number.isFinite(Number(body.lessonsCount)) ? Number(body.lessonsCount) : 0;
    const durationMinutesVal = Number.isFinite(Number(body.durationMinutes)) ? Number(body.durationMinutes) : 0;
    const tagsVal = Array.isArray(body.tags)
      ? (body.tags as any[]).map((s) => String(s)).filter((s) => s.trim().length > 0)
      : typeof body.tags === 'string'
        ? String(body.tags).split(',').map((s) => s.trim()).filter((s) => s.length > 0)
        : [];

    const created = await prisma.course.create({
      data: {
        id: String(body.id || Date.now().toString()),
        title: body.title || '',
        description: body.description || '',
        image: body.image || null,
        level: body.level || 'beginner',
        price: priceVal,
        status: body.status || 'published',
        category: body.category || 'General',
        tags: tagsVal,
        lessonsCount: lessonsCountVal,
        durationMinutes: durationMinutesVal,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
      }
    });

    const mapped = {
      id: created.id,
      title: created.title,
      description: created.description,
      image: created.image || '',
      level: created.level,
      price: created.price,
      status: created.status,
      category: created.category,
      tags: (created.tags as any) || [],
      lessonsCount: created.lessonsCount,
      durationMinutes: created.durationMinutes,
      enrolledCount: created.enrolledCount,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };

    return NextResponse.json({ success: true, data: mapped }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ success: false, error: 'Failed to create course' }, { status: 500 });
  }
}


