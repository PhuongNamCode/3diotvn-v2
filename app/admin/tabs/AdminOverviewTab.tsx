"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useEvents, useNews, useContacts, useStats } from "@/lib/hooks/useData";

export default function AdminOverviewTab() {
  const { stats, loading: statsLoading } = useStats();
  const { events } = useEvents();
  const { news } = useNews();
  const { contacts } = useContacts();

  type ActivityItem = {
    id: string;
    time: string; // ISO
    type: "registration" | "contact" | "event";
    description: string;
    user: string;
    status: "confirmed" | "pending" | "completed" | string;
  };

  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loadingActivity, setLoadingActivity] = useState<boolean>(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'registration' | 'contact' | 'event'>('all');
  const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | '30d' | 'all'>('all');

  const fetchRecentActivity = useCallback(async () => {
    setLoadingActivity(true);
    setActivityError(null);
    try {
      const [regsRes, contactsRes, eventsRes] = await Promise.all([
        fetch('/api/registrations', { cache: 'no-store' }),
        fetch('/api/contacts', { cache: 'no-store' }),
        fetch('/api/events', { cache: 'no-store' }),
      ]);

      if (!regsRes.ok || !contactsRes.ok || !eventsRes.ok) {
        throw new Error('Không thể tải hoạt động gần đây');
      }

      const regsJson = await regsRes.json();
      const contactsJson = await contactsRes.json();
      const eventsJson = await eventsRes.json();

      const regs: any[] = Array.isArray(regsJson?.data) ? regsJson.data : [];
      const cons: any[] = Array.isArray(contactsJson?.data) ? contactsJson.data : [];
      const evts: any[] = Array.isArray(eventsJson?.data) ? eventsJson.data : [];

      const regActivities: ActivityItem[] = regs.map((r) => ({
        id: String(r.id),
        time: r.createdAt || new Date().toISOString(),
        type: "registration",
        description: `Đăng ký sự kiện từ ${r.fullName || r.email || 'N/A'}`,
        user: r.fullName || r.email || 'N/A',
        status: r.status || 'pending',
      }));

      const contactActivities: ActivityItem[] = cons.map((c) => ({
        id: String(c.id),
        time: c.createdAt || new Date().toISOString(),
        type: "contact",
        description: `Liên hệ ${c.type} từ ${c.name || c.email || 'N/A'}`,
        user: c.name || c.email || 'N/A',
        status: c.status || 'pending',
      }));

      const eventActivities: ActivityItem[] = evts.map((e) => ({
        id: String(e.id),
        time: e.createdAt || new Date().toISOString(),
        type: "event",
        description: `Tạo sự kiện "${e.title}" (${e.category})`,
        user: 'Admin',
        status: e.status === 'upcoming' ? 'confirmed' : e.status === 'past' ? 'completed' : 'pending',
      }));

      const merged = [...regActivities, ...contactActivities, ...eventActivities]
        .filter((i) => !!i.time)
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 20);

      setActivity(merged);
    } catch (e: any) {
      setActivityError(e?.message || 'Có lỗi xảy ra');
    } finally {
      setLoadingActivity(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentActivity();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchRecentActivity();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchRecentActivity]);

  const filteredActivity = useMemo(() => {
    let list = activity;
    if (typeFilter !== 'all') {
      list = list.filter((a) => a.type === typeFilter);
    }
    if (timeFilter !== 'all') {
      const now = Date.now();
      const ms = timeFilter === '24h' ? 24*60*60*1000 : timeFilter === '7d' ? 7*24*60*60*1000 : 30*24*60*60*1000;
      list = list.filter((a) => {
        const t = new Date(a.time).getTime();
        return now - t <= ms;
      });
    }
    return list;
  }, [activity, typeFilter, timeFilter]);

  return (
    <div className="admin-overview">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <i className="fas fa-calendar-check"></i>
            </div>
            <div className="stat-trend up">
              <i className="fas fa-arrow-up"></i>
              12%
            </div>
          </div>
          <div className="stat-number">{stats?.totalEvents || 0}</div>
          <div className="stat-label">Tổng sự kiện</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-trend up">
              <i className="fas fa-arrow-up"></i>
              8%
            </div>
          </div>
          <div className="stat-number">{stats?.totalRegistrations || 0}</div>
          <div className="stat-label">Đăng ký tham gia</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <i className="fas fa-handshake"></i>
            </div>
            <div className="stat-trend up">
              <i className="fas fa-arrow-up"></i>
              25%
            </div>
          </div>
          <div className="stat-number">{stats?.totalContacts || 0}</div>
          <div className="stat-label">Đối tác hợp tác</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <i className="fas fa-newspaper"></i>
            </div>
            <div className="stat-trend up">
              <i className="fas fa-arrow-up"></i>
              15%
            </div>
          </div>
          <div className="stat-number">{stats?.publishedNews || 0}</div>
          <div className="stat-label">Tin tức đã đăng</div>
        </div>

      </div>

      

      {/* Recent Activity */}
      <div className="table-container">
        <div className="table-header">
          <h3 className="table-title">Hoạt động gần đây</h3>
          <div className="table-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="filter-group" style={{ display: 'flex', gap: 6 }}>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} aria-label="Lọc theo loại">
                <option value="all">Tất cả loại</option>
                <option value="registration">Đăng ký</option>
                <option value="contact">Liên hệ</option>
                <option value="event">Sự kiện</option>
              </select>
              <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value as any)} aria-label="Khoảng thời gian">
                <option value="all">Mọi thời gian</option>
                <option value="24h">24 giờ qua</option>
                <option value="7d">7 ngày qua</option>
                <option value="30d">30 ngày qua</option>
              </select>
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                fetchRecentActivity().then(() => {
                  try { (window as any).showNotification?.('Đã làm mới hoạt động gần đây', 'success'); } catch {}
                });
              }}
              disabled={loadingActivity}
              title="Làm mới"
            >
              <i className={loadingActivity ? "fas fa-spinner fa-spin" : "fas fa-refresh"}></i>
              {loadingActivity ? ' Đang tải...' : ' Refresh'}
            </button>
          </div>
        </div>
        <div className="table-content">
          <table className="data-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Hoạt động</th>
                <th>Người dùng</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {activityError && (
                <tr>
                  <td colSpan={4} style={{ color: 'var(--danger)' }}>{activityError}</td>
                </tr>
              )}
              {!activityError && filteredActivity.length === 0 && (
                <tr>
                  <td colSpan={4}>Chưa có hoạt động nào</td>
                </tr>
              )}
              {!activityError && filteredActivity.map((item) => {
                const date = new Date(item.time);
                const timeLabel = date.toLocaleString('vi-VN', { hour12: false });
                const statusClass = item.status === 'confirmed' || item.status === 'completed' ? 'status-confirmed' : item.status === 'pending' ? 'status-pending' : '';
                const statusText = item.status === 'completed' ? 'Hoàn thành' : item.status === 'confirmed' ? 'Xác nhận' : item.status === 'pending' ? 'Chờ xử lý' : String(item.status);
                return (
                  <tr key={`${item.type}-${item.id}`}>
                    <td>{timeLabel}</td>
                    <td>{item.description}</td>
                    <td>{item.user}</td>
                    <td><span className={`status-badge ${statusClass}`}>{statusText}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
