'use client';

import React from 'react';
import Image from 'next/image';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    image?: string;
    level: string;
    price: number;
    status: string;
    category: string;
    tags?: string[];
    lessonsCount: number;
    durationMinutes: number;
    enrolledCount: number;
    publishedAt?: string;
  };
  onViewDetails: (course: any) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onViewDetails }) => {
  // Helper functions
  const formatPrice = (price: number) => {
    return price > 0 ? `${price.toLocaleString('vi-VN')}₫` : 'Miễn phí';
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}p` : `${hours} giờ`;
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
      case 'cơ bản':
        return '#34d399'; // Success green (matches project theme)
      case 'intermediate':
      case 'trung bình':
        return '#fbbf24'; // Warning amber (matches project theme)
      case 'advanced':
      case 'nâng cao':
        return '#f87171'; // Danger red (matches project theme)
      default:
        return '#94a3b8'; // Text muted (matches project theme)
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
      case 'cơ bản':
        return '🟢';
      case 'intermediate':
      case 'trung bình':
        return '🟡';
      case 'advanced':
      case 'nâng cao':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'iot':
        return '📡';
      case 'embedded':
        return '🔧';
      case 'programming':
      case 'lập trình':
        return '💻';
      case 'electronics':
      case 'điện tử':
        return '⚡';
      case 'arduino':
        return '🤖';
      case 'esp32':
        return '📶';
      default:
        return '📚';
    }
  };

  const isNew = course.publishedAt ? 
    (new Date().getTime() - new Date(course.publishedAt).getTime()) < (30 * 24 * 60 * 60 * 1000) : 
    false;

  const isPopular = course.enrolledCount > 50;

  return (
    <div 
      className="course-card"
      style={{
        background: 'var(--surface)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = 'var(--accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
      onClick={() => onViewDetails(course)}
    >
      {/* Course Thumbnail */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
        {course.image ? (
          <Image
            src={course.image}
            alt={course.title}
            fill
            style={{ 
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            color: 'white'
          }}>
            {getCategoryIcon(course.category)}
          </div>
        )}
        
        {/* Badges */}
        <div style={{ 
          position: 'absolute', 
          top: '12px', 
          left: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {isNew && (
            <span style={{
              background: '#ef4444',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Mới
            </span>
          )}
          {isPopular && (
            <span style={{
              background: '#f59e0b',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Phổ biến
            </span>
          )}
        </div>

        {/* Duration Badge */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '6px 10px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <i className="fas fa-clock"></i>
          {formatDuration(course.durationMinutes)}
        </div>
      </div>

      {/* Course Content */}
      <div style={{ 
        padding: '20px', 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Category & Level */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{
            background: 'var(--surface-variant)',
            color: 'var(--text-primary)',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {getCategoryIcon(course.category)} {course.category}
          </span>
          <span style={{
            background: getLevelColor(course.level),
            color: 'white',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {getLevelIcon(course.level)} {course.level}
          </span>
        </div>

        {/* Course Title */}
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: '700',
          color: 'var(--primary)',
          margin: '0',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {course.title}
        </h3>

        {/* Course Description */}
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          margin: '0',
          lineHeight: '1.5',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1
        }}>
          {course.description}
        </p>

        {/* Course Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginTop: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <i className="fas fa-play-circle"></i>
            <span>{course.lessonsCount} bài học</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <i className="fas fa-users"></i>
            <span>{course.enrolledCount} học viên</span>
          </div>
        </div>

        {/* Price and Action */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border)'
        }}>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: '700',
            color: course.price > 0 ? 'var(--accent)' : '#22c55e'
          }}>
            {formatPrice(course.price)}
          </div>
          <button
            style={{
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-secondary)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <i className="fas fa-eye"></i>
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
