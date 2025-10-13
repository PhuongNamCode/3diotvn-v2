import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { courseId, youtubeVideoId, title, description, videoOrder, isPreview, status } = await request.json();

    console.log('🎬 Adding video via /api/videos/add:', { courseId, youtubeVideoId, title });

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

    console.log('✅ Video created successfully:', video.id);

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
