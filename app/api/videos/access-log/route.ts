import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/videos/access-log
 * Log video access attempts for analytics and debugging
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      videoId, 
      courseId, 
      userId, 
      email, 
      accessType, // 'youtube', 'online-meeting'
      success = true,
      error = null
    } = body;

    // Validate required fields
    if (!videoId || !courseId || !email) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: videoId, courseId, email'
      }, { status: 400 });
    }

    // Log to database (optional - you can also just log to console)
    console.log('Video Access Log:', {
      videoId,
      courseId,
      userId,
      email,
      accessType,
      success,
      error,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown'
    });

    // You can also store this in database if needed
    // await prisma.videoAccessLog.create({
    //   data: {
    //     videoId,
    //     courseId,
    //     userId,
    //     email,
    //     accessType,
    //     success,
    //     error,
    //     userAgent: request.headers.get('user-agent'),
    //     ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: 'Access logged successfully'
    });

  } catch (error) {
    console.error('Error logging video access:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to log video access'
    }, { status: 500 });
  }
}
