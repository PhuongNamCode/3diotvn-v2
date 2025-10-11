'use client';

import React from 'react';
import { calculateFakeEnrollmentCount } from '@/lib/utils/enrollmentUtils';
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
    createdAt?: string;
    updatedAt?: string;
    // Discount fields
    discountPercentage?: number | null;
    discountAmount?: number | null;
    discountStartDate?: string | null;
    discountEndDate?: string | null;
    isDiscountActive?: boolean | null;
  };
  onViewDetails: (course: any) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onViewDetails }) => {
  // Helper functions
  const calculateFinalPrice = (course: any) => {
    if (!course.isDiscountActive || course.price <= 0) return course.price;
    
    const now = new Date();
    const startDate = course.discountStartDate ? new Date(course.discountStartDate) : null;
    const endDate = course.discountEndDate ? new Date(course.discountEndDate) : null;
    
    // Check if discount is within valid date range
    if (startDate && now < startDate) return course.price;
    if (endDate && now > endDate) return course.price;
    
    let discountAmount = 0;
    
    // Calculate discount based on percentage or fixed amount
    if (course.discountPercentage && course.discountPercentage > 0) {
      discountAmount = (course.price * course.discountPercentage) / 100;
    } else if (course.discountAmount && course.discountAmount > 0) {
      discountAmount = course.discountAmount;
    }
    
    return Math.max(0, course.price - discountAmount);
  };

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
        return 'linear-gradient(135deg, #10b981, #34d399)'; // Modern green gradient
      case 'intermediate':
      case 'trung bình':
        return 'linear-gradient(135deg, #f59e0b, #fbbf24)'; // Modern amber gradient
      case 'advanced':
      case 'nâng cao':
        return 'linear-gradient(135deg, #ef4444, #f87171)'; // Modern red gradient
      default:
        return 'linear-gradient(135deg, #6b7280, #9ca3af)'; // Modern gray gradient
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
      case 'cơ bản':
        return 'fas fa-seedling'; // Growing plant icon
      case 'intermediate':
      case 'trung bình':
        return 'fas fa-chart-line'; // Trending up icon
      case 'advanced':
      case 'nâng cao':
        return 'fas fa-rocket'; // Rocket icon
      default:
        return 'fas fa-circle'; // Default circle icon
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

  const displayStudents = calculateFakeEnrollmentCount(course.enrolledCount, course.createdAt || course.updatedAt || new Date());
  const isPopular = course.enrolledCount > 100; // Tag "HOT" khi có > 100 học viên thật
  
  // Calculate pricing information
  const finalPrice = calculateFinalPrice(course);
  const hasDiscount = course.isDiscountActive && finalPrice < course.price && course.price > 0;
  const discountAmount = course.price - finalPrice;

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
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <i className="fas fa-sparkles" style={{ fontSize: '10px' }}></i>
              Mới
            </span>
          )}
          {isPopular && (
            <span style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <i className="fas fa-fire" style={{ fontSize: '10px' }}></i>
              HOT
            </span>
          )}
          {hasDiscount && (
            <span style={{
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <i className="fas fa-percentage" style={{ fontSize: '10px' }}></i>
              {course.discountPercentage ? `${course.discountPercentage}%` : 'Giảm giá'}
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
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'capitalize',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <i className={getLevelIcon(course.level)} style={{ fontSize: '10px' }}></i>
            {course.level}
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
            <span>{displayStudents} học viên</span>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {hasDiscount ? (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: 'var(--accent)'
                  }}>
                    {formatPrice(finalPrice)}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#16a34a',
                    background: '#dcfce7',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    -{course.discountPercentage ? `${course.discountPercentage}%` : formatPrice(discountAmount)}
                  </div>
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  textDecoration: 'line-through'
                }}>
                  {formatPrice(course.price)}
                </div>
              </>
            ) : (
              <div style={{
                fontSize: '1.2rem',
                fontWeight: '700',
                color: course.price > 0 ? 'var(--accent)' : '#22c55e'
              }}>
                {formatPrice(course.price)}
              </div>
            )}
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
