import { NextRequest, NextResponse } from 'next/server';
import { videoAccessService } from '@/lib/services/videoAccess';

/**
 * POST /api/videos/[id]/track
 * Track video viewing progress and analytics
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      accessToken,
      viewDuration,
      completionPercentage,
      timestamp
    } = body;

    // Validate required fields
    if (!accessToken || viewDuration === undefined || completionPercentage === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: accessToken, viewDuration, completionPercentage'
      }, { status: 400 });
    }

    // Validate data types and ranges
    if (typeof viewDuration !== 'number' || viewDuration < 0) {
      return NextResponse.json({
        success: false,
        error: 'viewDuration must be a non-negative number'
      }, { status: 400 });
    }

    if (typeof completionPercentage !== 'number' || 
        completionPercentage < 0 || 
        completionPercentage > 100) {
      return NextResponse.json({
        success: false,
        error: 'completionPercentage must be a number between 0 and 100'
      }, { status: 400 });
    }

    // Get client information
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Validate access token
    const validation = await videoAccessService.validateAccessToken(accessToken, ipAddress);
    
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: validation.error || 'Invalid access token'
      }, { status: 403 });
    }

    // Check if the video ID matches
    if (validation.accessTokenRecord?.videoId !== id) {
      return NextResponse.json({
        success: false,
        error: 'Access token does not match the requested video'
      }, { status: 403 });
    }

    // Record the video view
    await videoAccessService.recordVideoView(
      accessToken,
      viewDuration,
      completionPercentage,
      userAgent,
      ipAddress
    );

    return NextResponse.json({
      success: true,
      message: 'Video view recorded successfully',
      data: {
        viewDuration,
        completionPercentage,
        timestamp: timestamp || new Date().toISOString(),
        remainingViews: validation.accessTokenRecord ? 
          validation.accessTokenRecord.maxViews - validation.accessTokenRecord.currentViews - 1 : 0
      }
    });

  } catch (error) {
    console.error('Error tracking video view:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to track video view'
    }, { status: 500 });
  }
}

/**
 * GET /api/videos/[id]/track
 * Get video viewing statistics (for admin use)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get video statistics
    const stats = await videoAccessService.getVideoAccessStats(id);

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting video statistics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get video statistics'
    }, { status: 500 });
  }
}
