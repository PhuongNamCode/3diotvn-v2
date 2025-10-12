'use client';

import { useState, useEffect } from 'react';

interface NewsletterSubscription {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  subscribedAt: string;
  source: string | null;
  createdAt: string;
  updatedAt: string;
}

interface NewsletterStats {
  total: number;
  active: number;
  unsubscribed: number;
  bounced: number;
  todaySubscriptions: number;
  weekSubscriptions: number;
}

export default function AdminNewsletterTab() {
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [stats, setStats] = useState<NewsletterStats>({
    total: 0,
    active: 0,
    unsubscribed: 0,
    bounced: 0,
    todaySubscriptions: 0,
    weekSubscriptions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);

  const limit = 20;

  useEffect(() => {
    fetchSubscriptions();
    fetchStats();
  }, [page, statusFilter, searchTerm]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: statusFilter,
        search: searchTerm,
      });

      const response = await fetch(`/api/newsletter?${params}`);
      const data = await response.json();

      if (data.success) {
        setSubscriptions(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching newsletter subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/newsletter/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching newsletter stats:', error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/newsletter/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setSubscriptions(prev =>
          prev.map(sub => sub.id === id ? { ...sub, status: newStatus as any } : sub)
        );
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error updating subscription status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedSubscriptions.length === 0) return;

    try {
      const response = await fetch('/api/newsletter/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedSubscriptions,
          action: bulkAction,
        }),
      });

      if (response.ok) {
        setSelectedSubscriptions([]);
        setBulkAction('');
        fetchSubscriptions();
        fetchStats();
        alert('Thao tác thành công');
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Có lỗi xảy ra khi thực hiện thao tác');
    }
  };

  const exportSubscriptions = async () => {
    try {
      const response = await fetch('/api/newsletter/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter-subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setShowExportModal(false);
    } catch (error) {
      console.error('Error exporting subscriptions:', error);
      alert('Có lỗi xảy ra khi xuất dữ liệu');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { text: 'Hoạt động', class: 'status-active' },
      unsubscribed: { text: 'Hủy đăng ký', class: 'status-unsubscribed' },
      bounced: { text: 'Bounced', class: 'status-bounced' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="admin-newsletter-tab">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-title">
            <h1>
              <i className="fas fa-envelope"></i>
              Quản lý Newsletter
            </h1>
            <p>Theo dõi và quản lý đăng ký newsletter</p>
          </div>
          <div className="admin-header-actions">
            <button
              className="btn-secondary"
              onClick={() => setShowExportModal(true)}
            >
              <i className="fas fa-download"></i>
              Xuất dữ liệu
            </button>
            <button
              className="btn-primary"
              onClick={fetchSubscriptions}
            >
              <i className="fas fa-sync-alt"></i>
              Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="newsletter-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Tổng đăng ký</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.active}</div>
            <div className="stat-label">Đang hoạt động</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon unsubscribed">
            <i className="fas fa-times-circle"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.unsubscribed}</div>
            <div className="stat-label">Hủy đăng ký</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bounced">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.bounced}</div>
            <div className="stat-label">Bounced</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon today">
            <i className="fas fa-calendar-day"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.todaySubscriptions}</div>
            <div className="stat-label">Hôm nay</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon week">
            <i className="fas fa-calendar-week"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.weekSubscriptions}</div>
            <div className="stat-label">Tuần này</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="filters-left">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="unsubscribed">Hủy đăng ký</option>
            <option value="bounced">Bounced</option>
          </select>
        </div>
        <div className="filters-right">
          {selectedSubscriptions.length > 0 && (
            <div className="bulk-actions">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="bulk-select"
              >
                <option value="">Chọn thao tác</option>
                <option value="activate">Kích hoạt</option>
                <option value="unsubscribe">Hủy đăng ký</option>
                <option value="delete">Xóa</option>
              </select>
              <button
                className="btn-secondary"
                onClick={handleBulkAction}
                disabled={!bulkAction}
              >
                <i className="fas fa-check"></i>
                Thực hiện ({selectedSubscriptions.length})
              </button>
            </div>
          )}
          <button
            className="btn-secondary"
            onClick={() => setSelectedSubscriptions([])}
          >
            <i className="fas fa-times"></i>
            Bỏ chọn
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table newsletter-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedSubscriptions.length === subscriptions.length && subscriptions.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSubscriptions(subscriptions.map(sub => sub.id));
                    } else {
                      setSelectedSubscriptions([]);
                    }
                  }}
                />
              </th>
              <th>STT</th>
              <th>Email</th>
              <th>Trạng thái</th>
              <th>Nguồn</th>
              <th>Ngày đăng ký</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="loading-cell">
                  <div className="loading-spinner">
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang tải...
                  </div>
                </td>
              </tr>
            ) : subscriptions.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-cell">
                  <div className="empty-state">
                    <i className="fas fa-inbox"></i>
                    <p>Không có đăng ký nào</p>
                  </div>
                </td>
              </tr>
            ) : (
              subscriptions.map((subscription, index) => (
                <tr key={subscription.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedSubscriptions.includes(subscription.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubscriptions(prev => [...prev, subscription.id]);
                        } else {
                          setSelectedSubscriptions(prev => prev.filter(id => id !== subscription.id));
                        }
                      }}
                    />
                  </td>
                  <td>{(page - 1) * limit + index + 1}</td>
                  <td>
                    <div className="email-cell">
                      <i className="fas fa-envelope"></i>
                      {subscription.email}
                    </div>
                  </td>
                  <td>{getStatusBadge(subscription.status)}</td>
                  <td>
                    <span className="source-badge">
                      {subscription.source || 'N/A'}
                    </span>
                  </td>
                  <td>{formatDate(subscription.subscribedAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <select
                        value={subscription.status}
                        onChange={(e) => handleStatusChange(subscription.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="active">Hoạt động</option>
                        <option value="unsubscribed">Hủy đăng ký</option>
                        <option value="bounced">Bounced</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            className="btn-secondary"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <i className="fas fa-chevron-left"></i>
            Trước
          </button>
          <span className="pagination-info">
            Trang {page} / {totalPages}
          </span>
          <button
            className="btn-secondary"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Sau
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Xuất dữ liệu Newsletter</h3>
              <button
                className="modal-close"
                onClick={() => setShowExportModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>Bạn có muốn xuất tất cả dữ liệu đăng ký newsletter?</p>
              <div className="export-options">
                <label>
                  <input type="checkbox" defaultChecked />
                  Bao gồm email
                </label>
                <label>
                  <input type="checkbox" defaultChecked />
                  Bao gồm trạng thái
                </label>
                <label>
                  <input type="checkbox" defaultChecked />
                  Bao gồm ngày đăng ký
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowExportModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn-primary"
                onClick={exportSubscriptions}
              >
                <i className="fas fa-download"></i>
                Xuất CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
