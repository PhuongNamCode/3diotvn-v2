"use client";

import { useEffect, useRef, useState } from "react";
import HomeTab from "./tabs/HomeTab";
import EventsTab from "./tabs/EventsTab";
import ContactTab from "./tabs/ContactTab";
import NewsTab from "./tabs/NewsTab";
import LoginTab from "./tabs/LoginTab";
import { jwtDecode } from "jwt-decode";
// Removed static data fallbacks; data now comes from DB via API/hooks
import Link from "next/link";

type GoogleJwt = {
  name?: string;
  email?: string;
  picture?: string;
  sub?: string;
};

type User = {
  name: string;
  email: string;
  picture: string;
  id: string;
};

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const currentUserRef = useRef<User | null>(null);
  const initialLoginHtmlRef = useRef<string | null>(null);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  // Restore session on first load
  useEffect(() => {
    // Capture initial login tab HTML once for later restore on logout
    if (!initialLoginHtmlRef.current) {
      const loginEl = document.getElementById('login');
      if (loginEl) initialLoginHtmlRef.current = loginEl.innerHTML;
    }
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (saved) {
        const parsed = JSON.parse(saved) as User;
        setCurrentUser(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    // Initialize theme from localStorage or default to light
    let currentTheme = (typeof window !== 'undefined' && localStorage.getItem('theme')) || 'light';
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
      localStorage.setItem('theme', currentTheme);
      updateThemeIcons();
    }

    // Notification system
    function showNotification(message: string, type: 'success'|'error'|'info'|'warning' = 'success') {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed; top: 100px; right: 20px; background: var(--${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'accent'});
        color: white; padding: 1rem 1.5rem; border-radius: 12px; font-weight: 600; z-index: 3000;
        box-shadow: var(--shadow-lg-val); transform: translateX(400px); opacity: 0; transition: all 0.3s ease; max-width: 350px;`;
      notification.textContent = message;
      document.body.appendChild(notification);
      setTimeout(() => { notification.style.transform = 'translateX(0)'; notification.style.opacity = '1'; }, 100);
      setTimeout(() => {
        notification.style.transform = 'translateX(400px)'; notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
      }, 4000);
    }
    // Expose notification globally for tabs/components
    (window as any).showNotification = showNotification;

    // Attach theme toggle
    const themeToggle = document.getElementById('themeToggle');
    themeToggle?.addEventListener('click', toggleTheme);

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navTabs = document.getElementById('navTabs');
    function toggleMobileMenu() { navTabs?.classList.toggle('show'); }
    mobileMenuBtn?.addEventListener('click', toggleMobileMenu);

    // Helpers to apply UI state for login/logout
    function applyLoggedInUI(user: User) {
      const userProfile = document.getElementById('userProfile');
      const joinBtn = document.getElementById('joinBtn');
      const userName = document.getElementById('userName');
      const userAvatar = document.getElementById('userAvatar') as HTMLImageElement | null;
      const loginNavBtn = document.querySelector<HTMLElement>('.nav-tab[data-tab="login"]');
      if (userProfile) (userProfile as HTMLElement).style.display = 'flex';
      if (joinBtn) (joinBtn as HTMLElement).style.display = 'none';
      if (userName) userName.textContent = user.name;
      if (userAvatar) userAvatar.src = user.picture;
      if (loginNavBtn) loginNavBtn.style.display = 'none';
    }
    function applyLoggedOutUI() {
      const userProfile = document.getElementById('userProfile');
      const joinBtn = document.getElementById('joinBtn');
      const loginNavBtn = document.querySelector<HTMLElement>('.nav-tab[data-tab="login"]');
      if (userProfile) (userProfile as HTMLElement).style.display = 'none';
      if (joinBtn) (joinBtn as HTMLElement).style.display = 'inline-flex';
      if (loginNavBtn) loginNavBtn.style.display = 'inline-flex';
    }

    // If session restored, apply UI now
    if (currentUserRef.current) {
      applyLoggedInUI(currentUserRef.current);
    } else {
      applyLoggedOutUI();
    }

    // Data now loaded in-tabs via hooks; no static samples

    // Helpers
    function formatDate(dateString: string) {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    }

    // Tab navigation
    const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('.nav-tab'));
    function switchTab(tabName: string) {
      const tabContents = Array.from(document.querySelectorAll<HTMLElement>('.tab-content'));
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      document.querySelector<HTMLButtonElement>(`.nav-tab[data-tab="${tabName}"]`)?.classList.add('active');
      document.getElementById(tabName)?.classList.add('active');
    }
    tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab || 'home')));

    // Expose tab switcher globally for components
    (window as any).switchToTab = (tabName: string) => switchTab(tabName);

    // Events and News are now handled inside their respective tabs as React components

    // Header scroll effect
    const header = document.getElementById('header');
    function onScroll() { if (!header) return; if (window.scrollY > 100) header.classList.add('scrolled'); else header.classList.remove('scrolled'); }
    window.addEventListener('scroll', onScroll);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 't') { e.preventDefault(); toggleTheme(); }
      // Reserved for modal close handled within components
    });
    const themeToggleEl = document.getElementById('themeToggle');
    if (themeToggleEl) themeToggleEl.title = 'Alt + T để chuyển đổi theme';

    // Google Sign-In (GSI)
    async function handleSuccessfulLogin(user: User) {
      try { localStorage.setItem('user', JSON.stringify(user)); } catch {}
      setCurrentUser(user);
      // Upsert minimal user record in DB (name, email)
      try {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: user.name, email: user.email })
        });
      } catch {}
      applyLoggedInUI(user);
      // Update login tab content
      const loginTab = document.getElementById('login');
      if (loginTab) {
        loginTab.innerHTML = `
          <div class="container">
            <div class="login-container">
              <div class="login-card">
                <div class="login-header">
                  <p class="login-subtitle">Chào mừng bạn đến với cộng đồng 3DIoT!</p>
                </div>
                <div class="login-content">
                  <div style="margin:2rem 0; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <img src="${user.picture}" alt="User Avatar" style="width:80px;height:80px;border-radius:50%;display:block;margin:0 auto 1rem;border:3px solid var(--accent);" />
                    <h3 style="color:var(--primary);margin-bottom:0.5rem;">${user.name}</h3>
                    <p style="color:var(--text-secondary);">${user.email}</p>
                  </div>
                  <div style="background:var(--background);padding:1.5rem;border-radius:12px;margin:1.5rem 0;">
                    <h4 style="color:var(--accent);margin-bottom:1rem;text-align:center;">Tính năng đã mở khóa</h4>
                    <div style="display:grid;gap:0.8rem;">
                      <div style="display:flex;align-items:center;gap:10px;"><i class="fas fa-check-circle" style="color:var(--success);"></i><span>Đăng ký tham gia sự kiện</span></div>
                      <div style="display:flex;align-items:center;gap:10px;"><i class="fas fa-check-circle" style="color:var(--success);"></i><span>Truy cập tài nguyên độc quyền</span></div>
                      <div style="display:flex;align-items:center;gap:10px;"><i class="fas fa-check-circle" style="color:var(--success);"></i><span>Kết nối với cộng đồng</span></div>
                      <div style="display:flex;align-items:center;gap:10px;"><i class="fas fa-check-circle" style="color:var(--success);"></i><span>Nhận thông báo việc làm</span></div>
                    </div>
                  </div>
                  <div style="display:grid;gap:1rem;">
                    <button class="btn-primary" id="goEvents" style="justify-content:center;"><i class="fas fa-calendar-alt"></i> Xem sự kiện</button>
                    <button id="logoutInline" style="background:var(--danger);color:white;border:none;padding:10px;border-radius:8px;cursor:pointer;font-weight:600;"><i class="fas fa-sign-out-alt"></i> Đăng xuất</button>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
        document.getElementById('goEvents')?.addEventListener('click', () => switchTab('events'));
        document.getElementById('logoutInline')?.addEventListener('click', signOut);
      }
      showNotification(`🎉 Đăng nhập thành công! Chào mừng ${user.name}`, 'success');
      // Events list handled by EventsTab now
    }

    function signOut() {
      const email = currentUserRef.current?.email || '';
      try { localStorage.removeItem('user'); } catch {}
      setCurrentUser(null);
      applyLoggedOutUI();
      // Restore original login tab content and re-bind Google button
      const loginTabEl = document.getElementById('login');
      if (loginTabEl && initialLoginHtmlRef.current !== null) {
        loginTabEl.innerHTML = initialLoginHtmlRef.current;
        const clientIdLocal = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const restoredGsi = document.getElementById('gsiContainer');
        const g = (window as any).google?.accounts?.id;
        if (g && clientIdLocal && restoredGsi) {
          try { g.renderButton(restoredGsi, { theme: 'outline', size: 'large', text: 'signin_with', shape: 'rectangular', logo_alignment: 'left', width: 320 }); } catch {}
        }
      }
      // Revoke token for current user (best-effort)
      const g = (window as any).google?.accounts?.id;
      if (g && email) { try { g.revoke(email, () => {}); } catch {} }
      showNotification('👋 Đã đăng xuất thành công!', 'info');
      switchTab('home');
      // Events list handled by EventsTab now
    }

    (document.getElementById('logoutBtn') as HTMLButtonElement | null)?.addEventListener('click', signOut);
    // Allow clicking the whole profile area to log out quickly
    const profileEl = document.getElementById('userProfile');
    profileEl?.addEventListener('click', (e) => {
      // Avoid double-handling if the explicit logout button is clicked
      const target = e.target as HTMLElement;
      if (target && (target.id === 'logoutBtn' || target.closest('#logoutBtn'))) return;
      signOut();
    });

    // Init GSI with retry and render official button inside our styled container
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const gsiContainer = document.getElementById('gsiContainer');
    let attempts = 0;
    const maxAttempts = 20; // ~5s
    const timer = setInterval(() => {
      const g = (window as any).google?.accounts?.id;
      attempts++;
      if (g && clientId) {
        try {
          g.initialize({
            client_id: clientId,
            callback: (response: any) => {
              try {
                const cred = jwtDecode<GoogleJwt>(response.credential);
                handleSuccessfulLogin({
                  name: cred.name || 'User',
                  email: cred.email || '',
                  picture: cred.picture || 'https://lh3.googleusercontent.com/a/default-user=s96-c',
                  id: cred.sub || ''
                });
              } catch (e) {
                showNotification('Đăng nhập thất bại. Vui lòng thử lại.', 'error');
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: true,
          });
          if (gsiContainer) {
            try { g.renderButton(gsiContainer, { theme: 'outline', size: 'large', text: 'signin_with', shape: 'rectangular', logo_alignment: 'left', width: 320 }); } catch {}
          }
          clearInterval(timer);
        } catch {}
      } else if (attempts >= maxAttempts) {
        clearInterval(timer);
        if (!clientId) showNotification('Thiếu NEXT_PUBLIC_GOOGLE_CLIENT_ID trong .env.local', 'error');
      }
    }, 250);

    // Hook custom sign-in button to prompt account chooser
    const googleBtn = document.getElementById('googleSignIn');
    googleBtn?.addEventListener('click', () => {
      const g = (window as any).google?.accounts?.id;
      if (!g || !clientId) {
        showNotification('Không thể khởi tạo đăng nhập Google. Kiểm tra cấu hình.', 'error');
        return;
      }
      try { g.prompt(); } catch { showNotification('Không thể mở hộp thoại Google. Kiểm tra popups/cookies.', 'error'); }
    });

    // Initial load handled within tabs themselves

    return () => {
      themeToggle?.removeEventListener('click', toggleTheme);
      mobileMenuBtn?.removeEventListener('click', toggleMobileMenu);
      window.removeEventListener('scroll', onScroll);
      googleBtn?.replaceWith(googleBtn.cloneNode(true));
      (document.getElementById('logoutBtn') as HTMLButtonElement | null)?.removeEventListener('click', signOut);
      clearInterval(timer);
    };
  }, [currentUser]);

  return (
    <>
      <header className="header" id="header">
        <nav className="nav">
          <a href="#" className="logo">
            <div className="logo-icon"><i className="fas fa-microchip"></i></div>
            3DIoT
          </a>
          <div className="nav-center">
            <div className="nav-tabs" id="navTabs">
              <button className="nav-tab active" data-tab="home"><i className="fas fa-home"></i> Trang chủ</button>
              <button className="nav-tab" data-tab="events"><i className="fas fa-calendar-alt"></i> Sự kiện</button>
              <button className="nav-tab" data-tab="contact"><i className="fas fa-handshake"></i> Liên hệ hợp tác</button>
              <button className="nav-tab" data-tab="news"><i className="fas fa-newspaper"></i> Tin tức</button>
              <button className="nav-tab" data-tab="login"><i className="fas fa-sign-in-alt"></i> Đăng nhập</button>
            </div>
          </div>
          <div className="nav-actions">
            <div className="theme-toggle" id="themeToggle" title="Chuyển đổi chế độ">
              <div className="theme-icon" id="lightIcon"><i className="fas fa-sun"></i></div>
              <div className="theme-icon active" id="darkIcon"><i className="fas fa-moon"></i></div>
            </div>
            <div className="user-profile" id="userProfile">
              <img 
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNmM2Y0ZjYiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik04IDhDOS4xMDQ1NyA4IDEwIDcuMTA0NTcgMTAgNkMxMCA0Ljg5NTQzIDkuMTA0NTcgNCA4IDRDNi44OTU0MyA0IDYgNC44OTU0MyA2IDZDNiA3LjEwNDU3IDYuODk1NDMgOCA4IDhaIiBmaWxsPSIjNjY3Nzg4Ii8+CjxwYXRoIGQ9Ik0xMiAxMkMxMiAxMC44OTU0IDExLjEwNDYgMTAgMTAgMTBINkM0Ljg5NTQzIDEwIDQgMTAuODk1NCA0IDEyVjEzSDEyVjEyWiIgZmlsbD0iIzY2Nzc4OCIvPgo8L3N2Zz4KPC9zdmc+" 
                alt="User Avatar" 
                className="user-avatar" 
                id="userAvatar" 
              />
              <span className="user-name" id="userName">User Name</span>
              <button className="logout-btn" id="logoutBtn" title="Đăng xuất"><i className="fas fa-sign-out-alt"></i></button>
            </div>
            
            <a href="https://www.facebook.com/groups/3diot.laptrinhnhungiot" className="btn-primary" id="joinBtn" target="_blank" rel="noopener noreferrer"><i className="fas fa-rocket"></i> Tham gia ngay</a>
            <button className="mobile-menu-btn" id="mobileMenuBtn"><i className="fas fa-bars"></i></button>
          </div>
        </nav>
      </header>

      <main className="main-content">
        <div className="tab-content active" id="home"><HomeTab /></div>

        <div className="tab-content" id="login"><LoginTab /></div>

        <div className="tab-content" id="events"><EventsTab /></div>

        <div className="tab-content" id="contact"><ContactTab /></div>

        <div className="tab-content" id="news"><NewsTab /></div>

        {/* Event modal moved into EventsTab component */}
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>🚀 3DIoT Community</h4>
              <p className="footer-intro" style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1rem' }}>Kết nối đam mê, chia sẻ tri thức và đồng hành cùng bạn trên hành trình khám phá & làm chủ công nghệ IoT.</p>
              <div style={{ marginTop: '1rem' }}>
                <strong style={{ color: 'var(--accent-secondary)' }}>📧 Contact:</strong><br />
                <a href="mailto:contact.3diot@gmail.com">contact.3diot@gmail.com</a><br />
                <a href="tel:+84339830128">📞 +84 33 983 0128</a>
              </div>
            </div>
            <div className="footer-section"><h4>Học tập</h4><a href="#">Arduino Cơ bản</a><a href="#">ESP32 Advanced</a><a href="#">IoT với Cloud</a><a href="#">Embedded AI</a><a href="#">PCB Design</a><a href="#">Robotics</a></div>
            <div className="footer-section"><h4>Cộng đồng</h4><a href="#">Discord Server</a><a href="#">Facebook Group</a><a href="#">GitHub Repos</a><a href="#">YouTube Channel</a><a href="#">Telegram Group</a><a href="#">LinkedIn Page</a></div>
            <div className="footer-section"><h4>Về chúng tôi</h4><a href="#">Câu chuyện</a><a href="#">Team</a><a href="#">Partners</a><a href="#">Blog</a><a href="#">Events</a><a href="#">Press Kit</a></div>
          </div>
          <div className="footer-bottom">
            <div className="social-links">
              <a href="https://www.facebook.com/groups/3diot.laptrinhnhungiot" target="_blank" rel="noopener noreferrer" title="Facebook Group"><i className="fab fa-facebook"></i></a>
              <a href="https://www.tiktok.com/@3diot_laptrinhnhungiot" target="_blank" rel="noopener noreferrer" title="TikTok"><i className="fab fa-tiktok"></i></a>
              <a href="https://www.youtube.com/@3DIoT.LapTrinhNhungIoT" target="_blank" rel="noopener noreferrer" title="YouTube"><i className="fab fa-youtube"></i></a>
            </div>
            <p>© 2025 3DIoT Community. Made with ❤️ for IoT developers in Vietnam.</p>
            <p>🌟 Proudly supporting the next generation of embedded engineers</p>
          </div>
        </div>
      </footer>
    </>
  );
}
