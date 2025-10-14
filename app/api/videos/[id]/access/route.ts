import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { videoAccessService, VideoAccessService } from '@/lib/services/videoAccess';

const prisma = new PrismaClient();

/**
 * POST /api/videos/[id]/access
 * Generate secure access token for video viewing
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, email, courseId } = body;

    // Get client IP address
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Generate device fingerprint
    const deviceFingerprint = VideoAccessService.generateDeviceFingerprint(userAgent, ipAddress);

    // Get video details
    const video = await prisma.courseVideo.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      }
    });

    if (!video) {
      return NextResponse.json({
        success: false,
        error: 'Video not found'
      }, { status: 404 });
    }

    // Check if video is active
    if (video.status !== 'active') {
      return NextResponse.json({
        success: false,
        error: 'Video is not available'
      }, { status: 403 });
    }

    // Check if course is active
    if (video.course.status !== 'active') {
      return NextResponse.json({
        success: false,
        error: 'Course is not available'
      }, { status: 403 });
    }

    // If user is provided, check course enrollment
    if (userId) {
      const enrollment = await prisma.courseEnrollment.findFirst({
        where: {
          courseId: video.courseId,
          email: email || undefined,
          status: { in: ['confirmed', 'enrolled'] },
          paymentStatus: 'paid'
        }
      });

      if (!enrollment) {
        return NextResponse.json({
          success: false,
          error: 'You must be enrolled in this course to access videos'
        }, { status: 403 });
      }
    }

    // Generate access token
    const accessResult = await videoAccessService.generateAccessToken({
      userId,
      videoId: id,
      courseId: video.courseId,
      email,
      ipAddress,
      deviceFingerprint
    });

    return NextResponse.json({
      success: true,
      data: {
        accessToken: accessResult.accessToken,
        embedUrl: accessResult.embedUrl,
        expiresAt: accessResult.expiresAt,
        maxViews: accessResult.maxViews,
        currentViews: accessResult.currentViews,
        video: {
          id: video.id,
          title: video.title,
          description: video.description,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
          isPreview: video.isPreview
        }
      }
    });

  } catch (error) {
    console.error('Error generating video access:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate video access'
    }, { status: 500 });
  }
}
