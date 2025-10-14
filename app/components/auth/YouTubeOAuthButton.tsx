"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface YouTubeOAuthButtonProps {
  courseId?: string;
  videoId?: string;
  email?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export default function YouTubeOAuthButton({
  courseId,
  videoId,
  email,
  onSuccess,
  onError,
  className = "",
  children
}: YouTubeOAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleYouTubeAuth = async () => {
    try {
      setLoading(true);

      // Generate state parameter for security
      const state = JSON.stringify({
        courseId,
        videoId,
        email,
        timestamp: Date.now()
      });

      // Get authorization URL from API
      const response = await fetch('/api/auth/youtube/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate authorization URL');
      }

      // Redirect to Google OAuth
      window.location.href = data.authUrl;

    } catch (error) {
      console.error('YouTube OAuth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      
      if (onError) {
        onError(errorMessage);
      } else {
        alert(`Lỗi xác thực: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleYouTubeAuth}
      disabled={loading}
      className={`youtube-oauth-btn ${className} ${loading ? 'loading' : ''}`}
    >
      {loading ? (
        <>
          <div className="loading-spinner"></div>
          <span>Đang xác thực...</span>
        </>
      ) : (
        <>
          <i className="fab fa-youtube"></i>
          <span>{children || 'Đăng nhập YouTube'}</span>
        </>
      )}
    </button>
  );
}
