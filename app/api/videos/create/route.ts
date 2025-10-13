import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { courseId, youtubeVideoId, title, description, videoOrder, isPreview, status } = await request.json();

    console.log('Creating video with data:', { courseId, youtubeVideoId, title });

    // Validate required fields
    if (!courseId || !youtubeVideoId || !title) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: courseId, youtubeVideoId, title'
      }, { status: 400 });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json({
        success: false,
        error: 'Course not found'
      }, { status: 404 });
    }

    // Check if video already exists
    const existingVideo = await prisma.courseVideo.findUnique({
      where: { youtubeVideoId }
    });

    if (existingVideo) {
      return NextResponse.json({
        success: false,
        error: 'Video already exists in the system'
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

    console.log('Video created successfully:', video.id);

    return NextResponse.json({
      success: true,
      data: video,
      message: 'Video created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
