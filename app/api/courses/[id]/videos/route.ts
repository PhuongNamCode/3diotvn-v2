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
        category: true,
        curriculum: true
      }
    });

    if (!course) {
      return NextResponse.json({
        success: false,
        error: 'Course not found'
      }, { status: 404 });
    }

    // Get videos from curriculum JSON (new system)
    interface VideoData {
      id: string | null;
      youtubeVideoId: string | null;
      title: string;
      description: string;
      thumbnailUrl: string | null;
      duration: string | null;
      videoOrder: number;
      isPreview: boolean;
      status: string;
      createdAt: Date;
      updatedAt: Date;
    }

    let videos: VideoData[] = [];
    if (course.curriculum && Array.isArray(course.curriculum)) {
      videos = course.curriculum
        .filter((lesson: any) => lesson.type === 'youtube')
        .map((lesson: any, index: number): VideoData => {
          // Extract video ID from URL
          const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
          const match = lesson.url.match(regex);
          const youtubeVideoId = match ? match[1] : null;
          
          return {
            id: youtubeVideoId,
            youtubeVideoId: youtubeVideoId,
            title: lesson.title || 'Video Lesson',
            description: lesson.description || '',
            thumbnailUrl: youtubeVideoId ? `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg` : null,
            duration: lesson.duration || null,
            videoOrder: index,
            isPreview: false,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
          };
        });
    }

    // Get video statistics if requested (using VideoAccessLog instead of VideoViewLog)
    let videosWithStats = videos;
    if (includeStats) {
      videosWithStats = await Promise.all(
        videos.map(async (video) => {
          try {
            // Skip stats if video.id is null
            if (!video.id) {
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

            const [totalViews, uniqueUsers] = await Promise.all([
              // Total views from VideoAccessLog
              prisma.videoAccessLog.count({
                where: { videoId: video.id }
              }),
              
              // Unique users from VideoAccessLog
              prisma.videoAccessLog.groupBy({
                by: ['email'],
                where: { 
                  videoId: video.id
                }
              }).then(result => result.length)
            ]);

            return {
              ...video,
              stats: {
                totalViews,
                uniqueUsers,
                avgDuration: 0, // Not available in new system
                completionRate: 0 // Not available in new system
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
 * Add a video to course curriculum (new system)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      duration,
      type = 'youtube',
      url
    } = body;

    // Validate required fields
    if (!title || !url) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, url'
      }, { status: 400 });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id },
      select: { curriculum: true }
    });

    if (!course) {
      return NextResponse.json({
        success: false,
        error: 'Course not found'
      }, { status: 404 });
    }

    // Get current curriculum
    const currentCurriculum = course.curriculum && Array.isArray(course.curriculum) 
      ? course.curriculum as any[]
      : [];

    // Check if video already exists in curriculum
    const existingLesson = currentCurriculum.find((lesson: any) => 
      lesson.url === url
    );

    if (existingLesson) {
      return NextResponse.json({
        success: false,
        error: 'Video already exists in this course'
      }, { status: 409 });
    }

    // Add new lesson to curriculum
    const newLesson = {
      title,
      duration,
      type,
      url
    };

    const updatedCurriculum = [...currentCurriculum, newLesson];

    // Update course with new curriculum
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        curriculum: updatedCurriculum
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        lesson: newLesson,
        curriculum: updatedCurriculum
      },
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
