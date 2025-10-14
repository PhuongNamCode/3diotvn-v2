'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { calculateFakeEnrollmentCount } from '@/lib/utils/enrollmentUtils';

interface CourseDetailModalProps {
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
    // Enhanced fields
    overview?: string;
    curriculum?: any[];
    instructorName?: string;
    instructorBio?: string;
    instructorImage?: string;
    instructorEmail?: string;
    requirements?: string;
    whatYouWillLearn?: any[];
  };
  onClose: () => void;
  onEnroll: (course: any) => void;
}

const CourseDetailModal: React.FC<CourseDetailModalProps> = ({ course, onClose, onEnroll }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor'>('overview');

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
        return '#34d399';
      case 'intermediate':
      case 'trung bình':
        return '#fbbf24';
      case 'advanced':
      case 'nâng cao':
        return '#f87171';
      default:
        return '#94a3b8';
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

  // Use real curriculum data
  const curriculum = course.curriculum && Array.isArray(course.curriculum) && course.curriculum.length > 0 
    ? course.curriculum 
    : [];

  return (
    <div className="modal" style={{ display: "block", zIndex: 1000 }} onClick={onClose}>
      <div className="modal-content" style={{ 
        maxWidth: '1000px', 
        width: '90%', 
        maxHeight: '90vh', 
        overflow: 'auto',
        borderRadius: '20px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
        border: 'none',
        background: 'var(--surface)',
        display: 'flex',
        flexDirection: 'column'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header - Updated with Scroll Fix */}
        <div style={{ position: 'relative' }}>
          {course.image ? (
            <div style={{ position: 'relative', height: '300px', overflow: 'hidden' }}>
              <Image
                src={course.image}
                alt={course.title}
                fill
                style={{ objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))'
              }} />
            </div>
          ) : (
            <div style={{
              height: '300px',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4rem',
              color: 'white'
            }}>
              {getCategoryIcon(course.category)}
            </div>
          )}
          
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(0,0,0,0.7)',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              fontSize: '20px',
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.9)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.7)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ×
          </button>

          {/* Course Info Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            color: 'white'
          }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span style={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {getCategoryIcon(course.category)} {course.category}
              </span>
              <span style={{
                background: getLevelColor(course.level),
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {course.level}
              </span>
              <span style={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                ⏱️ {formatDuration(course.durationMinutes)}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* Sticky Enroll Button - Mobile & Tablet */}
          <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            padding: '12px 20px',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }} className="sticky-enroll-button">
            <button
              onClick={() => onEnroll(course)}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                color: 'white',
                borderRadius: '25px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                minWidth: '200px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
              }}
            >
              <i className="fas fa-rocket"></i>
              Đăng ký ngay - {formatPrice(calculateFinalPrice(course))}
            </button>
          </div>

          {/* Title & Price */}
          <div style={{
            padding: '30px 30px 20px',
            borderBottom: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h1 style={{
                fontSize: '2.2rem',
                fontWeight: '700',
                color: 'var(--primary)',
                margin: 0,
                lineHeight: '1.3',
                flex: 1,
                marginRight: '20px'
              }}>
                {course.title}
              </h1>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                {(() => {
                  const finalPrice = calculateFinalPrice(course);
                  const hasDiscount = course.isDiscountActive && finalPrice < course.price && course.price > 0;
                  const discountAmount = course.price - finalPrice;
                  
                  if (hasDiscount) {
                    return (
                      <>
                        <div style={{
                          fontSize: '2rem',
                          fontWeight: '700',
                          color: 'var(--accent)',
                          whiteSpace: 'nowrap'
                        }}>
                          {formatPrice(finalPrice)}
                        </div>
                        <div style={{
                          fontSize: '1.2rem',
                          color: 'var(--text-muted)',
                          textDecoration: 'line-through',
                          whiteSpace: 'nowrap'
                        }}>
                          {formatPrice(course.price)}
                        </div>
                        <div style={{
                          fontSize: '0.9rem',
                          color: '#16a34a',
                          background: '#dcfce7',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontWeight: '600',
                          whiteSpace: 'nowrap'
                        }}>
                          -{course.discountPercentage ? `${course.discountPercentage}%` : formatPrice(discountAmount)}
                        </div>
                      </>
                    );
                  } else {
                    return (
                      <div style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: course.price > 0 ? 'var(--accent)' : '#34d399',
                        whiteSpace: 'nowrap'
                      }}>
                        {formatPrice(course.price)}
                      </div>
                    );
                  }
                })()}
              </div>
            </div>

            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: 'var(--surface-variant)',
                borderRadius: '12px'
              }}>
                <i className="fas fa-play-circle" style={{ color: 'var(--accent)', fontSize: '18px' }}></i>
                <div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Bài học</div>
                  <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{course.lessonsCount}</div>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: 'var(--surface-variant)',
                borderRadius: '12px'
              }}>
                <i className="fas fa-users" style={{ color: 'var(--accent)', fontSize: '18px' }}></i>
                <div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Học viên</div>
                  <div style={{ fontWeight: '600', color: 'var(--primary)' }}>
                    {calculateFakeEnrollmentCount(course.enrolledCount || 0, course.createdAt || course.updatedAt || new Date())}
                  </div>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: 'var(--surface-variant)',
                borderRadius: '12px'
              }}>
                <i className="fas fa-clock" style={{ color: 'var(--accent)', fontSize: '18px' }}></i>
                <div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Thời gian</div>
                  <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{formatDuration(course.durationMinutes)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface-variant)'
          }}>
            {[
              { key: 'overview', label: 'Tổng quan', icon: 'fas fa-info-circle' },
              { key: 'curriculum', label: 'Chương trình', icon: 'fas fa-list' },
              { key: 'instructor', label: 'Giảng viên', icon: 'fas fa-user' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  border: 'none',
                  background: activeTab === tab.key ? 'var(--surface)' : 'transparent',
                  color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderBottom: activeTab === tab.key ? '3px solid var(--accent)' : '3px solid transparent'
                }}
              >
                <i className={tab.icon}></i>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ 
            flex: 1, 
            padding: '30px'
          }}>
            {activeTab === 'overview' && (
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: 'var(--primary)' }}>
                  Mô tả khóa học
                </h3>
                <div style={{
                  fontSize: '1rem',
                  lineHeight: '1.7',
                  color: 'var(--text-secondary)',
                  marginBottom: '20px'
                }}>
                  {course.description}
                </div>

                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px', color: 'var(--primary)' }}>
                    Tổng quan khóa học
                  </h4>
                  <div style={{
                    fontSize: '1rem',
                    lineHeight: '1.7',
                    color: 'var(--text-secondary)',
                    background: 'var(--surface-variant)',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)'
                  }}>
                    {course.overview || 'Chưa có thông tin tổng quan'}
                  </div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px', color: 'var(--primary)' }}>
                    Yêu cầu đầu vào
                  </h4>
                  <div style={{
                    fontSize: '1rem',
                    lineHeight: '1.7',
                    color: 'var(--text-secondary)',
                    background: 'var(--surface-variant)',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)'
                  }}>
                    {course.requirements || 'Chưa có thông tin yêu cầu'}
                  </div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px', color: 'var(--primary)' }}>
                    Kỹ năng bạn sẽ học
                  </h4>
                  {course.whatYouWillLearn && Array.isArray(course.whatYouWillLearn) && course.whatYouWillLearn.length > 0 ? (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {course.whatYouWillLearn.map((skill, index) => (
                        <span
                          key={index}
                          style={{
                            background: 'var(--accent)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '16px',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      color: 'var(--text-muted)',
                      fontStyle: 'italic',
                      padding: '10px'
                    }}>
                      Chưa có thông tin kỹ năng
                    </div>
                  )}
                </div>


                {course.tags && course.tags.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px', color: 'var(--primary)' }}>
                      Tags
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {course.tags.map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            background: 'var(--surface-variant)',
                            color: 'var(--text-primary)',
                            padding: '6px 12px',
                            borderRadius: '16px',
                            fontSize: '14px',
                            fontWeight: '500',
                            border: '1px solid var(--border)'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: 'var(--primary)' }}>
                  Chương trình học
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {curriculum.length > 0 ? curriculum.map((lesson, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px',
                        background: 'var(--surface-variant)',
                        borderRadius: '12px',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: 'var(--primary)', marginBottom: '4px' }}>
                          {lesson.title}
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                          {lesson.duration} • {lesson.type === 'video' ? 'Video' : lesson.type === 'assignment' ? 'Bài tập' : 'Dự án'}
                        </div>
                      </div>
                      <i className={`fas fa-${lesson.type === 'video' ? 'play' : lesson.type === 'assignment' ? 'edit' : 'code'}`} 
                         style={{ color: 'var(--text-muted)', fontSize: '16px' }}></i>
                    </div>
                  )) : (
                    <div style={{
                      padding: '40px',
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      background: 'var(--surface-variant)',
                      borderRadius: '12px',
                      border: '1px solid var(--border)'
                    }}>
                      <i className="fas fa-book-open" style={{ fontSize: '2rem', marginBottom: '16px', display: 'block' }}></i>
                      <p>Chương trình học sẽ được cập nhật sớm</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'instructor' && (
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: 'var(--primary)' }}>
                  Giảng viên
                </h3>
                <div style={{
                  display: 'flex',
                  gap: '20px',
                  padding: '24px',
                  background: 'var(--surface-variant)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    color: 'white',
                    overflow: 'hidden'
                  }}>
                    {course.instructorImage ? (
                      <img 
                        src={course.instructorImage} 
                        alt={course.instructorName || 'Instructor'} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '👨‍💻';
                          }
                        }}
                      />
                    ) : (
                      '👨‍💻'
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '8px', color: 'var(--primary)' }}>
                      {course.instructorName || 'Giảng viên 3DIoT'}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
                      {course.instructorBio || 'Chuyên gia với nhiều năm kinh nghiệm trong lĩnh vực IoT và Embedded Systems. Đã giảng dạy hàng trăm học viên và tham gia nhiều dự án thực tế.'}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
                      <span>🏆 5+ năm kinh nghiệm</span>
                      <span>👥 1000+ học viên</span>
                      <span>⭐ 4.9/5 đánh giá</span>
                      {course.instructorEmail && (
                        <span>
                          <i className="fas fa-envelope" style={{ marginRight: '4px' }}></i>
                          <a href={`mailto:${course.instructorEmail}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                            {course.instructorEmail}
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {/* Fixed Bottom Action Bar */}
          <div style={{
            padding: '20px 30px',
            borderTop: '1px solid var(--border)',
            background: 'var(--surface)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
          }}>
            {/* Action Buttons - Centered */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '12px 24px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.color = 'var(--accent)';
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <i className="fas fa-times" style={{ marginRight: '6px' }}></i>
                Đóng
              </button>
              <button
                onClick={() => onEnroll(course)}
                style={{
                  padding: '14px 28px',
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                  color: 'white',
                  borderRadius: '10px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '16px',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  minWidth: '180px',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, var(--accent-secondary), var(--accent))';
                  
                  // Trigger shimmer effect
                  const shimmer = e.currentTarget.querySelector('.shimmer-effect') as HTMLElement;
                  if (shimmer) {
                    shimmer.style.left = '100%';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, var(--accent), var(--accent-secondary))';
                  
                  // Reset shimmer effect
                  const shimmer = e.currentTarget.querySelector('.shimmer-effect') as HTMLElement;
                  if (shimmer) {
                    shimmer.style.left = '-100%';
                  }
                }}
              >
                <i className="fas fa-rocket"></i>
                Đăng ký ngay
                <div className="shimmer-effect" style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  transition: 'left 0.5s ease'
                }}></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailModal;
