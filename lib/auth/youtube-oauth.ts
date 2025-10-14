import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';

export interface YouTubeOAuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
  refreshToken: string;
}

export class YouTubeOAuthService {
  private oauth2Client: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI
    );
  }

  /**
   * Generate OAuth authorization URL
   */
  generateAuthUrl(state?: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: state || 'default',
      prompt: 'consent' // Force consent screen to get refresh token
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiryDate: number;
  }> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      this.oauth2Client.setCredentials(tokens);

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date
      };
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  /**
   * Get user info from Google
   */
  async getUserInfo(accessToken: string): Promise<YouTubeOAuthUser> {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const userInfo = await oauth2.userinfo.get();

      const user = userInfo.data;

      return {
        id: user.id!,
        email: user.email!,
        name: user.name!,
        picture: user.picture || undefined,
        accessToken,
        refreshToken: '' // Will be set separately
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      throw new Error('Failed to get user information');
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiryDate: number;
  }> {
    try {
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
      
      const { credentials } = await this.oauth2Client.refreshAccessToken();

      return {
        accessToken: credentials.access_token,
        expiryDate: credentials.expiry_date
      };
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Save or update user OAuth credentials in database
   */
  async saveUserCredentials(
    email: string,
    accessToken: string,
    refreshToken: string,
    expiryDate: number
  ): Promise<void> {
    try {
      await prisma.userYouTubeCredentials.upsert({
        where: { email },
        update: {
          accessToken,
          refreshToken,
          expiryDate: new Date(expiryDate),
          updatedAt: new Date()
        },
        create: {
          email,
          accessToken,
          refreshToken,
          expiryDate: new Date(expiryDate)
        }
      });
    } catch (error) {
      console.error('Error saving user credentials:', error);
      throw new Error('Failed to save user credentials');
    }
  }

  /**
   * Get user credentials from database
   */
  async getUserCredentials(email: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiryDate: Date;
  } | null> {
    try {
      const credentials = await prisma.userYouTubeCredentials.findUnique({
        where: { email }
      });

      if (!credentials) {
        return null;
      }

      // Check if token is expired
      if (credentials.expiryDate <= new Date()) {
        // Try to refresh token
        try {
          const newTokens = await this.refreshAccessToken(credentials.refreshToken);
          
          // Update database with new tokens
          await prisma.userYouTubeCredentials.update({
            where: { email },
            data: {
              accessToken: newTokens.accessToken,
              expiryDate: new Date(newTokens.expiryDate),
              updatedAt: new Date()
            }
          });

          return {
            accessToken: newTokens.accessToken,
            refreshToken: credentials.refreshToken,
            expiryDate: new Date(newTokens.expiryDate)
          };
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          // Remove invalid credentials
          await prisma.userYouTubeCredentials.delete({
            where: { email }
          });
          return null;
        }
      }

      return {
        accessToken: credentials.accessToken,
        refreshToken: credentials.refreshToken,
        expiryDate: credentials.expiryDate
      };
    } catch (error) {
      console.error('Error getting user credentials:', error);
      return null;
    }
  }

  /**
   * Remove user credentials
   */
  async removeUserCredentials(email: string): Promise<void> {
    try {
      await prisma.userYouTubeCredentials.delete({
        where: { email }
      });
    } catch (error) {
      console.error('Error removing user credentials:', error);
      throw new Error('Failed to remove user credentials');
    }
  }
}

export const youtubeOAuthService = new YouTubeOAuthService();
