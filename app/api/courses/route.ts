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

    // Use raw query to debug discount fields
    const rawItems = await prisma.$queryRaw`
      SELECT 
        id, title, description, image, level, price, status, category, tags,
        "lessonsCount", "durationMinutes", "enrolledCount", "publishedAt",
        "discountPercentage", "discountAmount", "discountStartDate", "discountEndDate", "isDiscountActive",
        overview, curriculum, "instructorName", "instructorBio", "instructorImage", "instructorEmail",
        requirements, "whatYouWillLearn", "createdAt", "updatedAt"
      FROM "Course"
      ORDER BY "createdAt" DESC
      LIMIT ${limit} OFFSET ${skip}
    ` as any[];
    
    const total = await prisma.course.count({ where });
    const items = rawItems;

    const data = items.map((c) => {
      // Coerce potentially stringified JSON fields into arrays for backward compatibility
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

      return ({
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
      // Discount fields
      discountPercentage: c.discountPercentage || 0,
      discountAmount: c.discountAmount || 0,
      discountStartDate: c.discountStartDate || null,
      discountEndDate: c.discountEndDate || null,
      isDiscountActive: c.isDiscountActive || false,
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
    })});

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
    const discountPercentageVal = Number.isFinite(Number(body.discountPercentage)) ? Number(body.discountPercentage) : 0;
    const discountAmountVal = Number.isFinite(Number(body.discountAmount)) ? Number(body.discountAmount) : 0;
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
        enrolledCount: 0, // Mặc định 0 đăng ký thực tế
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
        // Discount fields
        discountPercentage: discountPercentageVal,
        discountAmount: discountAmountVal,
        discountStartDate: body.discountStartDate ? new Date(body.discountStartDate) : null,
        discountEndDate: body.discountEndDate ? new Date(body.discountEndDate) : null,
        isDiscountActive: Boolean(body.isDiscountActive),
        // Enhanced fields
        overview: body.overview || null,
        curriculum: body.curriculum || null,
        instructorName: body.instructorName || null,
        instructorBio: body.instructorBio || null,
        instructorImage: body.instructorImage || null,
        instructorEmail: body.instructorEmail || null,
        requirements: body.requirements || null,
        whatYouWillLearn: body.whatYouWillLearn || null,
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
      // Discount fields
      discountPercentage: created.discountPercentage || 0,
      discountAmount: created.discountAmount || 0,
      discountStartDate: created.discountStartDate || null,
      discountEndDate: created.discountEndDate || null,
      isDiscountActive: created.isDiscountActive || false,
      // Enhanced fields
      overview: created.overview || '',
      curriculum: (created.curriculum as any) || [],
      instructorName: created.instructorName || '',
      instructorBio: created.instructorBio || '',
      instructorImage: created.instructorImage || '',
      instructorEmail: created.instructorEmail || '',
      requirements: created.requirements || '',
      whatYouWillLearn: (created.whatYouWillLearn as any) || [],
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };

    return NextResponse.json({ success: true, data: mapped }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ success: false, error: 'Failed to create course' }, { status: 500 });
  }
}


