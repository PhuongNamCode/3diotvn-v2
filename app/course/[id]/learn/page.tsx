'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import VideoList from '@/app/components/video/VideoList';
import SecureVideoPlayer from '@/app/components/video/SecureVideoPlayer';

interface User {
  name: string;
  email: string;
  picture: string;
  id: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  image?: string;
  level: string;
  price: number;
  category: string;
  lessonsCount: number;
  durationMinutes: number;
  instructorName?: string;
  instructorImage?: string;
  status: string;
  createdAt: string;
}

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
}

export default function CourseLearnPage() {
  const [user, setUser] = useState<User | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      try {
        const saved = localStorage.getItem('user');
        if (saved) {
          const parsed = JSON.parse(saved) as User;
          setUser(parsed);
          fetchCourseData(parsed.email);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/');
      }
    };

    checkAuth();
  }, [router, courseId]);

  const fetchCourseData = async (email: string) => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseResponse = await fetch(`/api/courses/${courseId}`);
      const courseResult = await courseResponse.json();

      if (!courseResult.success) {
        throw new Error(courseResult.error || 'Course not found');
      }

      setCourse(courseResult.data);

      // Check if user is enrolled in this course
      const enrollmentResponse = await fetch(`/api/user/dashboard?email=${encodeURIComponent(email)}`);
      const enrollmentResult = await enrollmentResponse.json();

      if (!enrollmentResult.success) {
        throw new Error('Failed to check enrollment');
      }

      const enrollment = enrollmentResult.data.enrollments.find(
        (e: any) => e.course.id === courseId && (e.status === 'enrolled' || e.status === 'confirmed')
      );

      if (!enrollment) {
        throw new Error('You are not enrolled in this course');
      }

    } catch (error) {
      console.error('Error fetching course data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleVideoClose = () => {
    setSelectedVideo(null);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="course-learn-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Đang tải khóa học...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-learn-page">
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Lỗi tải khóa học</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => router.push('/my-courses')} className="btn-secondary">
              <i className="fas fa-arrow-left"></i>
              Quay lại khóa học của tôi
            </button>
            <button onClick={() => window.location.reload()} className="btn-primary">
              <i className="fas fa-refresh"></i>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-learn-page">
        <div className="error-state">
          <i className="fas fa-graduation-cap"></i>
          <h3>Không tìm thấy khóa học</h3>
          <p>Khóa học này không tồn tại hoặc đã bị xóa.</p>
          <button onClick={() => router.push('/my-courses')} className="btn-primary">
            <i className="fas fa-arrow-left"></i>
            Quay lại khóa học của tôi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-learn-page">
      {/* Header */}
      <div className="course-header">
        <div className="header-content">
          <button 
            className="back-btn"
            onClick={() => router.push('/my-courses')}
          >
            <i className="fas fa-arrow-left"></i>
            Quay lại
          </button>
          <div className="course-info">
            <h1>{course.title}</h1>
            <p>{course.description}</p>
            <div className="course-meta">
              <span className="meta-item">
                <i className="fas fa-user"></i>
                {course.instructorName || '3DIoT Team'}
              </span>
              <span className="meta-item">
                <i className="fas fa-play-circle"></i>
                {course.lessonsCount} bài học
              </span>
              <span className="meta-item">
                <i className="fas fa-clock"></i>
                {formatDuration(course.durationMinutes)}
              </span>
              <span className="meta-item">
                <i className="fas fa-tag"></i>
                {course.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="course-content">
        <div className="content-container">
          {/* Video Player Section */}
          {selectedVideo ? (
            <div className="video-player-section">
              <div className="player-header">
                <h2>{selectedVideo.title}</h2>
                <button 
                  className="close-player-btn"
                  onClick={handleVideoClose}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="video-player-container">
                <SecureVideoPlayer
                  videoId={selectedVideo.id}
                  courseId={courseId}
                  userId={user?.id || ''}
                  email={user?.email || ''}
                  title={selectedVideo.title}
                  description={selectedVideo.description || ''}
                  thumbnailUrl={selectedVideo.thumbnailUrl}
                  duration={selectedVideo.duration}
                  isPreview={selectedVideo.isPreview}
                  className="course-video-player"
                />
              </div>
              {selectedVideo.description && (
                <div className="video-description">
                  <h3>Mô tả bài học</h3>
                  <p>{selectedVideo.description}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="welcome-section">
              <div className="welcome-content">
                <i className="fas fa-play-circle"></i>
                <h2>Chào mừng đến với khóa học!</h2>
                <p>Chọn một bài học từ danh sách bên phải để bắt đầu học tập.</p>
              </div>
            </div>
          )}

          {/* Video List Section */}
          <div className="video-list-section">
            <VideoList
              courseId={courseId}
              userId={user?.id || ''}
              email={user?.email || ''}
              showStats={true}
              className="course-video-list"
              onVideoSelect={handleVideoSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
