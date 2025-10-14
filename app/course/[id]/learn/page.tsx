'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CurriculumList from '@/app/components/curriculum/CurriculumList';
import LessonPlayer from '@/app/components/curriculum/LessonPlayer';

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
  curriculum?: Lesson[];
}

interface Lesson {
  title: string;
  duration: string;
  type: 'youtube' | 'online-meeting';
  url: string;
}

export default function CourseLearnPage() {
  const [user, setUser] = useState<User | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number | null>(null);
  const [enrollmentEmail, setEnrollmentEmail] = useState<string | null>(null);
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

      // Store enrollment email for video access
      setEnrollmentEmail(enrollment.email);

    } catch (error) {
      console.error('Error fetching course data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSelect = (lesson: Lesson, index: number) => {
    setSelectedLesson(lesson);
    setSelectedLessonIndex(index);
  };

  const handleLessonClose = () => {
    setSelectedLesson(null);
    setSelectedLessonIndex(null);
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
          {/* Lesson Player Section */}
          {selectedLesson ? (
            <div className="lesson-player-section">
              <LessonPlayer
                lesson={selectedLesson}
                lessonIndex={selectedLessonIndex || 0}
                courseId={courseId}
                userId={user?.id || ''}
                email={enrollmentEmail || user?.email || ''}
                onClose={handleLessonClose}
                className="course-lesson-player"
              />
            </div>
          ) : (
            <div className="welcome-section">
              <div className="welcome-content">
                <i className="fas fa-graduation-cap"></i>
                <h2>Chào mừng đến với khóa học!</h2>
                <p>Chọn một bài học từ danh sách bên phải để bắt đầu học tập.</p>
              </div>
            </div>
          )}

          {/* Curriculum List Section */}
          <div className="curriculum-list-section">
            <CurriculumList
              courseId={courseId}
              curriculum={course?.curriculum || []}
              userId={user?.id || ''}
              email={user?.email || ''}
              onLessonSelect={handleLessonSelect}
              className="course-curriculum-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
