import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Demo API called with:', body);

    const { courseId, youtubeVideoId, title, description } = body;

    // Simple validation
    if (!courseId || !youtubeVideoId || !title) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Check course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json({
        success: false,
        error: 'Course not found'
      }, { status: 404 });
    }

    // Create video directly
    const video = await prisma.courseVideo.create({
      data: {
        courseId,
        youtubeVideoId,
        title,
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
      message: 'Video created successfully via demo API'
    }, { status: 201 });

  } catch (error) {
    console.error('Demo API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
