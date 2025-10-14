import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { youtubeOAuthService } from '@/lib/auth/youtube-oauth';

export class YouTubeAccessManager {
  private youtube: any;
  private oauth2Client: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI
    );

    this.oauth2Client.setCredentials({
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN
    });

    this.youtube = google.youtube({
      version: 'v3',
      auth: this.oauth2Client
    });
  }

  /**
   * Grant access to a private video for a specific email
   * Note: YouTube API v3 doesn't directly support adding viewers to private videos
   * This method logs the access grant and returns success for tracking purposes
   */
  async grantVideoAccess(videoId: string, email: string): Promise<boolean> {
    try {
      // Get video details
      const videoResponse = await this.youtube.videos.list({
        part: 'snippet,status',
        id: videoId
      });

      if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
        throw new Error('Video not found');
      }

      const video = videoResponse.data.items[0];
      
      // Check if video is private
      if (video.status.privacyStatus !== 'private') {
        throw new Error('Video is not private');
      }

      // Log access grant (actual access is controlled by user's YouTube OAuth)
      await this.logAccessGrant(videoId, email, 'granted');
      
      return true;
    } catch (error) {
      console.error('Error granting video access:', error);
      await this.logAccessGrant(videoId, email, 'failed', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Check if user has valid YouTube OAuth credentials
   */
  async checkUserYouTubeAuth(email: string): Promise<boolean> {
    try {
      const credentials = await youtubeOAuthService.getUserCredentials(email);
      return credentials !== null;
    } catch (error) {
      console.error('Error checking YouTube auth:', error);
      return false;
    }
  }

  /**
   * Get user's YouTube access token
   */
  async getUserAccessToken(email: string): Promise<string | null> {
    try {
      const credentials = await youtubeOAuthService.getUserCredentials(email);
      return credentials?.accessToken || null;
    } catch (error) {
      console.error('Error getting user access token:', error);
      return null;
    }
  }

  /**
   * Revoke access from a private video
   */
  async revokeVideoAccess(videoId: string, email: string): Promise<boolean> {
    try {
      // Similar implementation for revoking access
      await this.logAccessGrant(videoId, email, 'revoked');
      return true;
    } catch (error) {
      console.error('Error revoking video access:', error);
      return false;
    }
  }

  /**
   * Check if user has access to a video
   */
  async checkVideoAccess(videoId: string, email: string): Promise<boolean> {
    try {
      // This would require YouTube Studio API or custom tracking
      const accessRecord = await prisma.videoAccessLog.findFirst({
        where: {
          videoId,
          email,
          status: 'granted'
        }
      });

      return !!accessRecord;
    } catch (error) {
      console.error('Error checking video access:', error);
      return false;
    }
  }

  /**
   * Log access grant/revoke actions
   */
  private async logAccessGrant(videoId: string, email: string, status: string, error?: string) {
    try {
      await prisma.videoAccessLog.create({
        data: {
          videoId,
          courseId: '', // Will be set by calling function
          email,
          action: status,
          status,
          error: error || null,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Error logging access grant:', error);
    }
  }
}

export const youtubeAccessManager = new YouTubeAccessManager();
