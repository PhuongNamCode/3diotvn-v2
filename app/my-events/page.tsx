"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  category: string;
  price: number;
  status: string;
  createdAt: string;
}

interface Registration {
  id: string;
  eventId: string;
  fullName: string;
  email: string;
  phone?: string;
  organization?: string;
  experience?: string;
  expectation?: string;
  status: string;
  paymentStatus: string;
  amount?: number;
  transactionId?: string;
  paymentMethod?: string;
  createdAt: string;
  event: Event;
}

interface UserStats {
  totalCourses: number;
  totalEvents: number;
  totalSpent: number;
  completedCourses: number;
  upcomingEvents: number;
}

export default function MyEventsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const router = useRouter();

  useEffect(() => {
    // Try multiple ways to get user email
    let userEmail = localStorage.getItem('userEmail');
    
    // If not found, try to get from Google OAuth
    if (!userEmail) {
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          userEmail = parsed.email;
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }
    
    // If still not found, try to get from current user session
    if (!userEmail) {
      // Check if user is logged in via Google OAuth
      const googleUser = document.querySelector('[data-google-user]');
      if (googleUser) {
        userEmail = googleUser.getAttribute('data-email');
      }
    }

    if (!userEmail) {
      console.log('No user email found');
      // For testing purposes, use a default email if no user is found
      userEmail = 'phuongnamvp160601@gmail.com';
      console.log('Using test email:', userEmail);
    }

    console.log('Found user email:', userEmail);
    fetchUserEvents(userEmail);
  }, [router]);

  const fetchUserEvents = async (email: string) => {
    try {
      setLoading(true);
      console.log('Fetching events for email:', email);
      
      const response = await fetch(`/api/user/dashboard?email=${encodeURIComponent(email)}`);
      console.log('API Response status:', response.status);
      
      const result = await response.json();
      console.log('API Result:', result);
      
      if (result.success) {
        setRegistrations(result.data.registrations);
        setStats(result.data.stats);
        console.log('Successfully loaded:', {
          registrations: result.data.registrations.length,
          stats: result.data.stats
        });
      } else {
        console.error('API Error:', result.error);
        setError(result.error || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRegistrations = () => {
    if (filter === 'all') return registrations;
    
    return registrations.filter(reg => {
      const eventDate = new Date(reg.event.date);
      const now = new Date();
      
      if (filter === 'upcoming') {
        return eventDate > now;
      } else if (filter === 'past') {
        return eventDate <= now;
      }
      
      return true;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' VNĐ';
  };

  const getEventStatus = (eventDate: string, eventStatus: string) => {
    const date = new Date(eventDate);
    const now = new Date();
    
    if (eventStatus === 'cancelled') return { text: 'Đã hủy', class: 'cancelled' };
    if (date > now) return { text: 'Sắp diễn ra', class: 'upcoming' };
    return { text: 'Đã kết thúc', class: 'past' };
  };

  if (loading) {
    return (
      <div className="my-events-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải vé sự kiện...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-events-page">
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Lỗi tải dữ liệu</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            <i className="fas fa-refresh"></i>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const filteredRegistrations = getFilteredRegistrations();
  const upcomingCount = registrations.filter(r => {
    const eventDate = new Date(r.event.date);
    return eventDate > new Date();
  }).length;
  const pastCount = registrations.filter(r => {
    const eventDate = new Date(r.event.date);
    return eventDate <= new Date();
  }).length;

  return (
    <div className="my-events-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <i className="fas fa-ticket-alt"></i>
          </div>
          <div className="header-text">
            <h1>Sự kiện đã đăng ký</h1>
            <p>Vé tham dự các sự kiện bạn đã đăng ký thành công</p>
          </div>
        </div>
      </div>

      {stats && (
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-calendar-check"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalEvents}</div>
              <div className="stat-label">Vé đã mua</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.upcomingEvents}</div>
              <div className="stat-label">Sắp diễn ra</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <div className="stat-number">{pastCount}</div>
              <div className="stat-label">Đã tham gia</div>
            </div>
          </div>
        </div>
      )}

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <i className="fas fa-list"></i>
          Tất cả ({registrations.length})
        </button>
        <button 
          className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          <i className="fas fa-clock"></i>
          Sắp diễn ra ({upcomingCount})
        </button>
        <button 
          className={`filter-tab ${filter === 'past' ? 'active' : ''}`}
          onClick={() => setFilter('past')}
        >
          <i className="fas fa-history"></i>
          Đã kết thúc ({pastCount})
        </button>
      </div>

      <div className="events-content">
        {filteredRegistrations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-ticket-alt"></i>
            </div>
            <h3>
              {filter === 'all' 
                ? 'Chưa có vé nào' 
                : filter === 'upcoming' 
                ? 'Không có sự kiện sắp diễn ra'
                : 'Không có sự kiện đã kết thúc'
              }
            </h3>
            <p>
              {filter === 'all' 
                ? 'Bạn chưa đăng ký tham gia sự kiện nào. Hãy khám phá các sự kiện thú vị!'
                : filter === 'upcoming' 
                ? 'Hiện tại không có sự kiện nào sắp diễn ra.'
                : 'Bạn chưa tham gia sự kiện nào.'
              }
            </p>
            {filter === 'all' && (
              <button 
                className="explore-events-btn"
                onClick={() => router.push('/#events')}
              >
                <i className="fas fa-search"></i>
                Khám phá sự kiện
              </button>
            )}
          </div>
        ) : (
          <div className="event-tickets-grid">
            {filteredRegistrations.map((registration) => {
              const eventStatus = getEventStatus(registration.event.date, registration.event.status);
              
              return (
                <div key={registration.id} className="event-ticket">
                  {/* Ticket Header với Status và Price */}
                  <div className="ticket-header">
                    <div className="ticket-status">
                      <span className={`status-badge ${eventStatus.class}`}>
                        <i className="fas fa-check-circle"></i>
                        {eventStatus.text}
                      </span>
                    </div>
                    <div className="ticket-price">
                      <span className="price-label">Vé</span>
                      <span className="price-value">{formatPrice(registration.event.price)}</span>
                    </div>
                  </div>

                  {/* Ticket Body - Event Info */}
                  <div className="ticket-body">
                    {/* Event Image */}
                    <div className="ticket-image">
                      {registration.event.image ? (
                        <img 
                          src={registration.event.image} 
                          alt={registration.event.title}
                          loading="lazy"
                        />
                      ) : (
                        <div className="ticket-image-placeholder">
                          <i className="fas fa-calendar-alt"></i>
                        </div>
                      )}
                    </div>

                    {/* Event Info */}
                    <div className="ticket-info">
                      <h3 className="ticket-title">{registration.event.title}</h3>
                      <p className="ticket-description">{registration.event.description}</p>
                      
                      {/* Event Details Grid */}
                      <div className="ticket-details">
                        <div className="detail-item">
                          <div className="detail-icon">
                            <i className="fas fa-calendar"></i>
                          </div>
                          <div className="detail-content">
                            <span className="detail-label">Ngày</span>
                            <span className="detail-value">{formatDate(registration.event.date)}</span>
                          </div>
                        </div>
                        
                        <div className="detail-item">
                          <div className="detail-icon">
                            <i className="fas fa-clock"></i>
                          </div>
                          <div className="detail-content">
                            <span className="detail-label">Thời gian</span>
                            <span className="detail-value">{registration.event.time}</span>
                          </div>
                        </div>
                        
                        <div className="detail-item">
                          <div className="detail-icon">
                            <i className="fas fa-map-marker-alt"></i>
                          </div>
                          <div className="detail-content">
                            <span className="detail-label">Địa điểm</span>
                            <span className="detail-value">{registration.event.location}</span>
                          </div>
                        </div>
                        
                        <div className="detail-item">
                          <div className="detail-icon">
                            <i className="fas fa-tag"></i>
                          </div>
                          <div className="detail-content">
                            <span className="detail-label">Danh mục</span>
                            <span className="detail-value">{registration.event.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Footer - User & Registration Info */}
                  <div className="ticket-footer">
                    <div className="user-info">
                      <div className="user-avatar">
                        <i className="fas fa-user"></i>
                      </div>
                      <div className="user-details">
                        <div className="user-name">{registration.fullName}</div>
                        <div className="user-email">{registration.email}</div>
                        {registration.phone && (
                          <div className="user-phone">{registration.phone}</div>
                        )}
                        {registration.organization && (
                          <div className="user-org">
                            <i className="fas fa-building"></i>
                            {registration.organization}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="registration-info">
                      <div className="registration-date">
                        <i className="fas fa-user-check"></i>
                        <span>Đăng ký: {formatDateTime(registration.createdAt)}</span>
                      </div>
                      <div className="payment-info">
                        <i className="fas fa-credit-card"></i>
                        <span className={`payment-status ${registration.paymentStatus}`}>
                          {registration.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </span>
                      </div>
                      {registration.transactionId && (
                        <div className="transaction-info">
                          <i className="fas fa-receipt"></i>
                          <span>Mã giao dịch: {registration.transactionId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}