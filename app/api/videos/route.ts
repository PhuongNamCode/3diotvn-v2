import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { YouTubeService } from '@/lib/services/youtube';

const prisma = new PrismaClient();

// Initialize YouTube service safely
let youtubeService: YouTubeService;
try {
  youtubeService = new YouTubeService();
} catch (error) {
  console.warn('YouTube service initialization failed:', error);
  youtubeService = null as any;
}

/**
 * GET /api/videos
 * Get all videos with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const status = searchParams.get('status') || 'active';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (status) where.status = status;

    // Get videos with pagination
    const [videos, total] = await Promise.all([
      prisma.courseVideo.findMany({
        where,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              category: true
            }
          }
        },
        orderBy: [
          { videoOrder: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.courseVideo.count({ where })
    ]);

    // Get video statistics
    const videoStats = await Promise.all(
      videos.map(async (video) => {
        try {
          // Get view statistics
          const [totalViews, uniqueUsers] = await Promise.all([
            prisma.videoViewLog.count({
              where: { videoId: video.id }
            }),
            prisma.videoViewLog.groupBy({
              by: ['userId'],
              where: { 
                videoId: video.id,
                userId: { not: null }
              }
            }).then(result => result.length)
          ]);

          return {
            ...video,
            stats: {
              totalViews,
              uniqueUsers,
              avgDuration: 0, // Will be calculated separately if needed
              completionRate: 0 // Will be calculated separately if needed
            }
          };
        } catch (error) {
          console.error(`Error getting stats for video ${video.id}:`, error);
          return {
            ...video,
            stats: {
              totalViews: 0,
              uniqueUsers: 0,
              avgDuration: 0,
              completionRate: 0
            }
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        videos: videoStats,
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

/**
 * POST /api/videos
 * Create a new video (manual entry with YouTube video ID)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      courseId,
      youtubeVideoId,
      title,
      description,
      videoOrder = 0,
      isPreview = false,
      status = 'active'
    } = body;

    // Validate required fields
    if (!courseId || !youtubeVideoId || !title) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: courseId, youtubeVideoId, title'
      }, { status: 400 });
    }

    // Validate YouTube video ID format
    if (!YouTubeService.isValidVideoId(youtubeVideoId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid YouTube video ID format'
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

    // YouTube validation disabled for admin dashboard
    console.log('✅ Creating video without YouTube validation:', youtubeVideoId);

    // Get video metadata from YouTube (if service available)
    let metadata = null;
    if (youtubeService) {
      try {
        metadata = await youtubeService.getVideoMetadata(youtubeVideoId);
      } catch (error) {
        console.warn('Failed to fetch YouTube metadata:', error);
      }
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

    // Create video record
    const video = await prisma.courseVideo.create({
      data: {
        courseId,
        youtubeVideoId,
        title: title || metadata?.title || `Video ${youtubeVideoId}`,
        description: description || metadata?.description || null,
        thumbnailUrl: metadata?.thumbnailUrl || null,
        duration: metadata?.duration || 0,
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

    return NextResponse.json({
      success: true,
      data: video,
      message: 'Video created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create video'
    }, { status: 500 });
  }
}
