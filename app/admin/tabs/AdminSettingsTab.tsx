"use client";

import { useEffect, useState } from "react";

export default function AdminSettingsTab() {
  const [integrationSettings, setIntegrationSettings] = useState({
    googleAnalytics: "",
    googleClientId: "",
    smtpHost: "",
    smtpUsername: "",
    perplexityApiKey: "",
    perplexityModel: "pplx-70b-online"
  });

  const [newsSettings, setNewsSettings] = useState({
    autoPublish: false,
    updateFrequency: "weekly",
    lastRefreshAt: ""
  });

  const [saving, setSaving] = useState(false); // deprecated with Integration removal; kept to preserve minimal diff if referenced
  const [refreshing, setRefreshing] = useState(false);
  const [showNewsConfig, setShowNewsConfig] = useState(false);
  const [savingGoogle, setSavingGoogle] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);

  // Load existing settings
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch('/api/settings', { cache: 'no-store' });
        if (!resp.ok) return;
        const data = await resp.json();
        const s = data?.data || {};
        setIntegrationSettings((prev) => ({
          ...prev,
          googleAnalytics: s['integrations.gaId'] || prev.googleAnalytics,
          googleClientId: s['integrations.googleClientId'] || prev.googleClientId,
          smtpHost: s['integrations.smtpHost'] || prev.smtpHost,
          smtpUsername: s['integrations.smtpUsername'] || prev.smtpUsername,
          perplexityApiKey: s['perplexity.apiKey'] || prev.perplexityApiKey,
          perplexityModel: s['perplexity.model'] || prev.perplexityModel,
        }));
        setNewsSettings((prev) => ({
          ...prev,
          autoPublish: Boolean(s['news.autoPublish'] ?? prev.autoPublish),
          updateFrequency: s['news.updateFrequency'] || prev.updateFrequency,
          lastRefreshAt: s['news.lastRefreshAt'] || '',
        }));
        // Fallback to localStorage if API key is absent
        if (!(s['perplexity.apiKey'])) {
          try {
            const lsKey = localStorage.getItem('perplexity.apiKey') || '';
            const lsModel = localStorage.getItem('perplexity.model') || '';
            if (lsKey) {
              setIntegrationSettings((prev) => ({ ...prev, perplexityApiKey: lsKey, perplexityModel: (lsModel || prev.perplexityModel) }));
              // Best-effort sync back to server
              fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ 'perplexity.apiKey': lsKey, 'perplexity.model': (lsModel || integrationSettings.perplexityModel) }) }).catch(() => {});
            }
          } catch {}
        }
      } catch {}
    })();
  }, []);

  // Integration section removed - settings are now configured inline under News
  const handleSaveGoogle = () => {
    (async () => {
      setSavingGoogle(true);
      try {
        const payload: Record<string, any> = {
          'integrations.gaId': integrationSettings.googleAnalytics,
          'integrations.googleClientId': integrationSettings.googleClientId,
        };
        const resp = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!resp.ok) throw new Error('Save failed');
        (window as any).showNotification('Đã lưu Google settings', 'success');
      } catch {
        (window as any).showNotification('Lưu Google settings thất bại', 'error');
      } finally {
        setSavingGoogle(false);
      }
    })();
  };

  const handleSaveSmtp = () => {
    (async () => {
      setSavingSmtp(true);
      try {
        const payload: Record<string, any> = {
          'integrations.smtpHost': integrationSettings.smtpHost,
          'integrations.smtpUsername': integrationSettings.smtpUsername,
        };
        const resp = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!resp.ok) throw new Error('Save failed');
        (window as any).showNotification('Đã lưu SMTP settings', 'success');
      } catch {
        (window as any).showNotification('Lưu SMTP settings thất bại', 'error');
      } finally {
        setSavingSmtp(false);
      }
    })();
  };

  const handleNewsSetup = () => {
    setShowNewsConfig(true);
  };

  const handleRefreshNews = () => {
    (async () => {
      if (!integrationSettings.perplexityApiKey?.trim()) {
        // Try localStorage as a last resort
        try {
          const lsKey = localStorage.getItem('perplexity.apiKey') || '';
          const lsModel = localStorage.getItem('perplexity.model') || '';
          if (lsKey) {
            setIntegrationSettings((prev) => ({ ...prev, perplexityApiKey: lsKey, perplexityModel: (lsModel || prev.perplexityModel) }));
          }
        } catch {}
      }
      if (!integrationSettings.perplexityApiKey?.trim()) {
        (window as any).showNotification('Chưa có PERPLEXITY_API_KEY. Vui lòng cấu hình trước khi cập nhật.', 'warning');
        setShowNewsConfig(true);
        return;
      }
      setRefreshing(true);
      (window as any).showNotification('Đang cập nhật tin tức từ Perplexity...', 'info');
      try {
        const resp = await fetch('/api/news/refresh', { method: 'POST' });
        const data = await resp.json();
        if (resp.ok && data?.success) {
          (window as any).showNotification(`Đã nhập ${data.ingested} tin, bỏ qua ${data.skipped}.`, 'success');
          // persist last refresh time
          try { await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ 'news.lastRefreshAt': new Date().toISOString() }) }); } catch {}
          setNewsSettings(prev => ({ ...prev, lastRefreshAt: new Date().toISOString() }));
        } else {
          (window as any).showNotification(data?.error || 'Cập nhật thất bại.', 'error');
        }
      } catch (e) {
        (window as any).showNotification('Không thể gọi API /api/news/refresh', 'error');
      } finally { setRefreshing(false); }
    })();
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
      {/* Google & SMTP Settings (split panels) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Google Settings */}
        <div className="table-container">
          <div className="table-header">
            <h3 className="table-title">Google Settings</h3>
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
            <button className="btn btn-primary" onClick={handleSaveGoogle} disabled={savingGoogle}>
              <i className={`fas ${savingGoogle ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>
              {savingGoogle ? ' Đang lưu...' : ' Lưu Google settings'}
            </button>
          </div>
        </div>

        {/* SMTP Settings */}
        <div className="table-container">
          <div className="table-header">
            <h3 className="table-title">SMTP Settings</h3>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div className="form-group">
              <label>SMTP Host</label>
              <input
                type="text"
                value={integrationSettings.smtpHost}
                onChange={(e) => setIntegrationSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div className="form-group">
              <label>SMTP Username</label>
              <input
                type="text"
                value={integrationSettings.smtpUsername}
                onChange={(e) => setIntegrationSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
                placeholder="email@domain.com"
              />
            </div>
            <button className="btn btn-primary" onClick={handleSaveSmtp} disabled={savingSmtp}>
              <i className={`fas ${savingSmtp ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>
              {savingSmtp ? ' Đang lưu...' : ' Lưu SMTP settings'}
            </button>
          </div>
        </div>
      </div>

      {/* News Management (always visible) */}
      <div className="table-container" style={{ marginTop: '2rem' }}>
        <div className="table-header">
          <h3 className="table-title">Tin tức IoT/Tech mới nhất</h3>
          <div className="table-actions">
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ marginBottom: 4 }}>Tần suất cập nhật</label>
              <select
                value={newsSettings.updateFrequency}
                onChange={async (e) => {
                  const v = e.target.value;
                  setNewsSettings(prev => ({ ...prev, updateFrequency: v }));
                  try { await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ 'news.updateFrequency': v }) }); } catch {}
                  (window as any).showNotification('Đã lưu tần suất cập nhật', 'success');
                }}
              >
                <option value="manual">Thủ công</option>
                <option value="daily">Hàng ngày</option>
                <option value="weekly">Hàng tuần (mặc định sáng thứ 2)</option>
                <option value="monthly">Hàng tháng</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleRefreshNews} disabled={refreshing}>
              <i className={`fas ${refreshing ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
              {refreshing ? ' Đang cập nhật...' : ' Cập nhật tin tức'}
            </button>
          </div>
        </div>
        <div className="table-content">
          {(!integrationSettings.perplexityApiKey?.trim() || showNewsConfig) && (
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'end' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Perplexity API Key</label>
                  <input
                    type="password"
                    value={integrationSettings.perplexityApiKey}
                    onChange={(e) => {
                      const v = e.target.value;
                      setIntegrationSettings(prev => ({ ...prev, perplexityApiKey: v }));
                      try { localStorage.setItem('perplexity.apiKey', v || ''); } catch {}
                    }}
                    placeholder="PERPLEXITY_API_KEY"
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Perplexity Model</label>
                  <input
                    type="text"
                    value={integrationSettings.perplexityModel}
                    onChange={(e) => {
                      const v = e.target.value;
                      setIntegrationSettings(prev => ({ ...prev, perplexityModel: v }));
                      try { localStorage.setItem('perplexity.model', v || ''); } catch {}
                    }}
                    placeholder="pplx-70b-online"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn btn-primary" onClick={async () => {
                  try {
                    await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                      'perplexity.apiKey': integrationSettings.perplexityApiKey,
                      'perplexity.model': integrationSettings.perplexityModel,
                    }) });
                    (window as any).showNotification('Đã lưu cấu hình Perplexity', 'success');
                    setShowNewsConfig(false);
                  } catch {
                    (window as any).showNotification('Lưu cấu hình thất bại', 'error');
                  }
                }}>
                  <i className="fas fa-save"></i>
                  Lưu cấu hình
                </button>
                <button className="btn btn-secondary" onClick={() => setShowNewsConfig(false)}>
                  <i className="fas fa-times"></i>
                  Đóng
                </button>
              </div>
            </div>
          )}
          {newsSettings.lastRefreshAt && (
            <div style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
              Lần cập nhật gần nhất: {new Date(newsSettings.lastRefreshAt).toLocaleString('vi-VN')}
            </div>
          )}
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
