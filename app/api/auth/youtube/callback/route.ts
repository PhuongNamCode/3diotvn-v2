import { NextRequest, NextResponse } from 'next/server';
import { youtubeOAuthService } from '@/lib/auth/youtube-oauth';

/**
 * GET /api/auth/youtube/callback
 * Handle YouTube OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth error
    if (error) {
      console.error('YouTube OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/auth/youtube/error?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    // Validate required parameters
    if (!code) {
      return NextResponse.redirect(
        new URL('/auth/youtube/error?error=missing_code', request.url)
      );
    }

    if (!state) {
      return NextResponse.redirect(
        new URL('/auth/youtube/error?error=missing_state', request.url)
      );
    }

    // Parse state parameter
    let stateData;
    try {
      stateData = JSON.parse(state);
    } catch (parseError) {
      console.error('Error parsing state:', parseError);
      return NextResponse.redirect(
        new URL('/auth/youtube/error?error=invalid_state', request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await youtubeOAuthService.getTokens(code);

    // Get user info
    const userInfo = await youtubeOAuthService.getUserInfo(tokens.accessToken);

    // Save user credentials
    await youtubeOAuthService.saveUserCredentials(
      userInfo.email,
      tokens.accessToken,
      tokens.refreshToken,
      tokens.expiryDate
    );

    // Redirect based on context
    let redirectUrl = '/';

    if (stateData.courseId) {
      if (stateData.videoId) {
        // Redirect to specific video in course
        redirectUrl = `/course/${stateData.courseId}/learn?video=${stateData.videoId}`;
      } else {
        // Redirect to course learning page
        redirectUrl = `/course/${stateData.courseId}/learn`;
      }
    } else {
      // Redirect to courses page
      redirectUrl = '/my-courses';
    }

    // Add success parameter
    const redirectWithSuccess = new URL(redirectUrl, request.url);
    redirectWithSuccess.searchParams.set('youtube_auth', 'success');

    return NextResponse.redirect(redirectWithSuccess);

  } catch (error) {
    console.error('Error in YouTube OAuth callback:', error);
    return NextResponse.redirect(
      new URL(`/auth/youtube/error?error=${encodeURIComponent('callback_failed')}`, request.url)
    );
  }
}
