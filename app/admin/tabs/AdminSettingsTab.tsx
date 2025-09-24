"use client";

import { useState } from "react";

export default function AdminSettingsTab() {
  const [systemSettings, setSystemSettings] = useState({
    siteName: "3DIoT Community",
    contactEmail: "hello@3diot.vn",
    siteDescription: "Cộng đồng lập trình nhúng và IoT hàng đầu Việt Nam"
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    googleAnalytics: "",
    googleClientId: "",
    smtpHost: "",
    smtpUsername: ""
  });

  const [newsSettings, setNewsSettings] = useState({
    newsApiKey: "",
    autoPublish: false,
    updateFrequency: "daily"
  });

  const handleSystemSave = () => {
    (window as any).showNotification('Cài đặt hệ thống đã được lưu!', 'success');
  };

  const handleIntegrationSave = () => {
    (window as any).showNotification('Cài đặt tích hợp đã được lưu!', 'success');
  };

  const handleNewsSetup = () => {
    const apiKey = prompt('Nhập API key cho tin tức (ví dụ: NewsAPI, Perplexity):');
    if (apiKey) {
      setNewsSettings(prev => ({ ...prev, newsApiKey: apiKey }));
      (window as any).showNotification('Đã cấu hình News API thành công!', 'success');
    }
  };

  const handleRefreshNews = () => {
    (window as any).showNotification('Đang cập nhật tin tức từ API...', 'info');
    setTimeout(() => {
      (window as any).showNotification('Đã cập nhật 5 tin tức mới!', 'success');
    }, 3000);
  };

  const handlePublishNews = () => {
    if (confirm('Đăng các tin tức đã duyệt lên website chính?')) {
      (window as any).showNotification('Đang đăng tin tức...', 'info');
      setTimeout(() => {
        (window as any).showNotification('Đã đăng 3 tin tức lên website!', 'success');
      }, 2000);
    }
  };

  return (
    <div className="admin-settings">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* System Settings */}
        <div className="table-container">
          <div className="table-header">
            <h3 className="table-title">Cài đặt hệ thống</h3>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div className="form-group">
              <label>Tên website</label>
              <input
                type="text"
                value={systemSettings.siteName}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                placeholder="Tên website"
              />
            </div>
            <div className="form-group">
              <label>Email liên hệ</label>
              <input
                type="email"
                value={systemSettings.contactEmail}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="Email liên hệ"
              />
            </div>
            <div className="form-group">
              <label>Mô tả website</label>
              <textarea
                value={systemSettings.siteDescription}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                placeholder="Mô tả ngắn về website"
              ></textarea>
            </div>
            <button className="btn btn-primary" onClick={handleSystemSave}>
              <i className="fas fa-save"></i>
              Lưu cài đặt
            </button>
          </div>
        </div>

        {/* Integration Settings */}
        <div className="table-container">
          <div className="table-header">
            <h3 className="table-title">Tích hợp</h3>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div className="form-group">
              <label>Google Analytics ID</label>
              <input
                type="text"
                value={integrationSettings.googleAnalytics}
                onChange={(e) => setIntegrationSettings(prev => ({ ...prev, googleAnalytics: e.target.value }))}
                placeholder="G-XXXXXXXXXX"
              />
            </div>
            <div className="form-group">
              <label>Google Client ID (OAuth)</label>
              <input
                type="text"
                value={integrationSettings.googleClientId}
                onChange={(e) => setIntegrationSettings(prev => ({ ...prev, googleClientId: e.target.value }))}
                placeholder="Client ID cho Google Sign-in"
              />
            </div>
            <div className="form-group">
              <label>SMTP Settings</label>
              <input
                type="text"
                value={integrationSettings.smtpHost}
                onChange={(e) => setIntegrationSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                placeholder="smtp.gmail.com"
                style={{ marginBottom: '0.5rem' }}
              />
              <input
                type="text"
                value={integrationSettings.smtpUsername}
                onChange={(e) => setIntegrationSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
                placeholder="Email username"
              />
            </div>
            <button className="btn btn-primary" onClick={handleIntegrationSave}>
              <i className="fas fa-save"></i>
              Lưu tích hợp
            </button>
          </div>
        </div>
      </div>

      {/* News Management */}
      <div className="table-container" style={{ marginTop: '2rem' }}>
        <div className="table-header">
          <h3 className="table-title">Quản lý tin tức</h3>
          <div className="table-actions">
            <button className="btn btn-primary" onClick={handleNewsSetup}>
              <i className="fas fa-cog"></i>
              Cấu hình News API
            </button>
          </div>
        </div>
        <div className="table-content">
          <div className="empty-state">
            <i className="fas fa-newspaper"></i>
            <h3>Quản lý tin tức</h3>
            <p>Tính năng này sẽ cho phép bạn tự động thu thập và quản lý tin tức từ các nguồn IoT/Tech hàng đầu</p>
            <div className="news-actions">
              <button className="btn btn-primary" onClick={handleNewsSetup}>
                <i className="fas fa-cog"></i>
                Cấu hình News API
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* News Table (shown after API setup) */}
      {newsSettings.newsApiKey && (
        <div className="table-container" style={{ marginTop: '2rem' }}>
          <div className="table-header">
            <h3 className="table-title">Tin tức IoT/Tech mới nhất</h3>
            <div className="table-actions">
              <button className="btn btn-primary" onClick={handleRefreshNews}>
                <i className="fas fa-sync-alt"></i>
                Cập nhật tin tức
              </button>
              <button className="btn btn-success" onClick={handlePublishNews}>
                <i className="fas fa-globe"></i>
                Đăng lên website
              </button>
            </div>
          </div>
          <div className="table-content">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Tiêu đề</th>
                  <th>Nguồn</th>
                  <th>Danh mục</th>
                  <th>Độ quan trọng</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>24/09/2025</td>
                  <td>Breakthrough in Edge AI Processing</td>
                  <td>IEEE Spectrum</td>
                  <td><span className="status-badge status-confirmed">AI/ML</span></td>
                  <td><span className="status-badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>Cao</span></td>
                  <td>
                    <button className="btn btn-sm btn-primary">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn btn-sm btn-success">
                      <i className="fas fa-check"></i>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>24/09/2025</td>
                  <td>New RISC-V IoT Chip Architecture</td>
                  <td>Electronics Weekly</td>
                  <td><span className="status-badge status-pending">Hardware</span></td>
                  <td><span className="status-badge status-confirmed">Trung bình</span></td>
                  <td>
                    <button className="btn btn-sm btn-primary">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn btn-sm btn-success">
                      <i className="fas fa-check"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Status */}
      <div className="table-container" style={{ marginTop: '2rem' }}>
        <div className="table-header">
          <h3 className="table-title">Trạng thái hệ thống</h3>
        </div>
        <div className="table-content">
          <div className="system-status">
            <div className="status-item">
              <div className="status-indicator online"></div>
              <div className="status-info">
                <h4>Database</h4>
                <p>Hoạt động bình thường</p>
              </div>
            </div>
            <div className="status-item">
              <div className="status-indicator online"></div>
              <div className="status-info">
                <h4>API Services</h4>
                <p>Phản hồi nhanh</p>
              </div>
            </div>
            <div className="status-item">
              <div className="status-indicator warning"></div>
              <div className="status-info">
                <h4>Email Service</h4>
                <p>Cần cấu hình SMTP</p>
              </div>
            </div>
            <div className="status-item">
              <div className="status-indicator offline"></div>
              <div className="status-info">
                <h4>News API</h4>
                <p>Chưa được cấu hình</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
