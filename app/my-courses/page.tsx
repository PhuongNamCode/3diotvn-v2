'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

interface Enrollment {
  id: string;
  courseId: string;
  fullName: string;
  email: string;
  status: string;
  paymentStatus: string;
  amount?: number;
  createdAt: string;
  course: Course;
}

interface UserStats {
  totalCourses: number;
  totalEvents: number;
  totalSpent: number;
  completedCourses: number;
  upcomingEvents: number;
}

export default function MyCoursesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      try {
        const saved = localStorage.getItem('user');
        if (saved) {
          const parsed = JSON.parse(saved) as User;
          setUser(parsed);
          fetchUserCourses(parsed.email);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/');
      }
    };

    checkAuth();
  }, [router]);

  const fetchUserCourses = async (email: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/dashboard?email=${encodeURIComponent(email)}`);
      const result = await response.json();

      if (result.success) {
        setEnrollments(result.data.enrollments);
        setStats(result.data.stats);
      } else {
        setError(result.error || 'Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId: string) => {
    // Navigate to course learning page
    router.push(`/course/${courseId}/learn`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enrolled':
      case 'confirmed': // Thêm case cho confirmed
        return <span className="status-badge enrolled">Đã đăng ký</span>;
      case 'completed':
        return <span className="status-badge completed">Hoàn thành</span>;
      case 'in-progress':
        return <span className="status-badge in-progress">Đang học</span>;
      case 'pending':
        return <span className="status-badge pending">Chờ xử lý</span>;
      default:
        return <span className="status-badge pending">Chờ xử lý</span>;
    }
  };

  if (loading) {
    return (
      <div className="my-courses-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải khóa học của bạn...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-courses-page">
        <div className="container">
          <div className="error-state">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Lỗi tải dữ liệu</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-courses-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <div className="header-text">
              <h1>Khóa học của tôi</h1>
              <p>Quản lý và tiếp tục học tập các khóa học đã đăng ký</p>
            </div>
          </div>
          <button 
            className="back-to-home-btn"
            onClick={() => router.push('/')}
          >
            <i className="fas fa-arrow-left"></i>
            Quay lại
          </button>
        </div>

        {/* Courses List */}
        <div className="courses-section">
          {enrollments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-book-open"></i>
              </div>
              <h3>Chưa có khóa học nào</h3>
              <p>Bạn chưa đăng ký khóa học nào. Hãy khám phá các khóa học thú vị!</p>
              <button 
                onClick={() => router.push('/')} 
                className="btn-primary"
              >
                <i className="fas fa-search"></i>
                Khám phá khóa học
              </button>
            </div>
          ) : (
            <div className="elegant-courses-grid">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="elegant-course-ticket">
                  {/* Course Ticket Header */}
                  <div className="ticket-header-elegant">
                    <div className="header-left">
                      <div className="course-icon">
                        <i className="fas fa-graduation-cap"></i>
                      </div>
                      <div className="header-info">
                        <h3 className="course-title">{enrollment.course.title}</h3>
                        <span className="course-category">{enrollment.course.category}</span>
                      </div>
                    </div>
                    <div className="header-right">
                      {getStatusBadge(enrollment.status)}
                    </div>
                  </div>

                  {/* Course Ticket Body */}
                  <div className="ticket-body-elegant">
                    <div className="course-details">
                      <div className="instructor-section">
                        <div className="instructor-label">Giảng viên</div>
                        <div className="instructor-name">{enrollment.course.instructorName || '3DIoT Team'}</div>
                      </div>
                      
                      <div className="course-meta-section">
                        <div className="meta-item">
                          <i className="fas fa-play-circle"></i>
                          <span>{enrollment.course.lessonsCount} bài học</span>
                        </div>
                        <div className="meta-item">
                          <i className="fas fa-clock"></i>
                          <span>{formatDuration(enrollment.course.durationMinutes)}</span>
                        </div>
                        <div className="meta-item">
                          <i className="fas fa-wallet"></i>
                          <span>{enrollment.amount ? formatPrice(enrollment.amount) : 'Miễn phí'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Ticket Footer */}
                  <div className="ticket-footer-elegant">
                    <button 
                      className="study-now-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCourseClick(enrollment.course.id);
                      }}
                    >
                      <i className="fas fa-play"></i>
                      Vào học ngay
                    </button>
                    <div className="footer-pattern"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
