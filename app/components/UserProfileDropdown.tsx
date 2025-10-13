'use client';

import React, { useState, useEffect, useRef } from 'react';

interface User {
  name: string;
  email: string;
  picture: string;
  id: string;
}

interface UserStats {
  totalCourses: number;
  totalEvents: number;
  totalSpent: number;
  completedCourses: number;
  upcomingEvents: number;
}

interface UserProfileDropdownProps {
  user: User;
  onLogout: () => void;
}

export default function UserProfileDropdown({ user, onLogout }: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user stats
  const fetchUserStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user/dashboard?email=${encodeURIComponent(user.email)}`);
      const result = await response.json();
      if (result.success) {
        setStats(result.data.stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats when dropdown opens
  useEffect(() => {
    if (isOpen && !stats && !loading) {
      fetchUserStats();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuClick = (action: string) => {
    setIsOpen(false);
    
    switch (action) {
      case 'my-courses':
        window.location.href = '/my-courses';
        break;
      case 'my-events':
        window.location.href = '/my-events';
        break;
      case 'logout':
        onLogout();
        break;
    }
  };

  return (
    <div className="user-profile-dropdown" ref={dropdownRef}>
      {/* Profile Trigger */}
      <div 
        className="user-profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img 
          src={user.picture || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNmM2Y0ZjYiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik04IDhDOS4xMDQ1NyA4IDEwIDcuMTA0NTcgMTAgNkMxMCA0Ljg5NTQzIDkuMTA0NTcgNCA4IDRDNi44OTU0MyA0IDYgNC44OTU0MyA2IDZDNiA3LjEwNDU3IDYuODk1NDMgOCA4IDhaIiBmaWxsPSIjNjY3Nzg4Ii8+CjxwYXRoIGQ9Ik0xMiAxMkMxMiAxMC44OTU0IDExLjEwNDYgMTAgMTAgMTBINkM0Ljg5NTQzIDEwIDQgMTAuODk1NCA0IDEyVjEzSDEyVjEyWiIgZmlsbD0iIzY2Nzc4OCIvPgo8L3N2Zz4KPC9zdmc+"}
          alt="User Avatar" 
          className="user-avatar" 
        />
        <span className="user-name">{user.name}</span>
        <i className={`fas fa-chevron-down dropdown-arrow ${isOpen ? 'open' : ''}`}></i>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="dropdown-menu">
          {/* User Info Header */}
          <div className="dropdown-header">
            <div className="user-info">
              <img 
                src={user.picture || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNmM2Y0ZjYiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik04IDhDOS4xMDQ1NyA4IDEwIDcuMTA0NTcgMTAgNkMxMCA0Ljg5NTQzIDkuMTA0NTcgNCA4IDRDNi44OTU0MyA0IDYgNC44OTU0MyA2IDZDNiA3LjEwNDU3IDYuODk1NDMgOCA4IDhaIiBmaWxsPSIjNjY3Nzg4Ii8+CjxwYXRoIGQ9Ik0xMiAxMkMxMiAxMC44OTU0IDExLjEwNDYgMTAgMTAgMTBINkM0Ljg5NTQzIDEwIDQgMTAuODk1NCA0IDEyVjEzSDEyVjEyWiIgZmlsbD0iIzY2Nzc4OCIvPgo8L3N2Zz4KPC9zdmc+"}
                alt="User Avatar" 
                className="header-avatar" 
              />
              <div className="user-details">
                <h4 className="user-display-name">{user.name}</h4>
                <p className="user-email">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          {stats && (
            <div className="dropdown-stats">
              <div className="stat-item">
                <div className="stat-icon">
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.totalCourses}</span>
                  <span className="stat-label">Khóa học</span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.totalEvents}</span>
                  <span className="stat-label">Sự kiện</span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <i className="fas fa-trophy"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.completedCourses}</span>
                  <span className="stat-label">Hoàn thành</span>
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="dropdown-items">
            <div 
              className="dropdown-item"
              onClick={() => handleMenuClick('my-courses')}
            >
              <div className="item-icon">
                <i className="fas fa-book"></i>
              </div>
              <div className="item-content">
                <span className="item-title">Khóa học của tôi</span>
                <span className="item-subtitle">Quản lý và học tập</span>
              </div>
              <div className="item-badge">
                {stats ? stats.totalCourses : 0}
              </div>
            </div>

            <div 
              className="dropdown-item"
              onClick={() => handleMenuClick('my-events')}
            >
              <div className="item-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="item-content">
                <span className="item-title">Sự kiện đã tham gia</span>
                <span className="item-subtitle">Lịch sử sự kiện</span>
              </div>
              <div className="item-badge">
                {stats ? stats.totalEvents : 0}
              </div>
            </div>

            <div className="dropdown-divider"></div>

            <div 
              className="dropdown-item logout-item"
              onClick={() => handleMenuClick('logout')}
            >
              <div className="item-icon">
                <i className="fas fa-sign-out-alt"></i>
              </div>
              <div className="item-content">
                <span className="item-title">Đăng xuất</span>
                <span className="item-subtitle">Thoát tài khoản</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
