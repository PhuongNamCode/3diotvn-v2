'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  name: string;
  email: string;
  picture: string;
  id: string;
}

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
  status: string;
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
  const [user, setUser] = useState<User | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      try {
        const saved = localStorage.getItem('user');
        if (saved) {
          const parsed = JSON.parse(saved) as User;
          setUser(parsed);
          fetchUserEvents(parsed.email);
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

  const fetchUserEvents = async (email: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/dashboard?email=${encodeURIComponent(email)}`);
      const result = await response.json();

      if (result.success) {
        setRegistrations(result.data.registrations);
        setStats(result.data.stats);
      } else {
        setError(result.error || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const isEventUpcoming = (dateString: string) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    return eventDate > now;
  };

  const isEventPast = (dateString: string) => {
    return !isEventUpcoming(dateString);
  };

  const getFilteredRegistrations = () => {
    switch (filter) {
      case 'upcoming':
        return registrations.filter(r => isEventUpcoming(r.event.date));
      case 'past':
        return registrations.filter(r => isEventPast(r.event.date));
      default:
        return registrations;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="status-badge confirmed">Đã xác nhận</span>;
      case 'attended':
        return <span className="status-badge attended">Đã tham gia</span>;
      case 'cancelled':
        return <span className="status-badge cancelled">Đã hủy</span>;
      default:
        return <span className="status-badge pending">Chờ xử lý</span>;
    }
  };

  const getEventStatusBadge = (event: Event) => {
    if (isEventPast(event.date)) {
      return <span className="event-status past">Đã kết thúc</span>;
    } else if (isEventUpcoming(event.date)) {
      return <span className="event-status upcoming">Sắp diễn ra</span>;
    } else {
      return <span className="event-status live">Đang diễn ra</span>;
    }
  };

  if (loading) {
    return (
      <div className="my-events-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải sự kiện của bạn...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-events-page">
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

  const filteredRegistrations = getFilteredRegistrations();

  return (
    <div className="my-events-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>Sự kiện đã tham gia</h1>
            <p>Lịch sử và quản lý các sự kiện bạn đã đăng ký</p>
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
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.totalEvents}</h3>
                  <p>Tổng sự kiện</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.upcomingEvents}</h3>
                  <p>Sắp diễn ra</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="stat-content">
                  <h3>{registrations.filter(r => r.status === 'attended').length}</h3>
                  <p>Đã tham gia</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-ticket-alt"></i>
                </div>
                <div className="stat-content">
                  <h3>{registrations.filter(r => r.status === 'confirmed').length}</h3>
                  <p>Đã xác nhận</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="filter-section">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Tất cả ({registrations.length})
            </button>
            <button 
              className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilter('upcoming')}
            >
              Sắp diễn ra ({registrations.filter(r => isEventUpcoming(r.event.date)).length})
            </button>
            <button 
              className={`filter-tab ${filter === 'past' ? 'active' : ''}`}
              onClick={() => setFilter('past')}
            >
              Đã kết thúc ({registrations.filter(r => isEventPast(r.event.date)).length})
            </button>
          </div>
        </div>

        {/* Events List */}
        <div className="events-section">
          {filteredRegistrations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-calendar-times"></i>
              </div>
              <h3>Không có sự kiện</h3>
              <p>
                {filter === 'upcoming' 
                  ? 'Bạn chưa đăng ký sự kiện nào sắp diễn ra.'
                  : filter === 'past'
                  ? 'Bạn chưa tham gia sự kiện nào.'
                  : 'Bạn chưa đăng ký sự kiện nào.'
                }
              </p>
              <button 
                onClick={() => router.push('/')} 
                className="btn-primary"
              >
                <i className="fas fa-calendar-plus"></i>
                Khám phá sự kiện
              </button>
            </div>
          ) : (
            <div className="events-list">
              {filteredRegistrations.map((registration) => (
                <div key={registration.id} className="event-card">
                  <div className="event-image">
                    {registration.event.image ? (
                      <img src={registration.event.image} alt={registration.event.title} />
                    ) : (
                      <div className="event-placeholder">
                        <i className="fas fa-calendar-alt"></i>
                      </div>
                    )}
                    <div className="event-overlay">
                      {getStatusBadge(registration.status)}
                      {getEventStatusBadge(registration.event)}
                    </div>
                  </div>
                  
                  <div className="event-content">
                    <div className="event-header">
                      <h3 className="event-title">{registration.event.title}</h3>
                      <span className="event-category">{registration.event.category}</span>
                    </div>
                    
                    <p className="event-description">
                      {registration.event.description.length > 150 
                        ? `${registration.event.description.substring(0, 150)}...`
                        : registration.event.description
                      }
                    </p>
                    
                    <div className="event-meta">
                      <div className="meta-item">
                        <i className="fas fa-calendar"></i>
                        <span>{formatDate(registration.event.date)}</span>
                      </div>
                      <div className="meta-item">
                        <i className="fas fa-clock"></i>
                        <span>{formatTime(registration.event.time)}</span>
                      </div>
                      <div className="meta-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{registration.event.location}</span>
                      </div>
                    </div>
                    
                    <div className="event-footer">
                      <div className="event-price">
                        {formatPrice(registration.event.price)}
                      </div>
                      <div className="registration-info">
                        <span className="registration-date">
                          Đăng ký: {formatDate(registration.createdAt)}
                        </span>
                      </div>
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
