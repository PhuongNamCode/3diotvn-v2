import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/courses/[id]/videos
 * Get all videos for a specific course
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const includeStats = searchParams.get('includeStats') === 'true';

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
        category: true
      }
    });

    if (!course) {
      return NextResponse.json({
        success: false,
        error: 'Course not found'
      }, { status: 404 });
    }

    // Get videos for the course
    const videos = await prisma.courseVideo.findMany({
      where: {
        courseId: id,
        status: status as any
      },
      orderBy: [
        { videoOrder: 'asc' },
        { createdAt: 'asc' }
      ],
      select: {
        id: true,
        youtubeVideoId: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        duration: true,
        videoOrder: true,
        isPreview: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Get video statistics if requested
    let videosWithStats = videos;
    if (includeStats) {
      videosWithStats = await Promise.all(
        videos.map(async (video) => {
          try {
            const [totalViews, uniqueUsers, avgDuration, completionRate] = await Promise.all([
              // Total views
              prisma.videoViewLog.count({
                where: { videoId: video.id }
              }),
              
              // Unique users
              prisma.videoViewLog.groupBy({
                by: ['userId'],
                where: { 
                  videoId: video.id,
                  userId: { not: null }
                }
              }).then(result => result.length),
              
              // Average view duration
              prisma.videoViewLog.aggregate({
                where: { videoId: video.id },
                _avg: { viewDuration: true }
              }),
              
              // Average completion rate
              prisma.videoViewLog.aggregate({
                where: { videoId: video.id },
                _avg: { completionPercentage: true }
              })
            ]);

            return {
              ...video,
              stats: {
                totalViews,
                uniqueUsers,
                avgDuration: avgDuration._avg.viewDuration || 0,
                completionRate: completionRate._avg.completionPercentage || 0
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
    }

    return NextResponse.json({
      success: true,
      data: {
        course: {
          id: course.id,
          title: course.title,
          status: course.status,
          category: course.category
        },
        videos: videosWithStats,
        totalVideos: videos.length,
        previewVideos: videos.filter(v => v.isPreview).length
      }
    });

  } catch (error) {
    console.error('Error fetching course videos:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch course videos'
    }, { status: 500 });
  }
}

/**
 * POST /api/courses/[id]/videos
 * Add a video to a course
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      youtubeVideoId,
      title,
      description,
      videoOrder,
      isPreview = false,
      status = 'active'
    } = body;

    // Validate required fields
    if (!youtubeVideoId || !title) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: youtubeVideoId, title'
      }, { status: 400 });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id }
    });

    if (!course) {
      return NextResponse.json({
        success: false,
        error: 'Course not found'
      }, { status: 404 });
    }

    // Check if video already exists in this course
    const existingVideo = await prisma.courseVideo.findFirst({
      where: {
        courseId: id,
        youtubeVideoId
      }
    });

    if (existingVideo) {
      return NextResponse.json({
        success: false,
        error: 'Video already exists in this course'
      }, { status: 409 });
    }

    // Create video record
    const video = await prisma.courseVideo.create({
      data: {
        courseId: id,
        youtubeVideoId,
        title,
        description,
        videoOrder: videoOrder || 0,
        isPreview,
        status
      }
    });

    return NextResponse.json({
      success: true,
      data: video,
      message: 'Video added to course successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding video to course:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add video to course'
    }, { status: 500 });
  }
}
