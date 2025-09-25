"use client";

import { } from "react";
import { useEvents, useNews, useContacts, useStats } from "@/lib/hooks/useData";

export default function AdminOverviewTab() {
  const { stats, loading: statsLoading } = useStats();
  const { events } = useEvents();
  const { news } = useNews();
  const { contacts } = useContacts();

  

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

        {/* Moved from Analytics: Lượt truy cập */}
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <i className="fas fa-globe"></i>
            </div>
            <div className="stat-trend up">
              <i className="fas fa-arrow-up"></i>
              45%
            </div>
          </div>
          <div className="stat-number">15,248</div>
          <div className="stat-label">Lượt truy cập</div>
        </div>
      </div>

      

      {/* Recent Activity */}
      <div className="table-container">
        <div className="table-header">
          <h3 className="table-title">Hoạt động gần đây</h3>
          <div className="table-actions">
            <button className="btn btn-secondary">
              <i className="fas fa-refresh"></i>
              Refresh
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
              <tr>
                <td>2 phút trước</td>
                <td>Đăng ký sự kiện "IoT Security Workshop"</td>
                <td>Nguyễn Văn A</td>
                <td><span className="status-badge status-confirmed">Xác nhận</span></td>
              </tr>
              <tr>
                <td>5 phút trước</td>
                <td>Liên hệ hợp tác mới</td>
                <td>Tech Corp Ltd</td>
                <td><span className="status-badge status-pending">Chờ xử lý</span></td>
              </tr>
              <tr>
                <td>10 phút trước</td>
                <td>Tạo sự kiện mới "AI Workshop"</td>
                <td>Admin</td>
                <td><span className="status-badge status-confirmed">Hoàn thành</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
