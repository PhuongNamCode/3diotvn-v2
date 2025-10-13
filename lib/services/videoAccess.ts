import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { youtubeConfig } from '../config/youtube';

const prisma = new PrismaClient();

/**
 * Video Access Token Service
 * Handles secure video access control with JWT tokens and view tracking
 */

export interface VideoAccessPayload {
  userId?: string;
  videoId: string;
  courseId: string;
  email?: string;
  ipAddress?: string;
  deviceFingerprint?: string;
}

export interface VideoAccessResult {
  accessToken: string;
  embedUrl: string;
  expiresAt: Date;
  maxViews: number;
  currentViews: number;
}

export class VideoAccessService {
  private jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || '3diot-jwt-secret-key-2025-production';
    if (this.jwtSecret === 'your-default-secret-key') {
      console.warn('Using default JWT secret. Please set JWT_SECRET in environment variables.');
    }
  }

  /**
   * Generate secure access token for video viewing
   */
  async generateAccessToken(payload: VideoAccessPayload): Promise<VideoAccessResult> {
    try {
      const tokenId = uuidv4();
      const expiresAt = new Date(Date.now() + this.parseExpiry(youtubeConfig.accessTokenExpiry));
      
      // Create JWT token
      const accessToken = jwt.sign(
        {
          tokenId,
          videoId: payload.videoId,
          courseId: payload.courseId,
          userId: payload.userId,
          email: payload.email,
          exp: Math.floor(expiresAt.getTime() / 1000)
        },
        this.jwtSecret,
        { algorithm: 'HS256' }
      );

      // Save access token to database
      await prisma.videoAccessToken.create({
        data: {
          id: tokenId,
          userId: payload.userId,
          videoId: payload.videoId,
          accessToken,
          expiresAt,
          maxViews: youtubeConfig.maxViewsPerToken,
          currentViews: 0,
          ipAddress: payload.ipAddress,
          deviceFingerprint: payload.deviceFingerprint
        }
      });

      // Get video metadata for embed URL
      const video = await prisma.courseVideo.findUnique({
        where: { id: payload.videoId },
        select: { youtubeVideoId: true }
      });

      if (!video) {
        throw new Error('Video not found');
      }

      // Generate secure embed URL
      const embedUrl = `https://www.youtube.com/embed/${video.youtubeVideoId}?modestbranding=1&rel=0&showinfo=0&token=${accessToken}`;

      return {
        accessToken,
        embedUrl,
        expiresAt,
        maxViews: youtubeConfig.maxViewsPerToken,
        currentViews: 0
      };
    } catch (error) {
      console.error('Error generating access token:', error);
      throw new Error('Failed to generate access token');
    }
  }

  /**
   * Validate access token and check permissions
   */
  async validateAccessToken(token: string, ipAddress?: string): Promise<{
    valid: boolean;
    payload?: any;
    accessTokenRecord?: any;
    error?: string;
  }> {
    try {
      // Verify JWT token
      const payload = jwt.verify(token, this.jwtSecret) as any;

      // Get access token record from database
      const accessTokenRecord = await prisma.videoAccessToken.findUnique({
        where: { accessToken: token },
        include: { video: true }
      });

      if (!accessTokenRecord) {
        return { valid: false, error: 'Access token not found' };
      }

      // Check if token is expired
      if (accessTokenRecord.expiresAt < new Date()) {
        return { valid: false, error: 'Access token expired' };
      }

      // Check view limits
      if (accessTokenRecord.currentViews >= accessTokenRecord.maxViews) {
        return { valid: false, error: 'Maximum views exceeded' };
      }

      // Optional: Check IP address (if provided)
      if (ipAddress && accessTokenRecord.ipAddress && accessTokenRecord.ipAddress !== ipAddress) {
        return { valid: false, error: 'IP address mismatch' };
      }

      return {
        valid: true,
        payload,
        accessTokenRecord
      };
    } catch (error) {
      console.error('Error validating access token:', error);
      return { valid: false, error: 'Invalid access token' };
    }
  }

  /**
   * Record video view and update statistics
   */
  async recordVideoView(
    token: string,
    viewDuration: number,
    completionPercentage: number,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    try {
      const validation = await this.validateAccessToken(token, ipAddress);
      
      if (!validation.valid || !validation.accessTokenRecord) {
        throw new Error('Invalid access token');
      }

      const accessTokenRecord = validation.accessTokenRecord;

      // Create view log
      await prisma.videoViewLog.create({
        data: {
          accessTokenId: accessTokenRecord.id,
          userId: accessTokenRecord.userId,
          videoId: accessTokenRecord.videoId,
          viewDuration,
          completionPercentage,
          ipAddress,
          userAgent
        }
      });

      // Update current views count
      await prisma.videoAccessToken.update({
        where: { id: accessTokenRecord.id },
        data: {
          currentViews: accessTokenRecord.currentViews + 1
        }
      });
    } catch (error) {
      console.error('Error recording video view:', error);
      throw new Error('Failed to record video view');
    }
  }

  /**
   * Get video access statistics
   */
  async getVideoAccessStats(videoId: string) {
    try {
      const [totalViews, uniqueUsers, avgDuration, completionRate] = await Promise.all([
        // Total views
        prisma.videoViewLog.count({
          where: { videoId }
        }),
        
        // Unique users
        prisma.videoViewLog.groupBy({
          by: ['userId'],
          where: { 
            videoId,
            userId: { not: null }
          }
        }).then(result => result.length),
        
        // Average view duration
        prisma.videoViewLog.aggregate({
          where: { videoId },
          _avg: { viewDuration: true }
        }),
        
        // Average completion rate
        prisma.videoViewLog.aggregate({
          where: { videoId },
          _avg: { completionPercentage: true }
        })
      ]);

      return {
        totalViews,
        uniqueUsers,
        avgDuration: avgDuration._avg.viewDuration || 0,
        completionRate: completionRate._avg.completionPercentage || 0
      };
    } catch (error) {
      console.error('Error getting video access stats:', error);
      throw new Error('Failed to get video access statistics');
    }
  }

  /**
   * Clean up expired access tokens
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await prisma.videoAccessToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });

      console.log(`Cleaned up ${result.count} expired access tokens`);
      return result.count;
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      return 0;
    }
  }

  /**
   * Parse expiry string to milliseconds
   */
  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([hms])$/);
    if (!match) return 24 * 60 * 60 * 1000; // Default 24 hours

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'h': return value * 60 * 60 * 1000;
      case 'm': return value * 60 * 1000;
      case 's': return value * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  }

  /**
   * Generate device fingerprint
   */
  static generateDeviceFingerprint(userAgent: string, ipAddress?: string): string {
    const crypto = require('crypto');
    const fingerprint = `${userAgent}-${ipAddress || 'unknown'}`;
    return crypto.createHash('sha256').update(fingerprint).digest('hex').substring(0, 16);
  }
}

// Export singleton instance
export const videoAccessService = new VideoAccessService();
export default videoAccessService;
