"use client";

import { useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";

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
    function showNotification(message: string, type: 'success'|'error'|'info' = 'success') {
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

    // Data (sample)
    const eventsData = [
      { id: 1, title: "IoT Security Workshop", date: "2025-10-15", time: "09:00 - 17:00", location: "HCMC Tech Hub", description: "Tìm hiểu về bảo mật trong hệ thống IoT và cách phòng chống các lỗ hổng thường gặp.", registered: 45, capacity: 60, image: "fas fa-shield-alt", status: "upcoming" },
      { id: 2, title: "ESP32 Advanced Programming", date: "2025-09-28", time: "14:00 - 18:00", location: "Online via Zoom", description: "Khóa học nâng cao về lập trình ESP32, wifi mesh và bluetooth.", registered: 120, capacity: 100, image: "fas fa-microchip", status: "past" },
      { id: 3, title: "AI on Edge Devices", date: "2025-10-22", time: "13:00 - 16:00", location: "RMIT University", description: "Triển khai mô hình AI trên thiết bị nhúng với TensorFlow Lite.", registered: 25, capacity: 40, image: "fas fa-brain", status: "upcoming" },
      { id: 4, title: "PCB Design Fundamentals", date: "2025-09-20", time: "09:00 - 12:00", location: "FPT University", description: "Cơ bản về thiết kế PCB với Altium Designer.", registered: 85, capacity: 80, image: "fas fa-project-diagram", status: "past" },
      { id: 5, title: "3DIoT Hackathon 2025", date: "2025-11-05", time: "08:00 - 22:00", location: "HCMC University of Technology", description: "Cuộc thi hackathon 48h với chủ đề Smart City Solutions.", registered: 150, capacity: 200, image: "fas fa-trophy", status: "upcoming" },
      { id: 6, title: "Embedded Linux Workshop", date: "2025-10-08", time: "10:00 - 16:00", location: "VNU-HCM", description: "Tìm hiểu về Embedded Linux và Yocto Project.", registered: 35, capacity: 50, image: "fab fa-linux", status: "upcoming" }
    ];

    const newsData = [
      { date: "2025-09-17", title: "RISC-V processors gaining momentum in IoT applications", source: "Electronics Weekly", category: "embedded", summary: "Bộ xử lý RISC-V đang được ứng dụng rộng rãi trong các thiết bị IoT nhờ tính mở và hiệu quả năng lượng.", link: "https://electronicsweekly.com/risc-v-iot-momentum-2025" },
      { date: "2025-09-16", title: "Matter 1.3 standard released with enhanced device interoperability", source: "The Verge", category: "iot", summary: "Tiêu chuẩn Matter 1.3 được phát hành với khả năng tương tác thiết bị được cải thiện đáng kể.", link: "https://theverge.com/matter-1-3-standard-release-2025" },
      { date: "2025-09-15", title: "Samsung announces new Exynos chip with built-in AI accelerator", source: "Android Authority", category: "hardware", summary: "Samsung ra mắt chip Exynos mới tích hợp bộ gia tốc AI chuyên dụng cho các ứng dụng IoT và mobile.", link: "https://androidauthority.com/samsung-exynos-ai-accelerator-2025" }
    ];

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
      if (tabName === 'events') loadEvents();
      if (tabName === 'news') loadNews();
    }
    tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab || 'home')));

    // Load Events
    function loadEvents() {
      const eventsGrid = document.getElementById('eventsGrid');
      if (!eventsGrid) return;
      const currentDate = new Date();
      setTimeout(() => {
        eventsGrid.innerHTML = eventsData.map(event => {
          const eventDate = new Date(event.date);
          const isUpcoming = eventDate > currentDate;
          const progressPercentage = Math.min((event.registered / event.capacity) * 100, 100);
          const loggedIn = !!currentUserRef.current;
          return `
            <div class="event-card">
              <div class="event-image">
                <i class="${event.image}"></i>
                <div class="event-status ${isUpcoming ? 'upcoming' : 'past'}">${isUpcoming ? 'Sắp diễn ra' : 'Đã diễn ra'}</div>
              </div>
              <div class="event-content">
                <h3 class="event-title">${event.title}</h3>
                <div class="event-date"><i class="fas fa-calendar"></i>${formatDate(event.date)} | ${event.time}</div>
                <div class="event-location"><i class="fas fa-map-marker-alt"></i>${event.location}</div>
                <p class="event-description">${event.description}</p>
                <div class="event-participants">
                  <span class="participant-count">${event.registered}/${event.capacity}</span>
                  <div class="participant-progress"><div class="participant-progress-bar" style="width:${progressPercentage}%"></div></div>
                  <span style="font-size:0.8rem;color:var(--text-muted);">${Math.round(progressPercentage)}%</span>
                </div>
                ${isUpcoming ? `<button class="btn-register" data-event-id="${event.id}" ${!loggedIn ? 'title="Vui lòng đăng nhập để đăng ký"' : ''}><i class="fas fa-user-plus"></i> ${loggedIn ? 'Đăng ký tham gia' : 'Đăng nhập để đăng ký'}</button>` : ''}
              </div>
            </div>`;
        }).join('');
        // bind register buttons
        eventsGrid.querySelectorAll<HTMLButtonElement>('.btn-register').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-event-id'));
            openEventModal(id);
          });
        });
      }, 800);
    }

    // Load News
    function loadNews() {
      const newsTableBody = document.getElementById('newsTableBody');
      if (!newsTableBody) return;
      setTimeout(() => {
        newsTableBody.innerHTML = newsData.map(news => `
          <tr data-category="${news.category}">
            <td style="white-space:nowrap;">${formatDate(news.date)}</td>
            <td><a href="${news.link}" target="_blank" class="news-title">${news.title}</a></td>
            <td><span class="news-source">${news.source}</span></td>
            <td class="news-summary">${news.summary}</td>
            <td><a href="${news.link}" target="_blank" class="btn-primary" style="padding:6px 12px;font-size:0.8rem;"><i class="fas fa-external-link-alt"></i></a></td>
          </tr>
        `).join('');
        const filterBtns = Array.from(document.querySelectorAll<HTMLButtonElement>('.filter-btn'));
        filterBtns.forEach(btn => btn.addEventListener('click', () => {
          const filter = btn.dataset.filter || 'all';
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          document.querySelectorAll<HTMLTableRowElement>('#newsTableBody tr').forEach(row => {
            row.style.display = (filter === 'all' || row.dataset.category === filter) ? '' : 'none';
          });
        }));
      }, 800);
    }

    // Modal
    function openEventModal(eventId: number) {
      if (!currentUserRef.current) {
        showNotification('⚠️ Vui lòng đăng nhập để đăng ký sự kiện!', 'error');
        switchTab('login');
        return;
      }
      const event = eventsData.find(e => e.id === eventId);
      if (!event) return;
      const modal = document.getElementById('eventModal');
      const modalTitle = document.getElementById('modalEventTitle');
      const eventDetails = document.getElementById('eventDetails');
      if (!modal || !modalTitle || !eventDetails) return;
      modalTitle.textContent = `Đăng ký: ${event.title}`;
      eventDetails.innerHTML = `
        <div style="background: var(--background); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
          <h4 style="color: var(--accent); margin-bottom: 1rem;">Chi tiết sự kiện</h4>
          <p><strong>📅 Thời gian:</strong> ${formatDate(event.date)} | ${event.time}</p>
          <p><strong>📍 Địa điểm:</strong> ${event.location}</p>
          <p><strong>👥 Đã đăng ký:</strong> ${event.registered}/${event.capacity} người</p>
          <p><strong>📋 Mô tả:</strong> ${event.description}</p>
        </div>`;
      const nameEl = document.getElementById('regFullName') as HTMLInputElement | null;
      const emailEl = document.getElementById('regEmail') as HTMLInputElement | null;
      if (nameEl && emailEl && currentUserRef.current) {
        nameEl.value = currentUserRef.current.name || '';
        emailEl.value = currentUserRef.current.email || '';
      }
      (modal as HTMLElement).style.display = 'block';
    }
    function closeModal() {
      const modal = document.getElementById('eventModal');
      if (!modal) return;
      (modal as HTMLElement).style.display = 'none';
      const form = document.getElementById('eventRegistrationForm') as HTMLFormElement | null;
      const success = document.getElementById('registrationSuccess') as HTMLElement | null;
      if (form && success) { form.reset(); form.style.display = 'block'; success.style.display = 'none'; }
    }

    const closeBtn = document.querySelector<HTMLSpanElement>('.close');
    closeBtn?.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => { if (e.target === document.getElementById('eventModal')) closeModal(); });

    // Forms
    const contactForm = document.getElementById('contactForm') as HTMLFormElement | null;
    contactForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]') as HTMLButtonElement;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
      submitBtn.disabled = true;
      setTimeout(() => {
        contactForm.innerHTML = `
          <div class="success-message">
            <h3>🎉 Gửi thành công!</h3>
            <p>Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi sẽ phản hồi trong vòng 24 giờ.</p>
            <button class="btn-primary" onclick="location.reload()" style="margin-top:1rem;">Gửi yêu cầu khác</button>
          </div>`;
        showNotification('✅ Gửi thông tin hợp tác thành công!');
      }, 2000);
    });

    const eventRegForm = document.getElementById('eventRegistrationForm') as HTMLFormElement | null;
    eventRegForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = eventRegForm.querySelector('button[type="submit"]') as HTMLButtonElement;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
      submitBtn.disabled = true;
      setTimeout(() => {
        eventRegForm.style.display = 'none';
        const success = document.getElementById('registrationSuccess') as HTMLElement | null;
        if (success) success.style.display = 'block';
        showNotification('🎉 Đăng ký sự kiện thành công!');
      }, 2000);
    });

    // Header scroll effect
    const header = document.getElementById('header');
    function onScroll() { if (!header) return; if (window.scrollY > 100) header.classList.add('scrolled'); else header.classList.remove('scrolled'); }
    window.addEventListener('scroll', onScroll);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 't') { e.preventDefault(); toggleTheme(); }
      if (e.key === 'Escape') closeModal();
    });
    const themeToggleEl = document.getElementById('themeToggle');
    if (themeToggleEl) themeToggleEl.title = 'Alt + T để chuyển đổi theme';

    // Google Sign-In (GSI)
    function handleSuccessfulLogin(user: User) {
      try { localStorage.setItem('user', JSON.stringify(user)); } catch {}
      setCurrentUser(user);
      applyLoggedInUI(user);
      // Update login tab content
      const loginTab = document.getElementById('login');
      if (loginTab) {
        loginTab.innerHTML = `
          <div class="container">
            <div class="login-container">
              <div class="login-card">
                <div class="login-header">
                  <div class="login-icon"><i class="fas fa-user-check"></i></div>
                  <h2 class="login-title">Đã đăng nhập</h2>
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
      // Refresh events to update button labels
      loadEvents();
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
      loadEvents();
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

    // Initial load
    loadEvents();
    loadNews();

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
              <img src="" alt="User Avatar" className="user-avatar" id="userAvatar" />
              <span className="user-name" id="userName">User Name</span>
              <button className="logout-btn" id="logoutBtn" title="Đăng xuất"><i className="fas fa-sign-out-alt"></i></button>
            </div>
            <a href="#join" className="btn-primary" id="joinBtn"><i className="fas fa-rocket"></i> Tham gia ngay</a>
            <button className="mobile-menu-btn" id="mobileMenuBtn"><i className="fas fa-bars"></i></button>
          </div>
        </nav>
      </header>

      <main className="main-content">
        <div className="tab-content active" id="home">
          <div className="container">
            <section className="hero">
              <div className="hero-content">
                <div className="hero-text">
                  <h1>
                    Kết nối <span style={{ color: 'var(--accent)' }}>đam mê</span><br />
                    Chia sẻ <span style={{ color: 'var(--accent)' }}>tri thức</span><br />
                    Làm chủ <span style={{ color: 'var(--accent)' }}>IoT</span>
                  </h1>
                  <p className="hero-description">🚀 3DIoT - Cộng đồng lập trình nhúng và IoT hàng đầu Việt Nam. Đồng hành cùng bạn trên hành trình khám phá và làm chủ công nghệ tương lai.</p>
                  <div className="hero-stats">
                    <div className="stat-item"><span className="stat-number">5K+</span><span className="stat-label">Thành viên</span></div>
                    <div className="stat-item"><span className="stat-number">200+</span><span className="stat-label">Dự án</span></div>
                    <div className="stat-item"><span className="stat-number">50+</span><span className="stat-label">Khóa học</span></div>
                  </div>
                </div>
                <div className="hero-visual">
                  <div className="tech-stack">
                    <div className="tech-card"><i className="fab fa-arduino"></i><h4>Arduino</h4></div>
                    <div className="tech-card"><i className="fas fa-wifi"></i><h4>ESP32</h4></div>
                    <div className="tech-card"><i className="fas fa-microchip"></i><h4>STM32</h4></div>
                    <div className="tech-card"><i className="fab fa-raspberry-pi"></i><h4>Raspberry Pi</h4></div>
                    <div className="tech-card"><i className="fas fa-cloud"></i><h4>IoT Cloud</h4></div>
                    <div className="tech-card"><i className="fas fa-robot"></i><h4>AI/ML</h4></div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="tab-content" id="login">
          <div className="container">
            <div className="login-container">
              <div className="login-card">
                <div className="login-header">
                  <div className="login-icon"><i className="fas fa-user-circle"></i></div>
                  <h2 className="login-title">Chào mừng đến với 3DIoT</h2>
                  <p className="login-subtitle">Đăng nhập để truy cập đầy đủ tính năng cộng đồng</p>
                </div>
                <div className="login-content">
                  <div className="login-benefits">
                    <div className="benefit-item"><div className="benefit-icon"><i className="fas fa-calendar-check"></i></div><div className="benefit-text"><strong>Đăng ký sự kiện</strong><br />Tham gia các workshop, hackathon và seminar độc quyền</div></div>
                    <div className="benefit-item"><div className="benefit-icon"><i className="fas fa-users"></i></div><div className="benefit-text"><strong>Kết nối cộng đồng</strong><br />Networking với hàng ngàn IoT developers Việt Nam</div></div>
                    <div className="benefit-item"><div className="benefit-icon"><i className="fas fa-graduation-cap"></i></div><div className="benefit-text"><strong>Tài nguyên học tập</strong><br />Truy cập khóa học, code library và documentation</div></div>
                    <div className="benefit-item"><div className="benefit-icon"><i className="fas fa-briefcase"></i></div><div className="benefit-text"><strong>Cơ hội nghề nghiệp</strong><br />Nhận thông báo việc làm và dự án freelance</div></div>
                  </div>
                  <div className="google-signin-container">
                    <div id="gsiContainer" aria-label="Đăng nhập với Google"></div>
                  </div>
                  <div className="login-footer">
                    <p>Bằng việc đăng nhập, bạn đồng ý với <a href="#" style={{ color: 'var(--accent)' }}>Điều khoản sử dụng</a> và <a href="#" style={{ color: 'var(--accent)' }}>Chính sách bảo mật</a> của chúng tôi.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="tab-content" id="events">
          <div className="container">
            <div className="events-banner"><h2>🎯 Sự kiện sắp diễn ra</h2><p>Tham gia các workshop, seminar và hackathon cùng cộng đồng 3DIoT</p></div>
            <div className="events-grid" id="eventsGrid"><div className="loading"><i className="fas fa-spinner"></i><p>Đang tải sự kiện...</p></div></div>
          </div>
        </div>

        <div className="tab-content" id="contact">
          <div className="container">
            <form className="contact-form" id="contactForm">
              <h2>🤝 Liên hệ hợp tác</h2>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>Chúng tôi luôn chào đón các đối tác và cơ hội hợp tác để phát triển cộng đồng IoT</p>
              <div className="form-group"><label htmlFor="fullName">Họ và tên *</label><input type="text" id="fullName" name="fullName" required /></div>
              <div className="form-group"><label htmlFor="email">Email *</label><input type="email" id="email" name="email" required /></div>
              <div className="form-group"><label htmlFor="phone">Số điện thoại *</label><input type="tel" id="phone" name="phone" required /></div>
              <div className="form-group"><label htmlFor="organization">Đơn vị/Tổ chức *</label><input type="text" id="organization" name="organization" required /></div>
              <div className="form-group"><label htmlFor="details">Thông tin chi tiết về hợp tác *</label><textarea id="details" name="details" placeholder="Mô tả chi tiết về ý tưởng hợp tác, mục tiêu và kỳ vọng..." required></textarea></div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}><i className="fas fa-paper-plane"></i> Gửi thông tin hợp tác</button>
            </form>
          </div>
        </div>

        <div className="tab-content" id="news">
          <div className="container">
            <div className="news-header"><h2>📰 Tin tức công nghệ IoT</h2><p style={{ color: 'var(--text-secondary)' }}>Cập nhật những tin tức hot nhất về IoT, embedded systems và công nghệ</p></div>
            <div className="news-filters">
              <button className="filter-btn active" data-filter="all">Tất cả</button>
              <button className="filter-btn" data-filter="iot">IoT</button>
              <button className="filter-btn" data-filter="embedded">Embedded</button>
              <button className="filter-btn" data-filter="ai">AI/ML</button>
              <button className="filter-btn" data-filter="hardware">Hardware</button>
            </div>
            <div className="news-table">
              <table>
                <thead>
                  <tr><th>Ngày đăng</th><th>Tiêu đề</th><th>Nguồn</th><th>Tóm tắt ngắn</th><th>Link bài báo</th></tr>
                </thead>
                <tbody id="newsTableBody">
                  <tr><td colSpan={5} className="loading"><i className="fas fa-spinner"></i><p>Đang tải tin tức mới nhất...</p></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div id="eventModal" className="modal">
          <div className="modal-content">
            <div className="modal-header"><span className="close">&times;</span><h2 id="modalEventTitle">Đăng ký tham gia sự kiện</h2></div>
            <div className="modal-body">
              <div id="eventDetails"></div>
              <form id="eventRegistrationForm">
                <div className="form-group"><label htmlFor="regFullName">Họ và tên *</label><input type="text" id="regFullName" name="fullName" required /></div>
                <div className="form-group"><label htmlFor="regEmail">Email *</label><input type="email" id="regEmail" name="email" required /></div>
                <div className="form-group"><label htmlFor="regPhone">Số điện thoại *</label><input type="tel" id="regPhone" name="phone" required /></div>
                <div className="form-group"><label htmlFor="regOrganization">Đơn vị/Trường học</label><input type="text" id="regOrganization" name="organization" /></div>
                <div className="form-group"><label htmlFor="regExperience">Mức độ kinh nghiệm</label><select id="regExperience" name="experience" required><option value="">Chọn mức độ</option><option value="beginner">Mới bắt đầu</option><option value="intermediate">Trung bình</option><option value="advanced">Nâng cao</option><option value="expert">Chuyên gia</option></select></div>
                <div className="form-group"><label htmlFor="regExpectation">Kỳ vọng từ sự kiện</label><textarea id="regExpectation" name="expectation" placeholder="Chia sẻ kỳ vọng của bạn về sự kiện này..."></textarea></div>
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}><i className="fas fa-check"></i> Xác nhận đăng ký</button>
              </form>
              <div id="registrationSuccess" className="success-message" style={{ display: 'none' }}>
                <h3>🎉 Đăng ký thành công!</h3>
                <p>Cảm ơn bạn đã đăng ký tham gia sự kiện. Chúng tôi sẽ gửi thông tin chi tiết qua email trong thời gian sớm nhất.</p>
                <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => { const modal = document.getElementById('eventModal'); if (modal) (modal as HTMLElement).style.display = 'none'; }}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>🚀 3DIoT Community</h4>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1rem' }}>Kết nối đam mê, chia sẻ tri thức và đồng hành cùng bạn trên hành trình khám phá & làm chủ công nghệ IoT.</p>
              <div style={{ marginTop: '1rem' }}>
                <strong style={{ color: 'var(--accent-secondary)' }}>📧 Contact:</strong><br />
                <a href="mailto:hello@3diot.vn">hello@3diot.vn</a><br />
                <a href="tel:+84123456789">📞 +84 123 456 789</a>
              </div>
            </div>
            <div className="footer-section"><h4>Học tập</h4><a href="#">Arduino Cơ bản</a><a href="#">ESP32 Advanced</a><a href="#">IoT với Cloud</a><a href="#">Embedded AI</a><a href="#">PCB Design</a><a href="#">Robotics</a></div>
            <div className="footer-section"><h4>Cộng đồng</h4><a href="#">Discord Server</a><a href="#">Facebook Group</a><a href="#">GitHub Repos</a><a href="#">YouTube Channel</a><a href="#">Telegram Group</a><a href="#">LinkedIn Page</a></div>
            <div className="footer-section"><h4>Về chúng tôi</h4><a href="#">Câu chuyện</a><a href="#">Team</a><a href="#">Partners</a><a href="#">Blog</a><a href="#">Events</a><a href="#">Press Kit</a></div>
          </div>
          <div className="footer-bottom">
            <div className="social-links">
              <a href="#" title="Discord"><i className="fab fa-discord"></i></a>
              <a href="#" title="GitHub"><i className="fab fa-github"></i></a>
              <a href="#" title="YouTube"><i className="fab fa-youtube"></i></a>
              <a href="#" title="LinkedIn"><i className="fab fa-linkedin"></i></a>
              <a href="#" title="Facebook"><i className="fab fa-facebook"></i></a>
              <a href="#" title="Telegram"><i className="fab fa-telegram"></i></a>
            </div>
            <p>© 2025 3DIoT Community. Made with ❤️ for IoT developers in Vietnam.</p>
            <p>🌟 Proudly supporting the next generation of embedded engineers</p>
          </div>
        </div>
      </footer>
    </>
  );
}
