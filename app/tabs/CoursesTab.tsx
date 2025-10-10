"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useCourses, useCourseEnrollments } from "@/lib/hooks/useData";
import { paymentMethods, generatePaymentInstructions } from "@/lib/payment-config";

type CourseItem = {
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
};

type EnrollmentPayload = {
  courseId: string;
  fullName: string;
  email: string;
  phone?: string;
  status?: string;
  paymentMethod?: string;
  transactionId?: string;
  amount?: number;
};

export default function CoursesTab() {
  const { courses: apiCourses, loading: apiLoading, refetch: refetchCourses } = useCourses();
  const { createEnrollment } = useCourseEnrollments();
  const [items, setItems] = useState<CourseItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CourseItem | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('ocb');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('');

  useEffect(() => {
    if (apiCourses && apiCourses.length >= 0) {
      const converted: CourseItem[] = apiCourses.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        image: c.image || "",
        level: c.level,
        price: c.price,
        status: c.status,
        category: c.category,
        tags: c.tags,
        lessonsCount: c.lessonsCount,
        durationMinutes: c.durationMinutes,
        enrolledCount: c.enrolledCount,
      }));
      setItems(converted);
      setLoading(false);
    } else if (!apiLoading) {
      setItems([]);
      setLoading(false);
    }
  }, [apiCourses, apiLoading]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('payment-dropdown');
      const selector = document.getElementById('payment-selector');
      if (dropdown && selector && 
          !selector.contains(event.target as Node) && 
          !dropdown.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const filtered = useMemo(() => {
    if (!items) return [] as CourseItem[];
    let base = items;
    if (categoryFilter !== 'all') base = base.filter(c => c.category === categoryFilter);
    if (levelFilter !== 'all') base = base.filter(c => c.level === levelFilter);
    return base;
  }, [items, categoryFilter, levelFilter]);

  function formatDuration(mins: number) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  function getCurrentUser() {
    try { const raw = localStorage.getItem('user'); return raw ? JSON.parse(raw) : null; } catch { return null; }
  }

  function ensureLoggedInOrRedirect(): boolean {
    const user = getCurrentUser();
    if (!user) {
      (window as any).showNotification?.('Bạn vui lòng đăng nhập để đăng ký khóa học!', 'warning');
      (window as any).switchToTab?.('login');
      return false;
    }
    return true;
  }

  function handleViewDetails(course: CourseItem) {
    if (!ensureLoggedInOrRedirect()) return;
    setSelected(course);
    setSuccess(false);
    setPaymentStatus('');
    setShowDetails(true);
  }

  async function submitEnrollment(formData: FormData) {
    if (!selected) return;
    
    const payload: EnrollmentPayload = {
      courseId: selected.id,
      fullName: String(formData.get('fullName') || ''),
      email: String(formData.get('email') || ''),
      phone: String(formData.get('phone') || ''),
      status: 'pending'
    };

    // Thêm thông tin thanh toán nếu khóa học có phí
    if ((selected.price ?? 0) > 0) {
      payload.paymentMethod = selectedPaymentMethod;
      payload.transactionId = String(formData.get('transactionId') || '');
      payload.amount = selected.price;
    }

    setSubmitting(true);
    setSuccess(false);
    setError(null);
    setPaymentStatus('');
    
    try {
      const response = await createEnrollment(payload as any);
      setSuccess(true);
      setPaymentStatus(response.paymentStatus || '');
      await refetchCourses();
    } catch (e: any) {
      setError(e?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      {/* Hero */}
      <section className="events-hero">
        <div className="events-hero-content">
          <div className="events-hero-text">
            <h1>
              <span style={{ color: 'var(--accent)' }}>Khóa học</span>
            </h1>
            <p className="events-hero-description">
              Học tập theo lộ trình với các khóa học từ cơ bản đến nâng cao. Tăng tốc kỹ năng Embedded & IoT của bạn.
            </p>
            <div className="events-hero-stats">
              <div className="stat-item">
                <span className="stat-number">{items?.length || 0}</span>
                <span className="stat-label">Khóa học</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{items?.reduce((s, c) => s + (c?.lessonsCount || 0), 0) || 0}</span>
                <span className="stat-label">Bài học</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{items?.reduce((s, c) => s + (c?.enrolledCount || 0), 0) || 0}</span>
                <span className="stat-label">Đăng ký</span>
              </div>
            </div>
          </div>
          <div className="events-hero-visual">
            <div className="event-categories">
              <div className="category-card"><i className="fas fa-code"></i><h4>Cơ bản</h4><p>Fundamentals</p></div>
              <div className="category-card"><i className="fas fa-bolt"></i><h4>Trung cấp</h4><p>Hands-on</p></div>
              <div className="category-card"><i className="fas fa-rocket"></i><h4>Nâng cao</h4><p>Projects</p></div>
              <div className="category-card"><i className="fas fa-microchip"></i><h4>Hardware</h4><p>Embedded</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="events-filter-section">
        <div className="filter-tabs">
          <button className={`filter-tab ${categoryFilter === 'all' ? 'active' : ''}`} onClick={() => setCategoryFilter('all')}>
            <i className="fas fa-layer-group"></i>
            Tất cả
          </button>
          {['IoT', 'Embedded', 'AI', 'Hardware', 'Communications'].map(cat => (
            <button key={cat} className={`filter-tab ${categoryFilter === cat ? 'active' : ''}`} onClick={() => setCategoryFilter(cat)}>
              <i className="fas fa-tag"></i>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="events-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="event-card" key={`sk-${i}`} aria-hidden="true">
              <div className="event-image skeleton" />
              <div className="event-content">
                <div className="skeleton h-6 w-3/4" style={{ height: 24, width: '75%', borderRadius: 8 }} />
                <div className="skeleton h-4 w-1/2" style={{ height: 16, width: '50%', marginTop: 10, borderRadius: 6 }} />
                <div className="skeleton h-4 w-2/3" style={{ height: 16, width: '66%', marginTop: 8, borderRadius: 6 }} />
                <div className="skeleton h-16 w-full" style={{ height: 64, width: '100%', marginTop: 12, borderRadius: 10 }} />
                <div className="skeleton h-10 w-full" style={{ height: 40, width: '100%', marginTop: 12, borderRadius: 8 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="events-grid"><p style={{ color: "var(--danger)" }}>{error}</p></div>
      )}

      {!loading && !error && (
        <div className="events-grid">
          {filtered.map(course => {
            const isFree = !course.price || course.price <= 0;
            return (
              <div className="event-card" key={course.id}>
                <div className="event-image">
                  {course.image ? (
                    <Image src={course.image} alt={course.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div className="event-image-placeholder"><i className="fas fa-graduation-cap"></i></div>
                  )}
                  <div className="event-category-badge">{course.level}</div>
                  <div className="event-status upcoming">{isFree ? 'Miễn phí' : `${course.price.toLocaleString('vi-VN')} VNĐ`}</div>
                </div>
                <div className="event-content">
                  <div className="event-header">
                    <h3 className="event-title">{course.title}</h3>
                    <div className="event-price">{formatDuration(course.durationMinutes)}</div>
                  </div>
                  <div className="event-meta">
                    <div className="event-meta-item"><i className="fas fa-list"></i><span>{course.lessonsCount} bài học</span></div>
                    <div className="event-meta-item"><i className="fas fa-user"></i><span>{course.enrolledCount} đã đăng ký</span></div>
                  </div>
                  <p className="event-description">{course.description}</p>
                  <button className="btn-register" onClick={() => handleViewDetails(course)}>
                    <i className="fas fa-user-plus"></i>
                    Đăng ký khóa học
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details & Enrollment Modal */}
      {showDetails && selected && (
        <div className="modal" style={{ display: 'block', zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.7)' }} onClick={(e) => { if (e.target === e.currentTarget) { setShowDetails(false); setSelected(null); } }}>
          <div className="modal-content" style={{ maxWidth: '900px', width: '90%', maxHeight: '90vh', overflow: 'auto', borderRadius: '20px', border: 'none', background: 'var(--surface)' }}>
            <button onClick={() => { setShowDetails(false); setSelected(null); }} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '18px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', color: 'var(--text-primary)' }}>×</button>

            {selected.image ? (
              <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
                <Image src={selected.image} alt={selected.title} fill sizes="900px" style={{ objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{ height: '200px', background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem' }}>
                <i className="fas fa-graduation-cap"></i>
              </div>
            )}

            <div style={{ padding: '30px 40px' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>{selected.title}</h1>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
                <span className="news-category-badge">{selected.level}</span>
                <span className="news-source-badge">{formatDuration(selected.durationMinutes)}</span>
                <span className="news-category-badge">{selected.lessonsCount} bài học</span>
              </div>

              <div style={{ marginTop: '20px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{selected.description}</div>

              <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <i className="fas fa-user"></i>
                    <strong>Đã đăng ký</strong>
                  </div>
                  <div style={{ color: 'var(--primary)', fontWeight: 700 }}>{selected.enrolledCount}</div>
                </div>
                <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <i className="fas fa-dollar-sign"></i>
                    <strong>Học phí</strong>
                  </div>
                  <div style={{ color: 'var(--primary)', fontWeight: 700 }}>{(!selected.price || selected.price <= 0) ? 'Miễn phí' : `${selected.price.toLocaleString('vi-VN')} VNĐ`}</div>
                </div>
              </div>

              {/* Enrollment */}
              <div style={{ marginTop: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                <div style={{ padding: '20px 20px 10px 20px' }}>
                  <h3 style={{ margin: 0, color: 'var(--primary)' }}><i className="fas fa-user-plus" style={{ marginRight: 8 }}></i>Đăng ký khóa học</h3>
                </div>
                <div style={{ padding: '0 20px 20px 20px' }}>
                  {!success ? (
                    <form onSubmit={(e) => { e.preventDefault(); submitEnrollment(new FormData(e.currentTarget)); }}>
                      <div className="form-group">
                        <label htmlFor="fullName">Họ và tên *</label>
                        <input id="fullName" name="fullName" required placeholder="VD: Nguyễn Văn A" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input type="email" id="email" name="email" required placeholder="you@example.com" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="phone">Số điện thoại</label>
                        <input id="phone" name="phone" placeholder="0901 234 567" />
                      </div>

                      {/* Payment Information - Only show if course has price > 0 */}
                      {(selected.price ?? 0) > 0 && (
                        <div style={{ marginBottom: '30px' }}>

                          {/* Payment Method Selection */}
                          <div style={{ marginBottom: '20px' }}>
                            <label htmlFor="paymentMethod" style={{ 
                              display: 'block', 
                              marginBottom: '8px', 
                              fontWeight: '600', 
                              color: 'var(--primary)' 
                            }}>
                              Phương thức thanh toán *
                            </label>
                            
                            {/* Custom Payment Method Selector */}
                            <div style={{ position: 'relative' }}>
                              <div 
                                id="payment-selector"
                                style={{
                                  width: '100%',
                                  padding: '15px 20px',
                                  border: '2px solid var(--border)',
                                  borderRadius: '12px',
                                  fontSize: '16px',
                                  background: 'var(--background)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between'
                                }}
                                onClick={() => {
                                  setIsDropdownOpen(!isDropdownOpen);
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  {selectedPaymentMethod === 'ocb' ? (
                                    <>
                                      <img 
                                        src="/payment-logos/ocb-logo.png" 
                                        alt="OCB" 
                                        style={{ width: '20px', height: '20px', marginRight: '8px' }}
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                        }}
                                      />
                                      <span>OCB (Ngân hàng)</span>
                                    </>
                                  ) : selectedPaymentMethod === 'momo' ? (
                                    <>
                                      <img 
                                        src="/payment-logos/momo-logo.png" 
                                        alt="MoMo" 
                                        style={{ width: '20px', height: '20px', marginRight: '8px' }}
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                        }}
                                      />
                                      <span>MoMo</span>
                                    </>
                                  ) : (
                                    <span>Chọn phương thức thanh toán</span>
                                  )}
                                </div>
                                <i className={`fas fa-chevron-${isDropdownOpen ? 'up' : 'down'}`} style={{ color: 'var(--text-secondary)' }}></i>
                              </div>

                              {/* Dropdown Options */}
                              {isDropdownOpen && (
                                <div id="payment-dropdown" style={{
                                  position: 'absolute',
                                  top: '100%',
                                  left: 0,
                                  right: 0,
                                  background: 'var(--surface)',
                                  border: '2px solid var(--border)',
                                  borderRadius: '12px',
                                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                                  zIndex: 1000,
                                  marginTop: '4px',
                                  overflow: 'hidden'
                                }}>
                                  <div 
                                    onClick={() => {
                                      setSelectedPaymentMethod('ocb');
                                      setIsDropdownOpen(false);
                                    }}
                                    style={{
                                      padding: '15px 20px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      borderBottom: '1px solid var(--border)',
                                      transition: 'background-color 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = 'var(--surface-variant)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                  >
                                    <img 
                                      src="/payment-logos/ocb-logo.png" 
                                      alt="OCB" 
                                      style={{ width: '20px', height: '20px', marginRight: '8px' }}
                                    />
                                    <span>OCB (Ngân hàng)</span>
                                  </div>
                                  <div 
                                    onClick={() => {
                                      setSelectedPaymentMethod('momo');
                                      setIsDropdownOpen(false);
                                    }}
                                    style={{
                                      padding: '15px 20px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      transition: 'background-color 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = 'var(--surface-variant)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                  >
                                    <img 
                                      src="/payment-logos/momo-logo.png" 
                                      alt="MoMo" 
                                      style={{ width: '20px', height: '20px', marginRight: '8px' }}
                                    />
                                    <span>MoMo</span>
                                  </div>
                                </div>
                              )}
                              <input type="hidden" name="paymentMethod" value={selectedPaymentMethod} />
                            </div>
                          </div>

                          {/* Transaction ID */}
                          <div style={{ marginBottom: '20px' }}>
                            <label htmlFor="transactionId" style={{ 
                              display: 'block', 
                              marginBottom: '8px', 
                              fontWeight: '600', 
                              color: 'var(--primary)' 
                            }}>
                              Mã giao dịch *
                            </label>
                            <input 
                              type="text" 
                              id="transactionId" 
                              name="transactionId" 
                              required 
                              style={{
                                width: '100%',
                                padding: '15px 20px',
                                border: '2px solid var(--border)',
                                borderRadius: '12px',
                                fontSize: '16px',
                                background: 'var(--background)'
                              }}
                              placeholder="Nhập mã giao dịch sau khi thanh toán thành công"
                            />
                            <small style={{ 
                              color: 'var(--text-secondary)', 
                              fontSize: '14px', 
                              marginTop: '6px', 
                              display: 'block' 
                            }}>
                              Sau khi chuyển khoản thành công, vui lòng nhập mã giao dịch để xác thực
                            </small>
                          </div>

                          {/* Payment Instructions */}
                          <div style={{ 
                            background: 'linear-gradient(135deg, var(--surface-variant), var(--surface))',
                            border: '2px solid var(--border)',
                            borderRadius: '16px',
                            padding: '24px',
                            marginBottom: '20px'
                          }}>
                            <h4 style={{ 
                              fontSize: '1.1rem', 
                              fontWeight: '600', 
                              color: 'var(--primary)', 
                              margin: '0 0 20px',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <i className="fas fa-qrcode" style={{ marginRight: '10px', color: 'var(--accent)' }}></i>
                              Hướng dẫn thanh toán
                            </h4>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'center' }}>
                              <div>
                                {selectedPaymentMethod === 'ocb' && (
                                  <>
                                    <div style={{ marginBottom: '12px' }}>
                                      <strong style={{ color: 'var(--primary)', fontSize: '15px' }}>🏦 Thông tin ngân hàng OCB:</strong>
                                    </div>
                                    <div style={{ 
                                      background: 'var(--background)', 
                                      padding: '16px', 
                                      borderRadius: '12px',
                                      border: '1px solid var(--border)'
                                    }}>
                                      <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                                        <strong>Ngân hàng:</strong> TMCP Phương Đông (OCB)
                                      </p>
                                      <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                                        <strong>Số tài khoản:</strong> <span style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>0004100026206005</span>
                                      </p>
                                      <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                                        <strong>Chủ tài khoản:</strong> Nguyen Phuong Nam
                                      </p>
                                      <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                                        <strong>Số tiền:</strong> <span style={{ color: 'var(--accent)', fontWeight: '600' }}>{(selected.price ?? 0).toLocaleString('vi-VN')} VNĐ</span>
                                      </p>
                                      <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                                        <strong>Nội dung chuyển:</strong> <span style={{ fontFamily: 'monospace', background: 'var(--surface-variant)', padding: '4px 8px', borderRadius: '4px' }}>DK {selected.title.substring(0, 20)}...</span>
                                      </p>
                                      <p style={{ margin: '0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                        <em>Ví dụ: DK Khóa học IoT - Nguyễn Văn A</em>
                                      </p>
                                    </div>
                                  </>
                                )}
                                {selectedPaymentMethod === 'momo' && (
                                  <>
                                    <div style={{ marginBottom: '12px' }}>
                                      <strong style={{ color: 'var(--primary)', fontSize: '15px' }}>📱 Thông tin MoMo:</strong>
                                    </div>
                                    <div style={{ 
                                      background: 'var(--background)', 
                                      padding: '16px', 
                                      borderRadius: '12px',
                                      border: '1px solid var(--border)'
                                    }}>
                                      <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                                        <strong>Số điện thoại:</strong> <span style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>0339830128</span>
                                      </p>
                                      <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                                        <strong>Chủ tài khoản:</strong> Nguyen Phuong Nam
                                      </p>
                                      <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                                        <strong>Số tiền:</strong> <span style={{ color: 'var(--accent)', fontWeight: '600' }}>{(selected.price ?? 0).toLocaleString('vi-VN')} VNĐ</span>
                                      </p>
                                      <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                                        <strong>Nội dung chuyển:</strong> <span style={{ fontFamily: 'monospace', background: 'var(--surface-variant)', padding: '4px 8px', borderRadius: '4px' }}>DK {selected.title.substring(0, 20)}...</span>
                                      </p>
                                      <p style={{ margin: '0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                        <em>Ví dụ: DK Khóa học IoT - Nguyễn Văn A</em>
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ 
                                  background: 'var(--background)', 
                                  padding: '16px', 
                                  borderRadius: '12px',
                                  border: '1px solid var(--border)',
                                  display: 'inline-block'
                                }}>
                                  <img
                                    src={`/payment-logos/${selectedPaymentMethod === 'ocb' ? 'ocb-qr.jpg' : 'momo-qr.jpg'}`}
                                    alt={`QR ${selectedPaymentMethod === 'ocb' ? 'OCB' : 'MoMo'}`}
                                    style={{ 
                                      width: '160px', 
                                      height: '160px', 
                                      objectFit: 'contain', 
                                      borderRadius: '8px',
                                      border: '1px solid var(--border)'
                                    }}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const parent = target.parentElement;
                                      if (parent) {
                                        parent.innerHTML = '<p style="color: var(--text-muted); padding: 20px;">QR Code không khả dụng</p>';
                                      }
                                    }}
                                  />
                                </div>
                                <p style={{ 
                                  margin: '8px 0 0', 
                                  fontSize: '12px', 
                                  color: 'var(--text-secondary)',
                                  fontWeight: '600'
                                }}>
                                  {selectedPaymentMethod === 'ocb' 
                                    ? 'Quét mã bằng app OCB hoặc ngân hàng hỗ trợ'
                                    : 'Quét mã bằng app MoMo'
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {error && <div className="error-message"><i className="fas fa-exclamation-triangle"></i><span>{error}</span></div>}
                      <button type="submit" className="btn-register" disabled={submitting}>
                        {submitting ? (<><i className="fas fa-spinner fa-spin"></i> Đang xử lý...</>) : (<><i className="fas fa-check"></i> Xác nhận đăng ký</>)}
                      </button>
                    </form>
                  ) : (
                    <div className="success-message">
                      <div className="success-icon"><i className="fas fa-check-circle"></i></div>
                      {paymentStatus === 'pending_verification' ? (
                        <>
                          <h3>⏳ Đang xử lý đăng ký!</h3>
                          <p>Chúng tôi đã nhận được thông tin đăng ký và mã giao dịch của bạn.</p>
                          <p><strong>Trạng thái:</strong> Đang chờ xác thực thanh toán từ admin (24-48 giờ làm việc)</p>
                          <p>Bạn sẽ nhận được email xác nhận chính thức sau khi giao dịch được xác thực thành công.</p>
                        </>
                      ) : (
                        <>
                          <h3>🎉 Đăng ký thành công!</h3>
                          <p>Chúng tôi đã gửi xác nhận đến email của bạn.</p>
                        </>
                      )}
                      <button className="btn-primary" onClick={() => { setSuccess(false); setShowDetails(false); }}>
                        Đóng
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


