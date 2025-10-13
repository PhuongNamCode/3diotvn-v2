import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { courseId, youtubeVideoId, title, description } = await request.json();

    if (!courseId || !youtubeVideoId || !title) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
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

    // Create video record directly (no YouTube validation)
    const video = await prisma.courseVideo.create({
      data: {
        courseId,
        youtubeVideoId,
        title: title || `Video ${youtubeVideoId}`,
        description: description || null,
        thumbnailUrl: null,
        duration: 0,
        videoOrder: 0,
        isPreview: true,
        status: 'active'
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
