import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Lấy danh sách video cho admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const status = searchParams.get('status') || 'active';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (status) where.status = status;

    const videos = await prisma.courseVideo.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true
          }
        }
      }
    });

    const total = await prisma.courseVideo.count({ where });

    return NextResponse.json({
      success: true,
      data: {
        videos,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch videos'
    }, { status: 500 });
  }
}

// POST - Thêm video mới (KHÔNG VALIDATION YOUTUBE)
export async function POST(request: NextRequest) {
  try {
    const { courseId, youtubeVideoId, title, description, videoOrder, isPreview, status } = await request.json();

    console.log('Admin adding video:', { courseId, youtubeVideoId, title });

    // Validate required fields
    if (!courseId || !youtubeVideoId || !title) {
      return NextResponse.json({
        success: false,
        error: 'Thiếu thông tin bắt buộc: courseId, youtubeVideoId, title'
      }, { status: 400 });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json({
        success: false,
        error: 'Không tìm thấy khóa học'
      }, { status: 404 });
    }

    // Check if video already exists
    const existingVideo = await prisma.courseVideo.findUnique({
      where: { youtubeVideoId }
    });

    if (existingVideo) {
      return NextResponse.json({
        success: false,
        error: 'Video đã tồn tại trong hệ thống'
      }, { status: 409 });
    }

    // Create video record (NO YouTube validation)
    const video = await prisma.courseVideo.create({
      data: {
        courseId,
        youtubeVideoId,
        title,
        description: description || null,
        thumbnailUrl: null,
        duration: 0,
        videoOrder: videoOrder || 0,
        isPreview: isPreview || false,
        status: status || 'active'
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true
          }
        }
      }
    });

    console.log('✅ Video created successfully via admin API:', video.id);

    return NextResponse.json({
      success: true,
      data: video,
      message: 'Video đã được thêm thành công!'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định'
    }, { status: 500 });
  }
}
