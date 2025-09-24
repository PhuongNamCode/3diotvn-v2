"use client";

import { useEffect, useRef, useState } from "react";
import AdminLoginTab from "./tabs/AdminLoginTab";
import AdminOverviewTab from "./tabs/AdminOverviewTab";
import AdminEventsTab from "./tabs/AdminEventsTab";
import AdminUsersTab from "./tabs/AdminUsersTab";
import AdminRegistrationsTab from "./tabs/AdminRegistrationsTab";
import AdminContactsTab from "./tabs/AdminContactsTab";
import AdminAnalyticsTab from "./tabs/AdminAnalyticsTab";
import AdminSettingsTab from "./tabs/AdminSettingsTab";
import { websocketManager } from "@/lib/websocket";
import RealTimeStatus from "../components/RealTimeStatus";
import "./admin.css";

type AdminUser = {
  name: string;
  email: string;
  role: string;
  avatar: string;
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [currentTab, setCurrentTab] = useState<'overview' | 'analytics' | 'events' | 'registrations' | 'contacts' | 'users' | 'settings'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const saved = localStorage.getItem('adminUser');
        if (saved) {
          const adminData = JSON.parse(saved);
          setCurrentAdmin(adminData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking admin auth:', error);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Theme management
  useEffect(() => {
    let currentTheme = localStorage.getItem('adminTheme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    const lightIcon = document.getElementById('lightIcon');
    const darkIcon = document.getElementById('darkIcon');
    
    function updateThemeIcons() {
      if (!lightIcon || !darkIcon) return;
      if (currentTheme === 'light') {
        lightIcon.classList.add('active');
        darkIcon.classList.remove('active');
      } else {
        darkIcon.classList.add('active');
        lightIcon.classList.remove('active');
      }
    }
    updateThemeIcons();

    function toggleTheme() {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', currentTheme);
      localStorage.setItem('adminTheme', currentTheme);
      updateThemeIcons();
    }

    // Attach theme toggle
    const themeToggle = document.getElementById('themeToggle');
    themeToggle?.addEventListener('click', toggleTheme);

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    
    function toggleMobileMenu() {
      sidebar?.classList.toggle('open');
      overlay?.classList.toggle('active');
    }
    
    function closeMobileMenu() {
      sidebar?.classList.remove('open');
      overlay?.classList.remove('active');
    }
    
    mobileMenuBtn?.addEventListener('click', toggleMobileMenu);
    overlay?.addEventListener('click', closeMobileMenu);

    // Notification system
    function showNotification(message: string, type: 'success'|'error'|'info'|'warning' = 'success') {
      const notification = document.createElement('div');
      notification.className = `toast ${type}`;
      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
          <span>${message}</span>
        </div>
      `;
      
      document.body.appendChild(notification);
      setTimeout(() => notification.classList.add('show'), 100);
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }

    // Make showNotification globally available
    (window as any).showNotification = showNotification;
    
    // Make switchToRegistrationsTab globally available
    (window as any).switchToRegistrationsTab = () => {
      setCurrentTab('registrations');
    };
    
    // Initialize WebSocket manager
    (window as any).websocketManager = websocketManager;

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 't') {
        e.preventDefault();
        toggleTheme();
      }
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    });

    return () => {
      themeToggle?.removeEventListener('click', toggleTheme);
      mobileMenuBtn?.removeEventListener('click', toggleMobileMenu);
      overlay?.removeEventListener('click', closeMobileMenu);
    };
  }, []);

  const handleLogin = (adminData: AdminUser) => {
    setCurrentAdmin(adminData);
    setIsAuthenticated(true);
    localStorage.setItem('adminUser', JSON.stringify(adminData));
    (window as any).showNotification('Đăng nhập admin thành công!', 'success');
  };

  const handleLogout = () => {
    setCurrentAdmin(null);
    setIsAuthenticated(false);
    localStorage.removeItem('adminUser');
    (window as any).showNotification('Đã đăng xuất admin!', 'info');
  };

  const switchTab = (tabName: 'overview' | 'analytics' | 'events' | 'registrations' | 'users' | 'settings') => {
    setCurrentTab(tabName);
    // Close mobile menu if open
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    sidebar?.classList.remove('open');
    overlay?.classList.remove('active');
  };

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginTab onLogin={handleLogin} />;
  }

  return (
    <>
      <div className="admin-dashboard">
        {/* Sidebar */}
        <div className="admin-sidebar" id="sidebar">
          <div className="sidebar-header">
            <a href="#" className="sidebar-logo">
              <div className="sidebar-logo-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <span>3DIoT Admin</span>
            </a>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section">
              <div className="nav-section-title">Dashboard</div>
              <button 
                className={`nav-item ${currentTab === 'overview' ? 'active' : ''}`}
                onClick={() => switchTab('overview')}
              >
                <i className="fas fa-chart-line"></i>
                <span>Tổng quan</span>
              </button>
              <button 
                className={`nav-item ${currentTab === 'analytics' ? 'active' : ''}`}
                onClick={() => switchTab('analytics')}
              >
                <i className="fas fa-chart-pie"></i>
                <span>Phân tích</span>
              </button>
            </div>

            <div className="nav-section">
              <div className="nav-section-title">Quản lý</div>
              <button 
                className={`nav-item ${currentTab === 'events' ? 'active' : ''}`}
                onClick={() => switchTab('events')}
              >
                <i className="fas fa-calendar-alt"></i>
                <span>Sự kiện</span>
              </button>
              <button 
                className={`nav-item ${currentTab === 'registrations' ? 'active' : ''}`}
                onClick={() => switchTab('registrations')}
              >
                <i className="fas fa-user-check"></i>
                <span>Đăng ký</span>
              </button>
              <button 
                className={`nav-item ${currentTab === 'contacts' ? 'active' : ''}`}
                onClick={() => switchTab('contacts')}
              >
                <i className="fas fa-address-book"></i>
                <span>Liên hệ & Hợp tác</span>
              </button>
              <button 
                className={`nav-item ${currentTab === 'users' ? 'active' : ''}`}
                onClick={() => switchTab('users')}
              >
                <i className="fas fa-users"></i>
                <span>Người dùng</span>
              </button>
            </div>

            <div className="nav-section">
              <div className="nav-section-title">Hệ thống</div>
              <button 
                className={`nav-item ${currentTab === 'settings' ? 'active' : ''}`}
                onClick={() => switchTab('settings')}
              >
                <i className="fas fa-cog"></i>
                <span>Cài đặt</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Overlay */}
        <div className="mobile-overlay" id="mobileOverlay"></div>

        {/* Main Content */}
        <div className="admin-main-content">
          {/* Top Bar */}
          <div className="admin-top-bar">
            <div className="top-bar-left">
              <button className="mobile-menu-btn" id="mobileMenuBtn">
                <i className="fas fa-bars"></i>
              </button>
              <div>
                <h1 className="page-title">
                  {currentTab === 'overview' && 'Tổng quan'}
                  {currentTab === 'analytics' && 'Phân tích chi tiết'}
                  {currentTab === 'events' && 'Quản lý sự kiện'}
                  {currentTab === 'users' && 'Quản lý người dùng'}
                  {currentTab === 'settings' && 'Cài đặt hệ thống'}
                </h1>
                <p className="page-subtitle">Admin Dashboard - 3DIoT Management System</p>
              </div>
            </div>

            <div className="top-bar-right">
              <div className="theme-toggle" id="themeToggle" title="Chuyển đổi theme">
                <div className="theme-icon active" id="lightIcon">
                  <i className="fas fa-sun"></i>
                </div>
                <div className="theme-icon" id="darkIcon">
                  <i className="fas fa-moon"></i>
                </div>
              </div>

              <div className="admin-profile">
                <div className="admin-avatar">
                  {currentAdmin?.avatar ? (
                    <img src={currentAdmin.avatar} alt="Admin Avatar" />
                  ) : (
                    <span>{currentAdmin?.name?.charAt(0) || 'A'}</span>
                  )}
                </div>
                <div className="admin-info">
                  <div className="admin-name">{currentAdmin?.name || 'Admin'}</div>
                  <div className="admin-role">{currentAdmin?.role || 'Super Admin'}</div>
                </div>
                <button className="logout-btn" onClick={handleLogout} title="Đăng xuất">
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="admin-dashboard-content">
            {currentTab === 'overview' && <AdminOverviewTab />}
            {currentTab === 'analytics' && <AdminAnalyticsTab />}
            {currentTab === 'events' && <AdminEventsTab />}
            {currentTab === 'registrations' && <AdminRegistrationsTab />}
            {currentTab === 'contacts' && <AdminContactsTab />}
            {currentTab === 'users' && <AdminUsersTab />}
            {currentTab === 'settings' && <AdminSettingsTab />}
          </div>
        </div>
        
        {/* Real-time Status Indicator */}
        <RealTimeStatus />
      </div>
    </>
  );
}
