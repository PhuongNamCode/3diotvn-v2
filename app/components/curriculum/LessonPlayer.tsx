"use client";

import { useState, useEffect } from 'react';

interface Lesson {
  title: string;
  duration: string;
  type: 'youtube' | 'online-meeting';
  url: string;
}

interface LessonPlayerProps {
  lesson: Lesson;
  lessonIndex: number;
  courseId: string;
  userId?: string;
  email?: string;
  onClose?: () => void;
  className?: string;
}

export default function LessonPlayer({
  lesson,
  lessonIndex,
  courseId,
  userId,
  email,
  onClose,
  className = ""
}: LessonPlayerProps) {
  const [loading, setLoading] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getYouTubeEmbedUrl = (url: string): string => {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) return '';
    
    // For private videos, we need to use the original URL
    // The user's Gmail account should have access
    return url;
  };

  const handleYouTubeClick = async () => {
    if (!lesson.url || !email) return;

    try {
      setLoading(true);
      setAccessError(null);

      // Extract video ID from URL
      const videoId = extractYouTubeVideoId(lesson.url);
      if (!videoId) {
        setAccessError('URL video YouTube không hợp lệ');
        return;
      }

      // Check secure access first
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

      // Redirect to YouTube private video
      window.open(data.data.redirectUrl, '_blank', 'noopener,noreferrer');
      
    } catch (error) {
      console.error('Error accessing YouTube video:', error);
      setAccessError(error instanceof Error ? error.message : 'Access denied');
    } finally {
      setLoading(false);
    }
  };

  const handleOnlineMeetingClick = () => {
    if (lesson.url) {
      window.open(lesson.url, '_blank', 'noopener,noreferrer');
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'youtube':
        return 'fab fa-youtube';
      case 'online-meeting':
        return 'fas fa-video';
      default:
        return 'fas fa-play-circle';
    }
  };

  const getLessonTypeLabel = (type: string) => {
    switch (type) {
      case 'youtube':
        return 'YouTube Video';
      case 'online-meeting':
        return 'Online Meeting';
      default:
        return 'Bài học';
    }
  };

  return (
    <div className={`lesson-player ${className}`}>
      <div className="player-header">
        <div className="header-left">
          <div className="lesson-info">
            <span className="lesson-number">Buổi {lessonIndex + 1}</span>
            <h2 className="lesson-title">{lesson.title}</h2>
          </div>
          <div className="lesson-type">
            <i className={getLessonIcon(lesson.type)}></i>
            <span>{getLessonTypeLabel(lesson.type)}</span>
          </div>
        </div>
        <button 
          className="close-player-btn"
          onClick={onClose}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="player-content">
        {lesson.type === 'youtube' ? (
          <div className="youtube-lesson">
            <div className="lesson-preview">
              <div className="preview-thumbnail">
                <img 
                  src={`https://img.youtube.com/vi/${extractYouTubeVideoId(lesson.url)}/maxresdefault.jpg`}
                  alt={lesson.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/api/placeholder/800/450';
                  }}
                />
                <div className="play-overlay">
                  <i className="fab fa-youtube"></i>
                </div>
              </div>
              <div className="lesson-details">
                <h3>Video Khóa Học</h3>
                <p>Nhấn vào nút bên dưới để xem video. Video được bảo vệ và chỉ dành cho học viên đã đăng ký.</p>
                <div className="lesson-meta">
                  <span className="duration">
                    <i className="fas fa-clock"></i>
                    {lesson.duration}
                  </span>
                </div>
              </div>
            </div>
            <div className="lesson-actions">
              {accessError ? (
                <div className="access-error">
                  <div className="error-message">
                    <i className="fas fa-exclamation-triangle"></i>
                    <h4>Không thể truy cập video</h4>
                    <p>{accessError}</p>
                  </div>
                  <button 
                    className="btn-retry"
                    onClick={handleYouTubeClick}
                  >
                    <i className="fas fa-refresh"></i>
                    Thử lại
                  </button>
                </div>
              ) : (
                <button 
                  className="btn-youtube"
                  onClick={handleYouTubeClick}
                  disabled={!lesson.url || loading}
                >
                  <i className={loading ? "fas fa-spinner fa-spin" : "fab fa-youtube"}></i>
                  {loading ? 'Đang xử lý...' : 'Xem trên YouTube'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="online-meeting-lesson">
            <div className="meeting-preview">
              <div className="meeting-icon">
                <i className="fas fa-video"></i>
              </div>
              <div className="meeting-details">
                <h3>Online Meeting</h3>
                <p>Nhấn vào nút bên dưới để tham gia buổi học trực tuyến.</p>
                <div className="lesson-meta">
                  <span className="duration">
                    <i className="fas fa-clock"></i>
                    {lesson.duration}
                  </span>
                </div>
              </div>
            </div>
            <div className="lesson-actions">
              <button 
                className="btn-meeting"
                onClick={handleOnlineMeetingClick}
                disabled={!lesson.url}
              >
                <i className="fas fa-video"></i>
                Tham gia Online Meeting
              </button>
            </div>
          </div>
        )}
      </div>

      {lesson.duration && (
        <div className="player-footer">
          <div className="lesson-progress">
            <span className="progress-label">Thời lượng:</span>
            <span className="progress-value">{lesson.duration}</span>
          </div>
        </div>
      )}
    </div>
  );
}
