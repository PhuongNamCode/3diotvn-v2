"use client";

import { useEffect, useRef, useState } from 'react';

interface SecureYouTubePlayerProps {
  videoId: string;
  courseId: string;
  email: string;
  userId: string;
  title?: string;
  className?: string;
}

export default function SecureYouTubePlayer({
  videoId,
  courseId,
  email,
  userId,
  title,
  className = ""
}: SecureYouTubePlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const youtubePlayerRef = useRef<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Check enrollment and get access token
    checkAccess();
  }, [videoId, courseId, email]);

  useEffect(() => {
    if (isAuthorized && accessToken && playerRef.current) {
      initializePlayer();
    }
  }, [isAuthorized, accessToken]);

  const checkAccess = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call API to verify enrollment and get access token
      const response = await fetch('/api/videos/secure-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          courseId,
          email,
          userId
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Access denied');
      }

      setIsAuthorized(true);
      setAccessToken(data.accessToken);

    } catch (error) {
      console.error('Access check failed:', error);
      setError(error instanceof Error ? error.message : 'Access denied');
    } finally {
      setLoading(false);
    }
  };

  const initializePlayer = () => {
    if (!window.YT || !playerRef.current) return;

    try {
      youtubePlayerRef.current = new window.YT.Player(playerRef.current, {
        videoId: videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 1,
          cc_load_policy: 0,
          iv_load_policy: 3,
          autohide: 0,
          // Add access token for private videos
          ...(accessToken && { 
            enablejsapi: 1,
            origin: window.location.origin
          })
        },
        events: {
          onReady: (event: any) => {
            console.log('YouTube player ready');
            // Log successful access
            logVideoAccess('loaded');
          },
          onStateChange: (event: any) => {
            // Log video state changes
            logVideoAccess('state_change', { state: event.data });
          },
          onError: (event: any) => {
            console.error('YouTube player error:', event.data);
            setError('Video playback error. Please try again.');
            logVideoAccess('error', { error: event.data });
          }
        }
      });
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
      setError('Failed to load video player');
    }
  };

  const logVideoAccess = async (action: string, metadata?: any) => {
    try {
      await fetch('/api/videos/access-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          courseId,
          userId,
          email,
          accessType: 'youtube',
          action,
          metadata,
          success: true
        })
      });
    } catch (error) {
      console.warn('Failed to log video access:', error);
    }
  };

  // Load YouTube API if not already loaded
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API loaded');
      };
    }
  }, []);

  if (loading) {
    return (
      <div className={`secure-youtube-player ${className}`}>
        <div className="player-loading">
          <div className="loading-spinner"></div>
          <p>Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`secure-youtube-player ${className}`}>
        <div className="player-error">
          <div className="error-icon">
            <i className="fas fa-lock"></i>
          </div>
          <h3>Video không có sẵn</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button 
              className="btn-retry"
              onClick={checkAccess}
            >
              <i className="fas fa-refresh"></i>
              Thử lại
            </button>
            <button 
              className="btn-contact"
              onClick={() => window.open('mailto:support@3diot.vn')}
            >
              <i className="fas fa-envelope"></i>
              Liên hệ hỗ trợ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className={`secure-youtube-player ${className}`}>
        <div className="player-unauthorized">
          <div className="unauthorized-icon">
            <i className="fas fa-user-times"></i>
          </div>
          <h3>Truy cập bị từ chối</h3>
          <p>Bạn cần đăng ký khóa học để xem video này.</p>
          <button 
            className="btn-enroll"
            onClick={() => window.location.href = '/courses'}
          >
            <i className="fas fa-graduation-cap"></i>
            Đăng ký khóa học
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`secure-youtube-player ${className}`}>
      <div className="player-header">
        {title && <h3 className="video-title">{title}</h3>}
        <div className="access-indicator">
          <i className="fas fa-shield-alt"></i>
          <span>Đã xác thực truy cập</span>
        </div>
      </div>
      <div className="player-container">
        <div ref={playerRef} className="youtube-player"></div>
      </div>
      <div className="player-footer">
        <div className="security-info">
          <i className="fas fa-lock"></i>
          <span>Video được bảo vệ bởi hệ thống xác thực</span>
        </div>
      </div>
    </div>
  );
}

// Extend Window interface for YouTube API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
