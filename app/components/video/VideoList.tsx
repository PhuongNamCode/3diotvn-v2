'use client';

import React, { useState, useEffect } from 'react';
import SecureVideoPlayer from './SecureVideoPlayer';

interface Video {
  id: string;
  youtubeVideoId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: number;
  videoOrder: number;
  isPreview: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  stats?: {
    totalViews: number;
    uniqueUsers: number;
    avgDuration: number;
    completionRate: number;
  };
}

interface VideoListProps {
  courseId: string;
  userId?: string;
  email?: string;
  showStats?: boolean;
  className?: string;
  onVideoSelect?: (video: Video) => void;
}

const VideoList: React.FC<VideoListProps> = ({
  courseId,
  userId,
  email,
  showStats = false,
  className = '',
  onVideoSelect
}) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  /**
   * Fetch videos for the course
   */
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}/videos?includeStats=${showStats}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch videos');
      }

      setVideos(result.data.videos);
      setError(null);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  // Fetch videos on mount
  useEffect(() => {
    fetchVideos();
  }, [courseId, showStats]);

  /**
   * Format duration from seconds to MM:SS
   */
  const formatDuration = (seconds: number | undefined): string => {
    if (!seconds) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  /**
   * Handle video selection
   */
  const handleVideoSelect = (video: Video) => {
    if (onVideoSelect) {
      onVideoSelect(video);
    } else {
      setSelectedVideo(video);
    }
  };

  /**
   * Handle video close
   */
  const handleVideoClose = () => {
    setSelectedVideo(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className={`video-list-loading ${className}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải danh sách video...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`video-list-error ${className}`}>
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h3>Không thể tải video</h3>
          <p>{error}</p>
          <button onClick={fetchVideos} className="retry-button">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // No videos state
  if (videos.length === 0) {
    return (
      <div className={`video-list-empty ${className}`}>
        <div className="empty-content">
          <div className="empty-icon">📹</div>
          <h3>Chưa có video nào</h3>
          <p>Khóa học này chưa có video nào được thêm vào.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`video-list ${className}`}>
      {/* Video Grid */}
      <div className="video-grid">
        {videos.map((video) => (
          <div
            key={video.id}
            className={`video-card ${selectedVideo?.id === video.id ? 'selected' : ''}`}
            onClick={() => handleVideoSelect(video)}
          >
            {/* Thumbnail */}
            <div className="video-thumbnail">
              <img
                src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`}
                alt={video.title}
                loading="lazy"
              />
              
              {/* Duration Badge */}
              {video.duration && (
                <div className="duration-badge">
                  {formatDuration(video.duration)}
                </div>
              )}

              {/* Preview Badge */}
              {video.isPreview && (
                <div className="preview-badge">
                  Xem trước
                </div>
              )}

              {/* Play Button */}
              <div className="play-button">
                <div className="play-icon">▶️</div>
              </div>
            </div>

            {/* Video Info */}
            <div className="video-info">
              <h4 className="video-title">{video.title}</h4>
              {video.description && (
                <p className="video-description">
                  {video.description.length > 100 
                    ? `${video.description.substring(0, 100)}...` 
                    : video.description
                  }
                </p>
              )}

              {/* Video Stats */}
              {showStats && video.stats && (
                <div className="video-stats">
                  <div className="stat-item">
                    <span className="stat-icon">👀</span>
                    <span className="stat-value">{video.stats.totalViews}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">👥</span>
                    <span className="stat-value">{video.stats.uniqueUsers}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">📊</span>
                    <span className="stat-value">{video.stats.completionRate.toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="video-player-modal">
          <div className="modal-overlay" onClick={handleVideoClose} />
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedVideo.title}</h3>
              <button 
                className="close-button"
                onClick={handleVideoClose}
                aria-label="Đóng video"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <SecureVideoPlayer
                videoId={selectedVideo.id}
                courseId={courseId}
                userId={userId}
                email={email}
                title={selectedVideo.title}
                description={selectedVideo.description}
                thumbnailUrl={selectedVideo.thumbnailUrl}
                duration={selectedVideo.duration}
                isPreview={selectedVideo.isPreview}
                className="modal-video-player"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoList;
