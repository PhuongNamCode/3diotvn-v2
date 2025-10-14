import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { youtubeOAuthService } from '@/lib/auth/youtube-oauth';

/**
 * POST /api/enrollments/youtube-auth
 * Trigger YouTube OAuth for course enrollment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, email, fullName } = body;

    if (!courseId || !email) {
      return NextResponse.json({
        success: false,
        error: 'Course ID and email are required'
      }, { status: 400 });
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        courseId,
        email,
        status: { in: ['confirmed', 'enrolled'] },
        paymentStatus: 'paid'
      }
    });

    if (!enrollment) {
      return NextResponse.json({
        success: false,
        error: 'You are not enrolled in this course'
      }, { status: 403 });
    }

    // Check if course has YouTube videos
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { 
        id: true, 
        title: true,
        curriculum: true
      }
    });

    if (!course) {
      return NextResponse.json({
        success: false,
        error: 'Course not found'
      }, { status: 404 });
    }

    // Parse curriculum to check for YouTube videos
    let hasYouTubeVideos = false;
    try {
      if (course.curriculum && Array.isArray(course.curriculum)) {
        hasYouTubeVideos = course.curriculum.some((lesson: any) => 
          lesson.type === 'youtube' && lesson.url
        );
      }
    } catch (error) {
      console.error('Error parsing curriculum:', error);
    }

    if (!hasYouTubeVideos) {
      return NextResponse.json({
        success: false,
        error: 'This course does not contain YouTube videos'
      }, { status: 400 });
    }

    // Check if user already has YouTube OAuth
    const existingCredentials = await youtubeOAuthService.getUserCredentials(email);
    if (existingCredentials) {
      return NextResponse.json({
        success: true,
        message: 'YouTube authentication already completed',
        hasAuth: true
      });
    }

    // Generate YouTube OAuth URL
    const state = JSON.stringify({
      courseId,
      email,
      fullName,
      timestamp: Date.now(),
      purpose: 'enrollment'
    });

    const authUrl = youtubeOAuthService.generateAuthUrl(state);

    return NextResponse.json({
      success: true,
      data: {
        authUrl,
        course: {
          id: course.id,
          title: course.title
        }
      },
      hasAuth: false
    });

  } catch (error) {
    console.error('Error in YouTube enrollment auth:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to initiate YouTube authentication'
    }, { status: 500 });
  }
}
