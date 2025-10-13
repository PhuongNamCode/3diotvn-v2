'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  name: string;
  email: string;
  picture: string;
  id: string;
}


interface UserProfileDropdownProps {
  user: User;
  onLogout: () => void;
}

export default function UserProfileDropdown({ user, onLogout }: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Check dark theme on mount
  useEffect(() => {
    const checkDarkTheme = () => {
      setIsDarkTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
    };
    
    checkDarkTheme();
    
    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkTheme);
    
    return () => mediaQuery.removeEventListener('change', checkDarkTheme);
  }, []);


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
        router.push('/my-courses');
        break;
      case 'my-events':
        router.push('/my-events');
        break;
      case 'logout':
        console.log('Logout clicked'); // Debug log
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
        <span 
          className="user-name"
          style={{
            color: isDarkTheme ? '#ffffff' : 'var(--text-primary)'
          }}
        >
          {user.name}
        </span>
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
            </div>

            <div 
              className="dropdown-item"
              onClick={() => handleMenuClick('my-events')}
            >
              <div className="item-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="item-content">
                <span className="item-title">Sự kiện đã đăng ký</span>
                <span className="item-subtitle">Tất cả sự kiện đã đăng ký thành công</span>
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
