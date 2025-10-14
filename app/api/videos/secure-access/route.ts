import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { youtubeAccessManager } from '@/lib/services/youtubeAccessManager';
import { youtubeOAuthService } from '@/lib/auth/youtube-oauth';
import jwt from 'jsonwebtoken';

/**
 * POST /api/videos/secure-access
 * Verify enrollment and generate secure access token for video
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, courseId, email, userId } = body;

    // Validate required fields
    if (!videoId || !courseId || !email) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: videoId, courseId, email'
      }, { status: 400 });
    }

    // 1. Verify enrollment
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        courseId,
        email,
        status: { in: ['confirmed', 'enrolled'] },
        paymentStatus: 'paid'
      },
      include: {
        course: true
      }
    });

    if (!enrollment) {
      return NextResponse.json({
        success: false,
        error: 'You are not enrolled in this course'
      }, { status: 403 });
    }

    // 2. Check if video exists in curriculum JSON (new system only)
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { curriculum: true }
    });

    let video = null;
    if (course?.curriculum && Array.isArray(course.curriculum)) {
      // Look for the video in curriculum array
      const lesson = course.curriculum.find((item: any) => {
        if (item.type === 'youtube' && item.url) {
          // Extract video ID from URL
          const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
          const match = item.url.match(regex);
          const lessonVideoId = match ? match[1] : null;
          return lessonVideoId === videoId;
        }
        return false;
      });

      if (lesson) {
        // Create a virtual video object for curriculum-based videos
        const lessonData = lesson as any;
        video = {
          id: videoId,
          courseId: courseId,
          youtubeVideoId: videoId,
          title: lessonData.title || 'Video Lesson',
          description: lessonData.description || '',
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          duration: lessonData.duration || null,
          videoOrder: 0,
          isPreview: false,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
    }

    if (!video) {
      return NextResponse.json({
        success: false,
        error: 'Video not found or not available'
      }, { status: 404 });
    }

    // 3. For unlisted videos, no OAuth needed - just verify enrollment
    console.log('Using unlisted video access - enrollment verified');

    // 4. For unlisted videos, no additional access checks needed
    console.log('Unlisted video access granted');

    // 5. Generate secure access token
    const accessToken = jwt.sign(
      {
        videoId,
        courseId,
        email,
        userId,
        enrollmentId: enrollment.id,
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { algorithm: 'HS256' }
    );

    // 6. Log access attempt
    await prisma.videoAccessLog.create({
      data: {
        videoId,
        courseId,
        email,
        userId,
        action: 'access_granted',
        timestamp: new Date(),
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        redirectUrl: `https://youtube.com/watch?v=${video.youtubeVideoId}`,
        video: {
          id: video.id,
          title: video.title,
          youtubeVideoId: video.youtubeVideoId,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration
        },
        enrollment: {
          id: enrollment.id,
          email: enrollment.email,
          fullName: enrollment.fullName,
          courseTitle: enrollment.course.title
        }
      }
    });

  } catch (error) {
    console.error('Error in secure video access:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to verify video access'
    }, { status: 500 });
  }
}

/**
 * Generate YouTube OAuth authorization URL
 */
async function generateYouTubeAuthUrl(courseId: string, videoId: string, email: string): Promise<string> {
  try {
    const state = JSON.stringify({
      courseId,
      videoId,
      email,
      timestamp: Date.now()
    });

    // Generate OAuth URL manually
    const params = new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID || '',
      redirect_uri: process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/api/auth/youtube/callback',
      scope: process.env.GOOGLE_SCOPES || 'https://www.googleapis.com/auth/youtube.readonly',
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      state: state
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  } catch (error) {
    console.error('Error generating YouTube auth URL:', error);
    return '';
  }
}

/**
 * Check if email is in video access whitelist
 */
async function checkVideoAccessWhitelist(videoId: string, email: string): Promise<boolean> {
  try {
    // Check if email has been granted access to this video
    const accessRecord = await prisma.videoAccessLog.findFirst({
      where: {
        videoId,
        email,
        action: 'access_granted'
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    return !!accessRecord;
  } catch (error) {
    console.error('Error checking video access whitelist:', error);
    return false;
  }
}

/**
 * GET /api/videos/secure-access
 * Validate existing access token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Access token required'
      }, { status: 400 });
    }

    // Verify JWT token
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

    // Check if token is still valid (not expired and enrollment still active)
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        id: payload.enrollmentId,
        email: payload.email,
        status: { in: ['confirmed', 'enrolled'] },
        paymentStatus: 'paid'
      }
    });

    if (!enrollment) {
      return NextResponse.json({
        success: false,
        error: 'Access token invalid or enrollment expired'
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        payload: {
          videoId: payload.videoId,
          courseId: payload.courseId,
          email: payload.email,
          enrollmentId: payload.enrollmentId
        }
      }
    });

  } catch (error) {
    console.error('Error validating access token:', error);
    return NextResponse.json({
      success: false,
      error: 'Invalid access token'
    }, { status: 403 });
  }
}
