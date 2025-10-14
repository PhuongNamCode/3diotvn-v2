import { NextRequest, NextResponse } from 'next/server';
import { youtubeOAuthService } from '@/lib/auth/youtube-oauth';

/**
 * POST /api/auth/youtube/authorize
 * Generate YouTube OAuth authorization URL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { state } = body;

    if (!state) {
      return NextResponse.json({
        success: false,
        error: 'State parameter is required'
      }, { status: 400 });
    }

    // Generate authorization URL
    const authUrl = youtubeOAuthService.generateAuthUrl(state);

    return NextResponse.json({
      success: true,
      data: {
        authUrl
      }
    });

  } catch (error) {
    console.error('Error generating YouTube auth URL:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate authorization URL'
    }, { status: 500 });
  }
}
