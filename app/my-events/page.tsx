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
          <div className="header-text">
            <h1>Sự kiện đã đăng ký</h1>
            <p>Vé tham dự các sự kiện bạn đã đăng ký thành công</p>
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
          <div className="elegant-tickets-grid">
            {filteredRegistrations.map((registration) => {
              const eventStatus = getEventStatus(registration.event.date, registration.event.status);
              const eventDate = new Date(registration.event.date);
              const isUpcoming = eventDate > new Date();
              
              return (
                <div key={registration.id} className="elegant-ticket">
                  {/* Ticket Header - Gradient Background */}
                  <div className="ticket-header-elegant">
                    <div className="header-pattern"></div>
                    <div className="header-content">
                      <div className="ticket-number">
                        <span className="ticket-id">#{registration.id.slice(-8).toUpperCase()}</span>
                      </div>
                      <div className={`ticket-status-elegant ${eventStatus.class}`}>
                        <div className="status-indicator"></div>
                        <span className="status-text">{eventStatus.text}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Body - Main Content */}
                  <div className="ticket-body-elegant">
                    {/* Event Title */}
                    <div className="event-title-section">
                      <h3 className="event-title">{registration.event.title}</h3>
                      <div className="event-category">{registration.event.category}</div>
                    </div>

                    {/* Participant Info */}
                    <div className="participant-section">
                      <div className="participant-label">Người tham dự</div>
                      <div className="participant-name">{registration.fullName}</div>
                    </div>

                    {/* Event Date */}
                    <div className="event-date-section">
                      <div className="date-label">Ngày tổ chức</div>
                      <div className="date-content">
                        <div className="date-main">{formatDate(registration.event.date)}</div>
                        <div className="time-main">{registration.event.time}</div>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Footer - Simple */}
                  <div className="ticket-footer-elegant">
                    <div className="footer-pattern"></div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="ticket-decoration">
                    <div className="corner-decoration top-left"></div>
                    <div className="corner-decoration top-right"></div>
                    <div className="corner-decoration bottom-left"></div>
                    <div className="corner-decoration bottom-right"></div>
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