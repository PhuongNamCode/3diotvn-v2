"use client";

import { useEffect, useRef, useState } from "react";
import HomeTab from "./tabs/HomeTab";
import EventsTab from "./tabs/EventsTab";
import ContactTab from "./tabs/ContactTab";
import NewsTab from "./tabs/NewsTab";
import LoginTab from "./tabs/LoginTab";
import CoursesTab from "./tabs/CoursesTab";
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
    // Initialize theme from localStorage or default to dark
    let currentTheme = (typeof window !== 'undefined' && localStorage.getItem('theme')) || 'dark';
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
    function isValidUrl(maybeUrl: string | undefined | null) {
      if (!maybeUrl || typeof maybeUrl !== 'string') return false;
      try {
        const u = new URL(maybeUrl);
        return u.protocol === 'http:' || u.protocol === 'https:';
      } catch {
        return false;
      }
    }

    async function tryLoadImage(url: string): Promise<boolean> {
      return new Promise((resolve) => {
        const testImg = new Image();
        // Some providers can reject hotlinking if referrer present
        (testImg as any).referrerPolicy = 'no-referrer';
        testImg.onload = () => resolve(true);
        testImg.onerror = () => resolve(false);
        testImg.src = url;
      });
    }

    async function setUserAvatarImage(imgEl: HTMLImageElement, user: User) {
      const fallback = '/default-avatar.png';
      const candidates: string[] = [];
      if (isValidUrl(user.picture)) candidates.push(user.picture!);
      candidates.push(fallback);

      for (const candidate of candidates) {
        const ok = await tryLoadImage(candidate);
        if (ok) {
          imgEl.onerror = null;
          imgEl.src = candidate;
          // Ensure broken cache state is cleared
          if (imgEl.complete && imgEl.naturalWidth === 0) {
            continue;
          }
          return;
        }
      }
      // As a last resort, draw initials placeholder via data URL
      const initials = (user.name || 'User')
        .split(' ')
        .map((s) => s.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();
      try {
        const canvas = document.createElement('canvas');
        const size = 80;
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.arc(size/2, size/2, size/2, 0, Math.PI*2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 28px system-ui, -apple-system, "Segoe UI", Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(initials, size/2, size/2);
          imgEl.src = canvas.toDataURL('image/png');
        } else {
          imgEl.src = fallback;
        }
      } catch {
        imgEl.src = fallback;
      }
    }

    function applyLoggedInUI(user: User) {
      const userProfile = document.getElementById('userProfile');
      const joinBtn = document.getElementById('joinBtn');
      const themeToggle = document.getElementById('themeToggle');
      const userName = document.getElementById('userName');
      const userAvatar = document.getElementById('userAvatar') as HTMLImageElement | null;
      const loginNavBtn = document.querySelector<HTMLElement>('.nav-tab[data-tab="login"]');
      if (userProfile) (userProfile as HTMLElement).style.display = 'flex';
      if (joinBtn) (joinBtn as HTMLElement).style.display = 'none';
      if (themeToggle) (themeToggle as HTMLElement).style.display = 'flex';
      if (userName) userName.textContent = user.name;
      if (userAvatar) {
        try { (userAvatar as any).referrerPolicy = 'no-referrer'; } catch {}
        userAvatar.decoding = 'async';
        userAvatar.loading = 'eager';
        setUserAvatarImage(userAvatar, user);
      }
      if (loginNavBtn) loginNavBtn.style.display = 'none';
    }
      function applyLoggedOutUI() {
        const userProfile = document.getElementById('userProfile');
        const joinBtn = document.getElementById('joinBtn');
        const themeToggle = document.getElementById('themeToggle');
        const loginNavBtn = document.querySelector<HTMLElement>('.nav-tab[data-tab="login"]');
        if (userProfile) (userProfile as HTMLElement).style.display = 'none';
        if (joinBtn) (joinBtn as HTMLElement).style.display = 'inline-flex';
        if (themeToggle) (themeToggle as HTMLElement).style.display = 'none';
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
    let eventsTabTimer: NodeJS.Timeout | null = null;
    
    // Newsletter popup state management
    const NEWSLETTER_POPUP_SHOWN_KEY = 'newsletter_popup_shown';
    let hasShownNewsletterPopup = false;
    
    // Modern Newsletter Popup (with restrictions)
    function showNewsletterPopup() {
      // Check if popup has already been shown in this session
      if (hasShownNewsletterPopup) {
        console.log('Newsletter popup already shown in this session');
        return;
      }
      
      // Check localStorage to see if popup was shown before
      try {
        const popupShown = localStorage.getItem(NEWSLETTER_POPUP_SHOWN_KEY);
        if (popupShown === 'true') {
          console.log('Newsletter popup was shown before, skipping');
          return;
        }
      } catch (error) {
        console.log('Could not check localStorage:', error);
      }
      
      createAndShowPopup();
    }

    // Newsletter Popup (always show - for manual button clicks)
    function showNewsletterPopupAlways() {
      console.log('Showing newsletter popup (always mode - manual trigger)');
      createAndShowPopup(false); // Don't mark as shown
    }

    // Common function to create and show popup
    function createAndShowPopup(markAsShown: boolean = true) {
      
      // Remove existing popup if any
      const existingPopup = document.getElementById('newsletter-popup');
      if (existingPopup) {
        existingPopup.remove();
      }

      // Create new popup
      const popup = document.createElement('div');
      popup.id = 'newsletter-popup';
      popup.innerHTML = `
        <div class="newsletter-popup-overlay">
          <div class="newsletter-popup">
            <button class="newsletter-popup-close" onclick="closeNewsletterPopup()">
              <i class="fas fa-times"></i>
            </button>
            
            <div class="newsletter-popup-content">
              <div class="newsletter-popup-icon">
                <i class="fas fa-envelope-open-text"></i>
              </div>
              
              <h2 class="newsletter-popup-title">
                📰 Đăng ký nhận tin tức mới
              </h2>
              
              <p class="newsletter-popup-subtitle">
                Nhận những tin tức công nghệ mới nhất về IoT, Embedded, AI và xu hướng công nghệ 
                trực tiếp vào hộp thư của bạn!
              </p>

              <form class="newsletter-popup-form" onsubmit="handleNewsletterSubmit(event)">
                <input
                  type="email"
                  id="newsletter-email"
                  placeholder="Nhập email của bạn..."
                  class="newsletter-popup-input"
                  required
                />
                <button type="submit" class="newsletter-popup-submit" id="newsletter-submit">
                  <i class="fas fa-paper-plane"></i>
                  Đăng ký ngay
                </button>
              </form>

              <div class="newsletter-popup-benefits">
                <h4>🎯 Bạn sẽ nhận được:</h4>
                <ul>
                  <li>Tin tức IoT & Embedded mới nhất</li>
                  <li>Xu hướng AI & Machine Learning</li>
                  <li>Cơ hội nghề nghiệp trong tech</li>
                  <li>Thông báo sự kiện & workshop</li>
                </ul>
              </div>

              <div class="newsletter-popup-privacy">
                <p>
                  <i class="fas fa-shield-alt"></i>
                  Chúng tôi cam kết bảo mật thông tin của bạn và chỉ gửi nội dung liên quan đến công nghệ.
                </p>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(popup);
      
      // Show popup
      const overlay = popup.querySelector('.newsletter-popup-overlay') as HTMLElement;
      overlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
      
      // Mark popup as shown (only for automatic popups, not manual button clicks)
      if (markAsShown) {
        hasShownNewsletterPopup = true;
        try {
          localStorage.setItem(NEWSLETTER_POPUP_SHOWN_KEY, 'true');
        } catch (error) {
          console.log('Could not save to localStorage:', error);
        }
      }
    }

    function closeNewsletterPopup() {
      const popup = document.getElementById('newsletter-popup');
      if (popup) {
        const overlay = popup.querySelector('.newsletter-popup-overlay') as HTMLElement;
        overlay.style.animation = 'popupFadeIn 0.3s ease-out reverse';
        setTimeout(() => {
          popup.remove();
          document.body.style.overflow = 'auto';
        }, 300);
      }
    }

    async function handleNewsletterSubmit(event: Event) {
      event.preventDefault();
      const email = (document.getElementById('newsletter-email') as HTMLInputElement)?.value;
      const submitBtn = document.getElementById('newsletter-submit') as HTMLButtonElement;

      if (!email) return;

      // Show loading
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
      submitBtn.disabled = true;

      try {
        const response = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (data.success) {
          // Show success message
          const content = document.querySelector('.newsletter-popup-content');
          if (content) {
            content.innerHTML = `
              <div class="newsletter-popup-success">
                <div class="newsletter-popup-success-icon">
                  <i class="fas fa-check-circle"></i>
                </div>
                <h3>Cảm ơn bạn đã đăng ký! 🎉</h3>
                <p>Chúng tôi sẽ gửi tin tức mới nhất đến email của bạn.</p>
              </div>
            `;
          }

          // Auto close after 3 seconds
          setTimeout(closeNewsletterPopup, 3000);
        } else {
          throw new Error(data.error || 'Failed to subscribe');
        }
      } catch (error) {
        console.error('Newsletter subscription error:', error);
        alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
      } finally {
        // Reset button
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Đăng ký ngay';
        submitBtn.disabled = false;
      }
    }

    // Function to reset newsletter popup state (for testing)
    function resetNewsletterPopupState() {
      hasShownNewsletterPopup = false;
      try {
        localStorage.removeItem(NEWSLETTER_POPUP_SHOWN_KEY);
        console.log('Newsletter popup state reset');
      } catch (error) {
        console.log('Could not reset localStorage:', error);
      }
    }

    // Make functions global
    (window as any).closeNewsletterPopup = closeNewsletterPopup;
    (window as any).handleNewsletterSubmit = handleNewsletterSubmit;
    (window as any).showNewsletterPopup = showNewsletterPopup;
    (window as any).showNewsletterPopupAlways = showNewsletterPopupAlways;
    (window as any).resetNewsletterPopupState = resetNewsletterPopupState;
    
    // Debug function to test newsletter popup
    (window as any).testNewsletterPopup = () => {
      console.log('Testing newsletter popup...');
      resetNewsletterPopupState(); // Reset first
      showNewsletterPopup();
    };
    
    // Debug function to check popup state
    (window as any).debugPopupState = () => {
      console.log('=== Newsletter Popup Debug ===');
      console.log('hasShownNewsletterPopup:', hasShownNewsletterPopup);
      console.log('NEWSLETTER_POPUP_SHOWN_KEY:', NEWSLETTER_POPUP_SHOWN_KEY);
      try {
        const popupShown = localStorage.getItem(NEWSLETTER_POPUP_SHOWN_KEY);
        console.log('localStorage value:', popupShown);
      } catch (error) {
        console.log('localStorage error:', error);
      }
      console.log('eventsTabTimer:', eventsTabTimer);
      console.log('=============================');
    };
    
    // Debug function to test popup with short timer
    (window as any).testPopupTimer = () => {
      console.log('Testing popup timer with 3 seconds...');
      resetNewsletterPopupState();
      hasShownNewsletterPopup = false;
      
      eventsTabTimer = setTimeout(() => {
        console.log('Test timer triggered!');
        showNewsletterPopup();
      }, 3000); // 3 seconds for testing
      
      console.log('Test timer set for 3 seconds');
    };
    
    
    function switchTab(tabName: string) {
      const tabContents = Array.from(document.querySelectorAll<HTMLElement>('.tab-content'));
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      document.querySelector<HTMLButtonElement>(`.nav-tab[data-tab="${tabName}"]`)?.classList.add('active');
      document.getElementById(tabName)?.classList.add('active');
      
      // Newsletter popup logic for events, courses, and news tabs
      if (tabName === 'events' || tabName === 'courses' || tabName === 'news') {
        console.log(`Debug: ${tabName} tab activated`);
        console.log(`Debug: hasShownNewsletterPopup = ${hasShownNewsletterPopup}`);
        
        // Only set timer if popup hasn't been shown yet
        if (!hasShownNewsletterPopup) {
          try {
            const popupShown = localStorage.getItem(NEWSLETTER_POPUP_SHOWN_KEY);
            console.log(`Debug: localStorage popupShown = ${popupShown}`);
            if (popupShown !== 'true') {
              console.log(`${tabName} tab activated, starting newsletter timer...`);
              // Clear any existing timer
              if (eventsTabTimer) {
                clearTimeout(eventsTabTimer);
              }

              // Set timer to show newsletter popup after 10 seconds
              eventsTabTimer = setTimeout(() => {
                console.log('Newsletter timer triggered, checking active tab...');
                // Check if user is still on events, courses, or news tab
                const activeTab = document.querySelector('.nav-tab.active');
                const activeTabName = activeTab?.getAttribute('data-tab');
                console.log('Active tab:', activeTabName);

                if (activeTabName === 'events' || activeTabName === 'courses' || activeTabName === 'news') {
                  console.log('Showing newsletter popup...');
                  showNewsletterPopup();
                } else {
                  console.log('User switched tabs, not showing newsletter popup');
                }
              }, 10000); // 10 seconds

              console.log('Newsletter timer set for 10 seconds');
            } else {
              console.log('Newsletter popup already shown before, skipping timer');
            }
          } catch (error) {
            console.log('Error checking popup state:', error);
          }
        } else {
          console.log('Newsletter popup already shown in this session, skipping timer');
        }
      } else {
        // Clear timer if switching to other tabs
        if (eventsTabTimer) {
          console.log('Clearing newsletter timer...');
          clearTimeout(eventsTabTimer);
          eventsTabTimer = null;
        }
      }
    }
    tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab || 'home')));

    // Expose tab switcher globally for components
    (window as any).switchToTab = (tabName: string) => switchTab(tabName);

    // Footer navigation handlers
    function setupFooterNavigation() {
      // Learning section - all courses
      const learningLinks = document.querySelectorAll('.footer-section:nth-child(2) .footer-links a');
      learningLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          switchTab('courses');
        });
      });

      // About section navigation
      const aboutLinks = document.querySelectorAll('.footer-section:nth-child(4) .footer-links a');
      aboutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const text = link.textContent?.toLowerCase();
          if (text?.includes('cộng tác') || text?.includes('partners') || text?.includes('liên hệ')) {
            switchTab('contact');
          } else if (text?.includes('events')) {
            switchTab('events');
          }
        });
      });
    }

    // Events and News are now handled inside their respective tabs as React components

    // Header scroll effect
    const header = document.getElementById('header');
    function onScroll() { if (!header) return; if (window.scrollY > 100) header.classList.add('scrolled'); else header.classList.remove('scrolled'); }
    window.addEventListener('scroll', onScroll);

    // Setup footer navigation
    setupFooterNavigation();

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
              <div class="login-card modern-profile-card">
                <!-- Welcome Header with Gradient -->
                <div class="profile-header">
                  <div class="welcome-badge">
                    <i class="fas fa-rocket"></i>
                    <span>Chào mừng bạn đến với cộng đồng 3DIoT!</span>
                  </div>
                </div>

                <!-- User Profile Section -->
                <div class="profile-section">
                  <div class="profile-avatar-container">
                    <div class="avatar-ring">
                      <img id="loginAvatarImg" src="${user.picture}" alt="User Avatar" class="profile-avatar" />
                      <div class="avatar-status"></div>
                    </div>
                    <div class="profile-info">
                      <h3 class="profile-name">${user.name}</h3>
                      <p class="profile-email">${user.email}</p>
                      <div class="profile-badge">
                        <i class="fas fa-crown"></i>
                        <span>Thành viên VIP</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Features Section -->
                <div class="features-section">
                  <div class="features-header">
                    <i class="fas fa-star"></i>
                    <h4>Tính năng đã mở khóa</h4>
                    <div class="features-count">4/4</div>
                  </div>
                  <div class="features-grid">
                    <div class="feature-item">
                      <div class="feature-icon">
                        <i class="fas fa-calendar-check"></i>
                      </div>
                      <div class="feature-content">
                        <span class="feature-title">Đăng ký tham gia sự kiện</span>
                        <span class="feature-desc">Tham gia các workshop và hội thảo</span>
                      </div>
                      <div class="feature-status">
                        <i class="fas fa-check-circle"></i>
                      </div>
                    </div>
                    <div class="feature-item">
                      <div class="feature-icon">
                        <i class="fas fa-gem"></i>
                      </div>
                      <div class="feature-content">
                        <span class="feature-title">Truy cập tài nguyên độc quyền</span>
                        <span class="feature-desc">Tài liệu và code mẫu premium</span>
                      </div>
                      <div class="feature-status">
                        <i class="fas fa-check-circle"></i>
                      </div>
                    </div>
                    <div class="feature-item">
                      <div class="feature-icon">
                        <i class="fas fa-users"></i>
                      </div>
                      <div class="feature-content">
                        <span class="feature-title">Kết nối với cộng đồng</span>
                        <span class="feature-desc">Tham gia nhóm và mạng lưới</span>
                      </div>
                      <div class="feature-status">
                        <i class="fas fa-check-circle"></i>
                      </div>
                    </div>
                    <div class="feature-item">
                      <div class="feature-icon">
                        <i class="fas fa-briefcase"></i>
                      </div>
                      <div class="feature-content">
                        <span class="feature-title">Nhận thông báo việc làm</span>
                        <span class="feature-desc">Cơ hội nghề nghiệp từ đối tác</span>
                      </div>
                      <div class="feature-status">
                        <i class="fas fa-check-circle"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons-grid">
                  <button class="btn-grid btn-events" id="goEvents">
                    <div class="btn-grid-icon">
                      <i class="fas fa-calendar-alt"></i>
                    </div>
                    <span class="btn-grid-title">Sự kiện</span>
                  </button>
                  
                  <button class="btn-grid btn-courses" id="goCourses">
                    <div class="btn-grid-icon">
                      <i class="fas fa-graduation-cap"></i>
                    </div>
                    <span class="btn-grid-title">Khóa học</span>
                  </button>
                  
                  <button class="btn-grid btn-news" id="goNews">
                    <div class="btn-grid-icon">
                      <i class="fas fa-newspaper"></i>
                    </div>
                    <span class="btn-grid-title">Tin tức</span>
                  </button>
                  
                  <button class="btn-grid btn-contact" id="goContact">
                    <div class="btn-grid-icon">
                      <i class="fas fa-envelope"></i>
                    </div>
                    <span class="btn-grid-title">Liên hệ</span>
                  </button>
                </div>
                
                <!-- Logout Button -->
                <div class="logout-section">
                  <button class="btn-logout" id="logoutInline">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </div>
          </div>`;
        document.getElementById('goEvents')?.addEventListener('click', () => switchTab('events'));
        document.getElementById('goCourses')?.addEventListener('click', () => switchTab('courses'));
        document.getElementById('goNews')?.addEventListener('click', () => switchTab('news'));
        document.getElementById('goContact')?.addEventListener('click', () => switchTab('contact'));
        document.getElementById('logoutInline')?.addEventListener('click', signOut);
        // Apply robust avatar fallback for the login tab preview avatar as well
        const loginAvatarImg = document.getElementById('loginAvatarImg') as HTMLImageElement | null;
        if (loginAvatarImg) {
          try { (loginAvatarImg as any).referrerPolicy = 'no-referrer'; } catch {}
          loginAvatarImg.decoding = 'async';
          loginAvatarImg.loading = 'eager';
          setUserAvatarImage(loginAvatarImg, user);
        }
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
            <div className="logo-icon">
              <img 
                src="/3diot-logo.png" 
                alt="3DIoT Logo" 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  transition: 'all 0.3s ease'
                }} 
                onError={(e) => {
                  // Fallback về icon cũ nếu logo không load được
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<i class="fas fa-microchip"></i>';
                  }
                }}
              />
            </div>
            <span className="logo-text">
              <span className="logo-char">3</span>
              <span className="logo-char">D</span>
              <span className="logo-char">I</span>
              <span className="logo-char">o</span>
              <span className="logo-char">T</span>
            </span>
          </a>
          <div className="nav-center">
            <div className="nav-tabs" id="navTabs">
              <button className="nav-tab active" data-tab="home"><i className="fas fa-home"></i> Trang chủ</button>
              <button className="nav-tab" data-tab="events"><i className="fas fa-calendar-alt"></i> Sự kiện</button>
              <button className="nav-tab" data-tab="courses"><i className="fas fa-graduation-cap"></i> Khóa học</button>
              <button className="nav-tab" data-tab="news"><i className="fas fa-newspaper"></i> Tin tức</button>
              <button className="nav-tab" data-tab="contact"><i className="fas fa-handshake"></i> Liên hệ</button>
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
        <div className="tab-content" id="courses"><CoursesTab /></div>


        <div className="tab-content" id="contact"><ContactTab /></div>

        <div className="tab-content" id="news"><NewsTab /></div>

        {/* Event modal moved into EventsTab component */}
      </main>

      <footer className="footer">
        {/* Decorative Background Elements */}
        <div className="footer-bg-pattern">
          <div className="footer-bg-circle footer-bg-circle-1"></div>
          <div className="footer-bg-circle footer-bg-circle-2"></div>
          <div className="footer-bg-circle footer-bg-circle-3"></div>
        </div>

        <div className="container">
          {/* Main Footer Content */}
          <div className="footer-content">
            {/* Brand Section */}
            <div className="footer-section footer-brand">
              <div className="footer-brand-header">
                <div className="footer-logo">
                  <i className="fas fa-rocket"></i>
                  <span>3DIoT Community</span>
                </div>
                <p className="footer-intro">
                  Kết nối đam mê, chia sẻ tri thức và đồng hành cùng bạn trên hành trình khám phá & làm chủ công nghệ.
                </p>
              </div>
              
              <div className="footer-contact">
                <div className="contact-item">
                  <i className="fas fa-envelope"></i>
                  <div>
                    <span className="contact-label">Email</span>
                    <a href="mailto:contact.3diot@gmail.com">contact.3diot@gmail.com</a>
                  </div>
                </div>
                <div className="contact-item">
                  <i className="fas fa-phone"></i>
                  <div>
                    <span className="contact-label">Phone</span>
                    <a href="tel:+84339830128">+84 33 983 0128</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Section */}
            <div className="footer-section">
              <h4 className="footer-section-title">
                <i className="fas fa-graduation-cap"></i>
                Học tập
              </h4>
              <ul className="footer-links">
                <li><a href="#">Arduino Cơ bản</a></li>
                <li><a href="#">ESP32 Advanced</a></li>
                <li><a href="#">IoT với Cloud</a></li>
                <li><a href="#">Embedded AI</a></li>
                <li><a href="#">PCB Design</a></li>
                <li><a href="#">Robotics</a></li>
              </ul>
            </div>

            {/* Community Section */}
            <div className="footer-section">
              <h4 className="footer-section-title">
                <i className="fas fa-users"></i>
                Cộng đồng
              </h4>
              <ul className="footer-links">
                <li><a href="https://www.facebook.com/groups/3diot.laptrinhnhungiot" target="_blank" rel="noopener noreferrer">Facebook Group</a></li>
                <li><a href="https://www.tiktok.com/@3diot_laptrinhnhungiot" target="_blank" rel="noopener noreferrer">TikTok</a></li>
                <li><a href="#">GitHub Repos</a></li>
                <li><a href="https://www.youtube.com/@3DIoT.LapTrinhNhungIoT" target="_blank" rel="noopener noreferrer">YouTube Channel</a></li>
                <li><a href="https://zalo.me/g/hejjkl289" target="_blank" rel="noopener noreferrer">Zalo Group</a></li>
                <li><a href="#">LinkedIn Page</a></li>
              </ul>
            </div>

            {/* About Section */}
            <div className="footer-section">
              <h4 className="footer-section-title">
                <i className="fas fa-info-circle"></i>
                Về chúng tôi
              </h4>
              <ul className="footer-links">
                <li><a href="#">Câu chuyện</a></li>
                <li><a href="#">Cộng tác viên</a></li>
                <li><a href="#">Partners</a></li>
                <li><a href="#">Events</a></li>
                <li><a href="#">Liên hệ</a></li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <div className="footer-bottom-left">
                <p className="copyright">© 2025 3DIoT Community. All rights reserved.</p>
              </div>
              
              <div className="social-links">
                <a href="https://www.facebook.com/groups/3diot.laptrinhnhungiot" target="_blank" rel="noopener noreferrer" className="social-link facebook" title="Facebook Group">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://www.tiktok.com/@3diot_laptrinhnhungiot" target="_blank" rel="noopener noreferrer" className="social-link tiktok" title="TikTok">
                  <i className="fab fa-tiktok"></i>
                </a>
                <a href="https://www.youtube.com/@3DIoT.LapTrinhNhungIoT" target="_blank" rel="noopener noreferrer" className="social-link youtube" title="YouTube">
                  <i className="fab fa-youtube"></i>
                </a>
                <a href="#" className="social-link github" title="GitHub">
                  <i className="fab fa-github"></i>
                </a>
                <a href="#" className="social-link linkedin" title="LinkedIn">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
              
              <div className="footer-bottom-right">
                <p className="mission">
                  <i className="fas fa-star"></i>
                  Proudly supporting the next generation of Embedded & IoT engineers
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
