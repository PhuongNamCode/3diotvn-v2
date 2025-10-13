'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { YouTubeService } from '@/lib/services/youtube';

interface SecureVideoPlayerProps {
  videoId: string;
  courseId: string;
  userId?: string;
  email?: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: number;
  isPreview?: boolean;
  className?: string;
}

interface VideoAccessData {
  accessToken: string;
  embedUrl: string;
  expiresAt: string;
  maxViews: number;
  currentViews: number;
}

interface ViewTrackingData {
  viewDuration: number;
  completionPercentage: number;
  isPlaying: boolean;
  currentTime: number;
  lastTrackTime: number;
}

const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({
  videoId,
  courseId,
  userId,
  email,
  title,
  description,
  thumbnailUrl,
  duration,
  isPreview = false,
  className = ''
}) => {
  const [accessData, setAccessData] = useState<VideoAccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // View tracking state
  const [trackingData, setTrackingData] = useState<ViewTrackingData>({
    viewDuration: 0,
    completionPercentage: 0,
    isPlaying: false,
    currentTime: 0,
    lastTrackTime: 0
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTrackTimeRef = useRef<number>(0);

  /**
   * Generate access token for video viewing
   */
  const generateAccessToken = useCallback(async () => {
    try {
      const response = await fetch(`/api/videos/${videoId}/access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          email,
          courseId
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate access token');
      }

      setAccessData(result.data);
      setIsAuthorized(true);
      setError(null);
    } catch (err) {
      console.error('Error generating access token:', err);
      setError(err instanceof Error ? err.message : 'Failed to access video');
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  }, [videoId, courseId, userId, email]);

  /**
   * Track video viewing progress
   */
  const trackVideoView = useCallback(async (viewDuration: number, completionPercentage: number) => {
    if (!accessData?.accessToken) return;

    try {
      await fetch(`/api/videos/${videoId}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: accessData.accessToken,
          viewDuration,
          completionPercentage,
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error('Error tracking video view:', err);
    }
  }, [videoId, accessData?.accessToken]);

  /**
   * Start tracking video progress
   */
  const startTracking = useCallback(() => {
    if (trackingIntervalRef.current) return;

    trackingIntervalRef.current = setInterval(() => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastTrackTimeRef.current;
      
      if (trackingData.isPlaying && timeDiff >= 5000) { // Track every 5 seconds
        const newViewDuration = trackingData.viewDuration + (timeDiff / 1000);
        const newCompletionPercentage = duration ? 
          Math.min((trackingData.currentTime / duration) * 100, 100) : 0;

        setTrackingData(prev => ({
          ...prev,
          viewDuration: newViewDuration,
          completionPercentage: newCompletionPercentage
        }));

        // Track to server
        trackVideoView(newViewDuration, newCompletionPercentage);
        
        lastTrackTimeRef.current = currentTime;
      }
    }, 5000);
  }, [trackingData.isPlaying, trackingData.currentTime, trackingData.viewDuration, duration, trackVideoView]);

  /**
   * Stop tracking video progress
   */
  const stopTracking = useCallback(() => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
  }, []);

  /**
   * Handle YouTube player events
   */
  const handleYouTubeEvents = useCallback(() => {
    // Listen for YouTube iframe events
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;

      const data = JSON.parse(event.data);
      
      switch (data.event) {
        case 'video-progress':
          setTrackingData(prev => ({
            ...prev,
            currentTime: data.info?.currentTime || 0,
            isPlaying: data.info?.playerState === 1
          }));
          break;
          
        case 'video-ready':
          setTrackingData(prev => ({
            ...prev,
            isPlaying: false,
            currentTime: 0,
            lastTrackTime: Date.now()
          }));
          lastTrackTimeRef.current = Date.now();
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Initialize access token on mount
  useEffect(() => {
    generateAccessToken();
  }, [generateAccessToken]);

  // Handle tracking lifecycle
  useEffect(() => {
    if (isAuthorized && trackingData.isPlaying) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => stopTracking();
  }, [isAuthorized, trackingData.isPlaying, startTracking, stopTracking]);

  // Handle YouTube events
  useEffect(() => {
    const cleanup = handleYouTubeEvents();
    return cleanup;
  }, [handleYouTubeEvents]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
      // Final track on unmount
      if (trackingData.viewDuration > 0) {
        trackVideoView(trackingData.viewDuration, trackingData.completionPercentage);
      }
    };
  }, [stopTracking, trackingData.viewDuration, trackingData.completionPercentage, trackVideoView]);

  // Loading state
  if (loading) {
    return (
      <div className={`video-player-loading ${className}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải video...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`video-player-error ${className}`}>
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h3>Không thể tải video</h3>
          <p>{error}</p>
          {!isPreview && (
            <button 
              onClick={generateAccessToken}
              className="retry-button"
            >
              Thử lại
            </button>
          )}
        </div>
      </div>
    );
  }

  // Not authorized state
  if (!isAuthorized || !accessData) {
    return (
      <div className={`video-player-unauthorized ${className}`}>
        <div className="unauthorized-content">
          <div className="lock-icon">🔒</div>
          <h3>Video được bảo vệ</h3>
          <p>Bạn cần đăng ký khóa học để xem video này</p>
          {!isPreview && (
            <button 
              onClick={generateAccessToken}
              className="access-button"
            >
              Yêu cầu truy cập
            </button>
          )}
        </div>
      </div>
    );
  }

  // Video player
  return (
    <div className={`secure-video-player ${className}`}>
      {/* Video Info */}
      {title && (
        <div className="video-info">
          <h3 className="video-title">{title}</h3>
          {description && (
            <p className="video-description">{description}</p>
          )}
        </div>
      )}

      {/* YouTube Embed */}
      <div className="video-container">
        <iframe
          ref={iframeRef}
          src={accessData.embedUrl}
          title={title || 'Course Video'}
          width="100%"
          height="400"
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          className="youtube-embed"
        />
      </div>

      {/* Video Controls & Info */}
      <div className="video-controls">
        <div className="video-stats">
          {duration && (
            <span className="duration">
              Thời lượng: {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
            </span>
          )}
          <span className="views">
            Lượt xem còn lại: {accessData.maxViews - accessData.currentViews}
          </span>
        </div>
        
        {trackingData.isPlaying && (
          <div className="progress-indicator">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${trackingData.completionPercentage}%` }}
              />
            </div>
            <span className="progress-text">
              {trackingData.completionPercentage.toFixed(1)}% hoàn thành
            </span>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="security-notice">
        <small>
          🔒 Video này được bảo vệ bởi hệ thống bảo mật 3DIoT
        </small>
      </div>
    </div>
  );
};

export default SecureVideoPlayer;
