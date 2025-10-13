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
        return <span className="status-badge enrolled">Đã đăng ký</span>;
      case 'completed':
        return <span className="status-badge completed">Hoàn thành</span>;
      case 'in-progress':
        return <span className="status-badge in-progress">Đang học</span>;
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
            <h1>Khóa học của tôi</h1>
            <p>Quản lý và tiếp tục học tập các khóa học đã đăng ký</p>
          </div>
          {user && (
            <div className="user-info">
              <img 
                src={user.picture || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNmM2Y0ZjYiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik04IDhDOS4xMDQ1NyA4IDEwIDcuMTA0NTcgMTAgNkMxMCA0Ljg5NTQzIDkuMTA0NTcgNCA4IDRDNi44OTU0MyA0IDYgNC44OTU0MyA2IDZDNiA3LjEwNDU3IDYuODk1NDMgOCA4IDhaIiBmaWxsPSIjNjY3Nzg4Ii8+CjxwYXRoIGQ9Ik0xMiAxMkMxMiAxMC44OTU0IDExLjEwNDYgMTAgMTAgMTBINkM0Ljg5NTQzIDEwIDQgMTAuODk1NCA0IDEyVjEzSDEyVjEyWiIgZmlsbD0iIzY2Nzc4OCIvPgo8L3N2Zz4KPC9zdmc+"}
                alt="User Avatar" 
                className="user-avatar" 
              />
              <span className="user-name">{user.name}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.totalCourses}</h3>
                  <p>Tổng khóa học</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-trophy"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.completedCourses}</h3>
                  <p>Đã hoàn thành</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="stat-content">
                  <h3>{enrollments.filter(e => e.status === 'in-progress').length}</h3>
                  <p>Đang học</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-wallet"></i>
                </div>
                <div className="stat-content">
                  <h3>{formatPrice(stats.totalSpent)}</h3>
                  <p>Tổng đầu tư</p>
                </div>
              </div>
            </div>
          </div>
        )}

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
            <div className="courses-grid">
              {enrollments.map((enrollment) => (
                <div 
                  key={enrollment.id} 
                  className="course-card"
                  onClick={() => handleCourseClick(enrollment.course.id)}
                >
                  <div className="course-image">
                    {enrollment.course.image ? (
                      <img src={enrollment.course.image} alt={enrollment.course.title} />
                    ) : (
                      <div className="course-placeholder">
                        <i className="fas fa-graduation-cap"></i>
                      </div>
                    )}
                    <div className="course-overlay">
                      {getStatusBadge(enrollment.status)}
                    </div>
                  </div>
                  
                  <div className="course-content">
                    <div className="course-header">
                      <h3 className="course-title">{enrollment.course.title}</h3>
                      <span className="course-category">{enrollment.course.category}</span>
                    </div>
                    
                    <p className="course-description">
                      {enrollment.course.description.length > 120 
                        ? `${enrollment.course.description.substring(0, 120)}...`
                        : enrollment.course.description
                      }
                    </p>
                    
                    <div className="course-meta">
                      <div className="meta-item">
                        <i className="fas fa-user"></i>
                        <span>{enrollment.course.instructorName || '3DIoT Team'}</span>
                      </div>
                      <div className="meta-item">
                        <i className="fas fa-play-circle"></i>
                        <span>{enrollment.course.lessonsCount} bài học</span>
                      </div>
                      <div className="meta-item">
                        <i className="fas fa-clock"></i>
                        <span>{formatDuration(enrollment.course.durationMinutes)}</span>
                      </div>
                    </div>
                    
                    <div className="course-footer">
                      <div className="course-price">
                        {enrollment.amount ? formatPrice(enrollment.amount) : 'Miễn phí'}
                      </div>
                      <button className="btn-continue">
                        <i className="fas fa-play"></i>
                        {enrollment.status === 'completed' ? 'Xem lại' : 'Tiếp tục học'}
                      </button>
                    </div>
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
