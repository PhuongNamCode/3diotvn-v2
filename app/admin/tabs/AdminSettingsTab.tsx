"use client";

import { useEffect, useState } from "react";
import { useNewsManagement } from '@/lib/hooks/useData';

export default function AdminSettingsTab() {
  const [integrationSettings, setIntegrationSettings] = useState({
    googleAnalytics: "",
    googleClientId: "",
    smtpHost: "",
    smtpUsername: "",
    smtpPassword: "",
    perplexityApiKey: "",
    perplexityModel: "sonar"
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
  
  // News management states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingNews, setDeletingNews] = useState<string | null>(null);
  const [schedulerInfo, setSchedulerInfo] = useState<{
    frequency: string;
    lastRefreshAt: string | null;
    nextUpdate: string;
    shouldUpdate: boolean;
  } | null>(null);
  const [cleanupInfo, setCleanupInfo] = useState<{
    totalNews: number;
    oldNewsCount: number;
    cutoffDate: string;
    daysOld: number;
    willKeep: number;
  } | null>(null);
  
  // Use news management hook
  const { news, loading: newsLoading, error: newsError, pagination, deleteNews, deleteAllNews } = useNewsManagement({
    page: currentPage,
    limit: 10,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    search: searchTerm || undefined,
  });

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
          smtpPassword: s['integrations.smtpPassword'] || prev.smtpPassword,
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

  // Load scheduler info
  useEffect(() => {
    const loadSchedulerInfo = async () => {
      try {
        const response = await fetch('/api/news/scheduler');
        const data = await response.json();
        if (data.success) {
          setSchedulerInfo(data.data);
        }
      } catch (error) {
        console.error('Failed to load scheduler info:', error);
      }
    };
    
    loadSchedulerInfo();
    // Refresh scheduler info every 30 seconds
    const interval = setInterval(loadSchedulerInfo, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load cleanup info
  useEffect(() => {
    const loadCleanupInfo = async () => {
      try {
        const response = await fetch('/api/news/cleanup');
        const data = await response.json();
        if (data.success) {
          setCleanupInfo(data.data);
        }
      } catch (error) {
        console.error('Failed to load cleanup info:', error);
      }
    };
    
    loadCleanupInfo();
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
          'integrations.smtpPassword': integrationSettings.smtpPassword,
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

  // News management functions
  const handleDeleteNews = async (id: string) => {
    setDeletingNews(id);
    try {
      const result = await deleteNews(id);
      if (result.success) {
        (window as any).showNotification(result.message, 'success');
      } else {
        (window as any).showNotification(result.error || 'Lỗi xóa tin tức', 'error');
      }
    } catch (error) {
      (window as any).showNotification('Lỗi xóa tin tức', 'error');
    } finally {
      setDeletingNews(null);
    }
  };

  const handleDeleteAllNews = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    
    try {
      const result = await deleteAllNews();
      if (result.success) {
        (window as any).showNotification(result.message, 'success');
        setShowDeleteConfirm(false);
      } else {
        (window as any).showNotification(result.error || 'Lỗi xóa tất cả tin tức', 'error');
      }
    } catch (error) {
      (window as any).showNotification('Lỗi xóa tất cả tin tức', 'error');
    }
  };

  const handleCleanupOldNews = async () => {
    try {
      const response = await fetch('/api/news/cleanup', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        (window as any).showNotification(data.message, 'success');
        // Reload cleanup info
        const cleanupResponse = await fetch('/api/news/cleanup');
        const cleanupData = await cleanupResponse.json();
        if (cleanupData.success) {
          setCleanupInfo(cleanupData.data);
        }
      } else {
        (window as any).showNotification(data.error || 'Lỗi dọn dẹp tin tức cũ', 'error');
      }
    } catch (error) {
      (window as any).showNotification('Lỗi dọn dẹp tin tức cũ', 'error');
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
            <div className="form-group">
              <label>SMTP Password</label>
              <input
                type="password"
                value={integrationSettings.smtpPassword}
                onChange={(e) => setIntegrationSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                placeholder="Nhập mật khẩu email"
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
          {/* API Key Configuration Section */}
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Cấu hình Perplexity AI</h4>
              {integrationSettings.perplexityApiKey?.trim() && !showNewsConfig && (
                <button 
                  className="btn btn-sm btn-secondary" 
                  onClick={() => setShowNewsConfig(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <i className="fas fa-edit"></i>
                  Chỉnh sửa
                </button>
              )}
            </div>
            
            {integrationSettings.perplexityApiKey?.trim() && !showNewsConfig ? (
              // Display current configuration
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                    Perplexity API Key
                  </label>
                  <div style={{ 
                    padding: '0.75rem', 
                    backgroundColor: 'var(--surface-variant)', 
                    borderRadius: '8px', 
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)',
                    wordBreak: 'break-all'
                  }}>
                    {integrationSettings.perplexityApiKey.substring(0, 20)}...{integrationSettings.perplexityApiKey.substring(integrationSettings.perplexityApiKey.length - 10)}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                    Model
                  </label>
                  <div style={{ 
                    padding: '0.75rem', 
                    backgroundColor: 'var(--surface-variant)', 
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)'
                  }}>
                    {integrationSettings.perplexityModel}
                  </div>
                </div>
              </div>
            ) : (
              // Edit configuration form
              <div>
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
                      placeholder="sonar"
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
          </div>
          {/* Scheduler Status */}
          <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-variant)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                  Tần suất hiện tại
                </label>
                <div style={{ 
                  padding: '0.5rem', 
                  backgroundColor: 'var(--surface)', 
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)'
                }}>
                  {newsSettings.updateFrequency === 'manual' ? 'Thủ công' :
                   newsSettings.updateFrequency === 'daily' ? 'Hàng ngày' :
                   newsSettings.updateFrequency === 'weekly' ? 'Hàng tuần' :
                   newsSettings.updateFrequency === 'monthly' ? 'Hàng tháng' : 'Không xác định'}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                  Lần cập nhật gần nhất
                </label>
                <div style={{ 
                  padding: '0.5rem', 
                  backgroundColor: 'var(--surface)', 
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)'
                }}>
                  {newsSettings.lastRefreshAt ? 
                    new Date(newsSettings.lastRefreshAt).toLocaleString('vi-VN') : 
                    'Chưa có'
                  }
                </div>
              </div>
            </div>
            {schedulerInfo && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--surface)', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                    Lịch cập nhật tự động
                  </span>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px',
                    backgroundColor: schedulerInfo.shouldUpdate ? 'var(--warning)' : 'var(--success)',
                    color: 'white'
                  }}>
                    {schedulerInfo.shouldUpdate ? 'Cần cập nhật' : 'Đã cập nhật'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Cập nhật tiếp theo: {schedulerInfo.nextUpdate ? new Date(schedulerInfo.nextUpdate).toLocaleString('vi-VN') : 'Không xác định'}
                </div>
              </div>
            )}
            
            {cleanupInfo && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--surface)', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                    Dọn dẹp tin tức cũ
                  </span>
                  <button 
                    className="btn btn-sm btn-warning"
                    onClick={handleCleanupOldNews}
                    style={{ fontSize: '0.75rem' }}
                  >
                    <i className="fas fa-broom"></i> Dọn dẹp ngay
                  </button>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Tổng tin tức: {cleanupInfo.totalNews} | Tin cũ (&gt;7 ngày): {cleanupInfo.oldNewsCount} | Sẽ giữ lại: {cleanupInfo.willKeep}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Tin tức cũ hơn {cleanupInfo.daysOld} ngày sẽ được xóa tự động khi cập nhật tin mới
                </div>
              </div>
            )}
          </div>

          {/* News Management Controls */}
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
                <input
                  type="text"
                  placeholder="Tìm kiếm tin tức..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ margin: 0 }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ margin: 0 }}
                >
                  <option value="all">Tất cả danh mục</option>
                  <option value="Communications">Communications</option>
                  <option value="IoT">IoT</option>
                  <option value="Embedded">Embedded</option>
                  <option value="AI">AI</option>
                  <option value="Hardware">Hardware</option>
                </select>
              </div>
              <button
                className="btn btn-danger"
                onClick={handleDeleteAllNews}
                style={{ marginLeft: 'auto' }}
              >
                <i className="fas fa-trash"></i>
                {showDeleteConfirm ? 'Xác nhận xóa tất cả' : 'Xóa tất cả'}
              </button>
            </div>
          </div>

          {/* News Table */}
          {newsLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <i className="fas fa-spinner fa-spin"></i>
              <p>Đang tải tin tức...</p>
            </div>
          ) : newsError ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
              <i className="fas fa-exclamation-triangle"></i>
              <p>Lỗi tải tin tức: {newsError}</p>
            </div>
          ) : news.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <i className="fas fa-newspaper"></i>
              <p>Chưa có tin tức nào</p>
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Tiêu đề</th>
                    <th>Nguồn</th>
                    <th>Danh mục</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {news.map((item) => (
                    <tr key={item.id}>
                      <td>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                      <td style={{ maxWidth: '300px', wordWrap: 'break-word' }}>
                        <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{item.title}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          {item.excerpt?.substring(0, 100)}...
                        </div>
                      </td>
                      <td>{item.source}</td>
                      <td>
                        <span className="status-badge status-confirmed">{item.category}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => item.link && window.open(item.link, '_blank')}
                            title="Xem bài gốc"
                          >
                            <i className="fas fa-external-link-alt"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              if (confirm('Bạn có chắc muốn xóa tin tức này?')) {
                                handleDeleteNews(item.id);
                              }
                            }}
                            disabled={deletingNews === item.id}
                            title="Xóa tin tức"
                          >
                            <i className={`fas ${deletingNews === item.id ? 'fa-spinner fa-spin' : 'fa-trash'}`}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    Hiển thị {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, pagination.total)} trong {pagination.total} tin tức
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <i className="fas fa-chevron-left"></i> Trước
                    </button>
                    <span style={{ padding: '0.5rem 1rem', color: 'var(--text-secondary)' }}>
                      Trang {currentPage} / {pagination.pages}
                    </span>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                      disabled={currentPage === pagination.pages}
                    >
                      Sau <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
}













